import crypto from "crypto";
import { chatClient, streamClient } from "../lib/stream.js";
import Session from "../models/Session.js";

export async function createSession(req, res) {
  try {
    const { problem, difficulty, isPrivate } = req.body;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    if (!problem || !difficulty) {
      return res.status(400).json({ message: "Problem and difficulty are required" });
    }

    // generate a unique call id for stream video
    const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // generate invite code for private sessions
    const inviteCode = isPrivate ? crypto.randomBytes(4).toString("hex") : "";

    // create session in db
    const session = await Session.create({
      problem,
      difficulty,
      host: userId,
      callId,
      isPrivate: !!isPrivate,
      inviteCode,
      problemId: req.body.problemId || "",
    });

    // create stream video call
    await streamClient.video.call("default", callId).getOrCreate({
      data: {
        created_by_id: clerkId,
        custom: { problem, difficulty, sessionId: session._id.toString() },
      },
    });

    // chat messaging
    const channel = chatClient.channel("messaging", callId, {
      name: `${problem} Session`,
      created_by_id: clerkId,
      members: [clerkId],
    });

    await channel.create();

    res.status(201).json({ session });
  } catch (error) {
    console.log("Error in createSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getActiveSessions(_, res) {
  try {
    // only return public active sessions — private ones are join-by-invite only
    const sessions = await Session.find({ status: "active", isPrivate: { $ne: true } })
      .populate("host", "name profileImage email clerkId")
      .populate("participant", "name profileImage email clerkId")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.log("Error in getActiveSessions controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyRecentSessions(req, res) {
  try {
    const userId = req.user._id;

    // get sessions where user is either host or participant
    const sessions = await Session.find({
      status: "completed",
      $or: [{ host: userId }, { participant: userId }],
    })
      .populate("host", "name profileImage email clerkId")
      .populate("participant", "name profileImage email clerkId")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.log("Error in getMyRecentSessions controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getSessionById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(id)
      .populate("host", "name email profileImage clerkId")
      .populate("participant", "name email profileImage clerkId");

    if (!session) return res.status(404).json({ message: "Session not found" });

    // for private sessions, only host or participant can view
    if (session.isPrivate) {
      const isHost = session.host._id.toString() === userId.toString();
      const isParticipant = session.participant?._id?.toString() === userId.toString();
      if (!isHost && !isParticipant) {
        return res.status(403).json({ message: "This is a private session. Use the invite code to join." });
      }
    }

    res.status(200).json({ session });
  } catch (error) {
    console.log("Error in getSessionById controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function joinSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.status !== "active") {
      return res.status(400).json({ message: "Cannot join a completed session" });
    }

    if (session.host.toString() === userId.toString()) {
      return res.status(400).json({ message: "Host cannot join their own session as participant" });
    }

    // for private sessions, require invite code
    if (session.isPrivate) {
      const { inviteCode } = req.body;
      if (!inviteCode || inviteCode !== session.inviteCode) {
        return res.status(403).json({ message: "Invalid invite code" });
      }
    }

    // check if session is already full - has a participant
    if (session.participant) return res.status(409).json({ message: "Session is full" });

    session.participant = userId;
    await session.save();

    const channel = chatClient.channel("messaging", session.callId);
    await channel.addMembers([clerkId]);

    res.status(200).json({ session });
  } catch (error) {
    console.log("Error in joinSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// join a session using invite code (for private sessions)
export async function joinByInviteCode(req, res) {
  try {
    const { inviteCode } = req.params;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    const session = await Session.findOne({ inviteCode, isPrivate: true });

    if (!session) return res.status(404).json({ message: "Invalid invite code" });

    if (session.status !== "active") {
      return res.status(400).json({ message: "This session has already ended" });
    }

    if (session.host.toString() === userId.toString()) {
      // host is re-opening their own session — just redirect
      return res.status(200).json({ session, alreadyIn: true });
    }

    if (session.participant) {
      // if current user is already the participant, let them rejoin
      if (session.participant.toString() === userId.toString()) {
        return res.status(200).json({ session, alreadyIn: true });
      }
      return res.status(409).json({ message: "Session is full" });
    }

    session.participant = userId;
    await session.save();

    const channel = chatClient.channel("messaging", session.callId);
    await channel.addMembers([clerkId]);

    res.status(200).json({ session });
  } catch (error) {
    console.log("Error in joinByInviteCode controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function saveCodeSnapshot(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { language, code } = req.body;

    if (!language || !code) {
      return res.status(400).json({ message: "Language and code are required" });
    }

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.status !== "active") {
      return res.status(400).json({ message: "Cannot save code to a completed session" });
    }

    // Replace existing snapshot for this user+language or add new
    const existingIdx = session.codeSnapshots.findIndex(
      (s) => s.userId?.toString() === userId.toString() && s.language === language
    );

    if (existingIdx >= 0) {
      session.codeSnapshots[existingIdx].code = code;
      session.codeSnapshots[existingIdx].savedAt = new Date();
    } else {
      session.codeSnapshots.push({ userId, language, code });
    }

    await session.save();
    res.status(200).json({ message: "Code saved" });
  } catch (error) {
    console.log("Error in saveCodeSnapshot controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function saveExecutionResult(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { language, code, output, success } = req.body;

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    session.executionResults.push({
      userId,
      language,
      code,
      output: (output || "").substring(0, 5000), // limit output size
      success: !!success,
    });

    // Keep only last 50 execution results per session
    if (session.executionResults.length > 50) {
      session.executionResults = session.executionResults.slice(-50);
    }

    await session.save();
    res.status(200).json({ message: "Execution result saved" });
  } catch (error) {
    console.log("Error in saveExecutionResult controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getSessionDetails(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(id)
      .populate("host", "name email profileImage clerkId")
      .populate("participant", "name email profileImage clerkId")
      .populate("codeSnapshots.userId", "name profileImage")
      .populate("executionResults.userId", "name profileImage");

    if (!session) return res.status(404).json({ message: "Session not found" });

    // Only host or participant can view session details
    const isHost = session.host._id.toString() === userId.toString();
    const isParticipant = session.participant?._id?.toString() === userId.toString();

    if (!isHost && !isParticipant) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json({ session });
  } catch (error) {
    console.log("Error in getSessionDetails controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function endSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    // check if user is the host
    if (session.host.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the host can end the session" });
    }

    // check if session is already completed
    if (session.status === "completed") {
      return res.status(400).json({ message: "Session is already completed" });
    }

    // Save final code snapshots if provided
    const { codeSnapshots } = req.body;
    if (codeSnapshots && Array.isArray(codeSnapshots)) {
      for (const snap of codeSnapshots) {
        // Replace existing snapshot for this user or add new
        const existingIdx = session.codeSnapshots.findIndex(
          (s) => s.userId?.toString() === userId.toString() && s.language === snap.language
        );
        if (existingIdx >= 0) {
          session.codeSnapshots[existingIdx].code = snap.code;
          session.codeSnapshots[existingIdx].savedAt = new Date();
        } else {
          session.codeSnapshots.push({
            userId,
            language: snap.language,
            code: snap.code,
          });
        }
      }
    }

    // delete stream video call
    const call = streamClient.video.call("default", session.callId);
    await call.delete({ hard: true });

    // delete stream chat channel
    const channel = chatClient.channel("messaging", session.callId);
    await channel.delete();

    session.status = "completed";
    session.endedAt = new Date();
    await session.save();

    res.status(200).json({ session, message: "Session ended successfully" });
  } catch (error) {
    console.log("Error in endSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
