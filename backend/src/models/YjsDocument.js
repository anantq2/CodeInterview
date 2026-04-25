import mongoose from "mongoose";

const yjsDocumentSchema = new mongoose.Schema(
  {
    // The session's callId is used as the room identifier
    roomName: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // Binary Yjs document state (encoded as Buffer)
    docState: {
      type: Buffer,
      default: null,
    },
  },
  { timestamps: true }
);

const YjsDocument = mongoose.model("YjsDocument", yjsDocumentSchema);

export default YjsDocument;
