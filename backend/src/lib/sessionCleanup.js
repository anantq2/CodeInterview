import Session from "../models/Session.js";
import { chatClient, streamClient } from "./stream.js";

export const SESSION_IDLE_TIMEOUT_MS = 5 * 60 * 1000;

export const getInactiveCutoff = () => new Date(Date.now() - SESSION_IDLE_TIMEOUT_MS);

export const markSessionActive = (session) => {
  session.lastActivityAt = new Date();
};

export const isSessionInactive = (session) => {
  if (!session || session.status !== "active") return false;

  const lastActivity = session.lastActivityAt || session.updatedAt || session.createdAt;
  if (!lastActivity) return false;

  return lastActivity.getTime() < Date.now() - SESSION_IDLE_TIMEOUT_MS;
};

export const completeSession = async (session) => {
  if (!session || session.status !== "active") return false;

  if (session.callId) {
    const call = streamClient.video.call("default", session.callId);
    await call.delete({ hard: true }).catch(() => {});

    const channel = chatClient.channel("messaging", session.callId);
    await channel.delete().catch(() => {});
  }

  session.status = "completed";
  session.endedAt = session.endedAt || new Date();
  await session.save();
  return true;
};

export const completeSessionIfInactive = async (session) => {
  if (!isSessionInactive(session)) return false;
  return completeSession(session);
};

export const completeInactiveSessions = async () => {
  const cutoff = getInactiveCutoff();
  const inactiveSessions = await Session.find({
    status: "active",
    $or: [
      { lastActivityAt: { $lt: cutoff } },
      { lastActivityAt: { $exists: false }, updatedAt: { $lt: cutoff } },
    ],
  });

  let completedCount = 0;
  for (const session of inactiveSessions) {
    try {
      const completed = await completeSession(session);
      if (completed) completedCount += 1;
    } catch (error) {
      console.error(`Failed to complete inactive session ${session._id}:`, error.message);
    }
  }

  return completedCount;
};
