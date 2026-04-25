import { WebSocketServer } from "ws";
import * as Y from "yjs";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import YjsDocument from "../models/YjsDocument.js";

// Message types used in the Yjs WebSocket protocol
const MSG_SYNC = 0;
const MSG_AWARENESS = 1;

// In-memory map of active Yjs documents (roomName -> YjsRoom)
const rooms = new Map();

/**
 * Represents a single Yjs collaboration room.
 * Each active session has one room with a shared Y.Doc.
 */
class YjsRoom {
  constructor(roomName) {
    this.roomName = roomName;
    this.doc = new Y.Doc();
    this.awareness = new awarenessProtocol.Awareness(this.doc);
    this.conns = new Map(); // WebSocket -> Set of awarenessIds

    // Debounce persistence to avoid thrashing MongoDB
    this._persistTimeout = null;

    // When document updates, broadcast to all connected clients + schedule persist
    this.doc.on("update", (update, origin) => {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, MSG_SYNC);
      syncProtocol.writeUpdate(encoder, update);
      const message = encoding.toUint8Array(encoder);

      this.conns.forEach((_, conn) => {
        if (conn !== origin && conn.readyState === 1) {
          try {
            conn.send(message);
          } catch (e) {
            // Connection may have closed
          }
        }
      });

      this._schedulePersist();
    });

    // Broadcast awareness changes
    this.awareness.on("update", ({ added, updated, removed }) => {
      const changedClients = added.concat(updated, removed);
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, MSG_AWARENESS);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients)
      );
      const message = encoding.toUint8Array(encoder);

      this.conns.forEach((_, conn) => {
        if (conn.readyState === 1) {
          try {
            conn.send(message);
          } catch (e) {
            // ignore
          }
        }
      });
    });
  }

  /**
   * Schedule a debounced persist to MongoDB (2 seconds after last update).
   */
  _schedulePersist() {
    if (this._persistTimeout) clearTimeout(this._persistTimeout);
    this._persistTimeout = setTimeout(() => this._persist(), 2000);
  }

  /**
   * Save current Yjs document state to MongoDB.
   */
  async _persist() {
    try {
      const stateVector = Y.encodeStateAsUpdate(this.doc);
      await YjsDocument.findOneAndUpdate(
        { roomName: this.roomName },
        { docState: Buffer.from(stateVector) },
        { upsert: true }
      );
    } catch (error) {
      console.error(`[Yjs] Failed to persist room ${this.roomName}:`, error.message);
    }
  }

  /**
   * Load saved state from MongoDB into the Y.Doc.
   */
  async loadFromDB() {
    try {
      const saved = await YjsDocument.findOne({ roomName: this.roomName });
      if (saved?.docState) {
        Y.applyUpdate(this.doc, new Uint8Array(saved.docState));
        console.log(`[Yjs] Loaded saved state for room: ${this.roomName}`);
      }
    } catch (error) {
      console.error(`[Yjs] Failed to load room ${this.roomName}:`, error.message);
    }
  }

  /**
   * Add a new WebSocket connection to this room.
   */
  addConn(conn) {
    this.conns.set(conn, new Set());

    // Send current doc state to the new client (sync step 1)
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, MSG_SYNC);
    syncProtocol.writeSyncStep1(encoder, this.doc);
    conn.send(encoding.toUint8Array(encoder));

    // Send current awareness states
    const awarenessStates = this.awareness.getStates();
    if (awarenessStates.size > 0) {
      const awarenessEncoder = encoding.createEncoder();
      encoding.writeVarUint(awarenessEncoder, MSG_AWARENESS);
      encoding.writeVarUint8Array(
        awarenessEncoder,
        awarenessProtocol.encodeAwarenessUpdate(
          this.awareness,
          Array.from(awarenessStates.keys())
        )
      );
      conn.send(encoding.toUint8Array(awarenessEncoder));
    }
  }

  /**
   * Remove a WebSocket connection from this room.
   */
  removeConn(conn) {
    const controlledIds = this.conns.get(conn);
    this.conns.delete(conn);

    // Clean up awareness for the disconnected client
    if (controlledIds && controlledIds.size > 0) {
      awarenessProtocol.removeAwarenessStates(
        this.awareness,
        Array.from(controlledIds),
        null
      );
    }

    // If no connections left, persist and clean up after a delay
    if (this.conns.size === 0) {
      setTimeout(async () => {
        if (this.conns.size === 0) {
          await this._persist();
          this.doc.destroy();
          rooms.delete(this.roomName);
          console.log(`[Yjs] Room destroyed: ${this.roomName}`);
        }
      }, 30000); // Keep room alive for 30s in case of quick reconnects
    }
  }

  /**
   * Handle an incoming message from a client.
   */
  handleMessage(conn, message) {
    try {
      const decoder = decoding.createDecoder(new Uint8Array(message));
      const messageType = decoding.readVarUint(decoder);

      switch (messageType) {
        case MSG_SYNC: {
          const encoder = encoding.createEncoder();
          encoding.writeVarUint(encoder, MSG_SYNC);
          syncProtocol.readSyncMessage(decoder, encoder, this.doc, conn);
          // Only send response if there's content beyond the message type header
          if (encoding.length(encoder) > 1) {
            conn.send(encoding.toUint8Array(encoder));
          }
          break;
        }

        case MSG_AWARENESS: {
          const update = decoding.readVarUint8Array(decoder);
          awarenessProtocol.applyAwarenessUpdate(this.awareness, update, conn);
          break;
        }

        default:
          console.warn(`[Yjs] Unknown message type: ${messageType}`);
      }
    } catch (error) {
      console.error(`[Yjs] Error handling message:`, error.message);
    }
  }
}

/**
 * Get or create a Yjs room for the given room name.
 */
async function getOrCreateRoom(roomName) {
  if (rooms.has(roomName)) {
    return rooms.get(roomName);
  }

  const room = new YjsRoom(roomName);
  rooms.set(roomName, room);
  await room.loadFromDB();
  return room;
}

/**
 * Set up the Yjs WebSocket server on the same HTTP server as Express.
 * y-websocket client connects to ws://host/yjs/<roomName>
 */
export function setupYjsWebSocket(httpServer) {
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on("upgrade", (request, socket, head) => {
    // Parse the URL to check if this is a Yjs connection
    const url = new URL(request.url, `http://${request.headers.host}`);

    // y-websocket connects to serverUrl/roomName
    // We'll configure our client's serverUrl to be 'ws://host/yjs'
    // So the request will come in as '/yjs/roomName'
    if (url.pathname.startsWith("/yjs/")) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      // Not a Yjs connection — let other handlers deal with it, or destroy
      socket.destroy();
    }
  });

  wss.on("connection", async (conn, request) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    // Extract room name from path /yjs/roomName
    const roomName = url.pathname.slice("/yjs/".length);

    if (!roomName) {
      conn.close(4000, "Missing room name in path");
      return;
    }

    console.log(`[Yjs] Client connected to room: ${roomName}`);

    try {
      const room = await getOrCreateRoom(roomName);
      room.addConn(conn);

      conn.on("message", (message) => {
        room.handleMessage(conn, message);
      });

      conn.on("close", () => {
        room.removeConn(conn);
        console.log(`[Yjs] Client disconnected from room: ${roomName}`);
      });

      conn.on("error", (error) => {
        console.error(`[Yjs] WebSocket error in room ${roomName}:`, error.message);
        room.removeConn(conn);
      });
    } catch (error) {
      console.error(`[Yjs] Failed to setup connection for room ${roomName}:`, error.message);
      conn.close(4001, "Server error");
    }
  });

  console.log("[Yjs] WebSocket server attached to HTTP server on /yjs");
}
