import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";
import Session from "../models/Session.js";
import { chatClient, streamClient } from "./stream.js";
import { deleteStreamUser, upsertStreamUser } from "./stream.js";

export const inngest = new Inngest({ id: "CodeInterview" });

const syncUser = inngest.createFunction(
  { id: "sync-user" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    await connectDB();

    const { id, email_addresses, first_name, last_name, image_url } = event.data;

    const newUser = {
      clerkId: id,
      email: email_addresses[0]?.email_address,
      name: `${first_name || ""} ${last_name || ""}`,
      profileImage: image_url,
    };

    await User.create(newUser);

    await upsertStreamUser({
      id: newUser.clerkId.toString(),
      name: newUser.name,
      image: newUser.profileImage,
    });
  }
);

const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user-from-db" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await connectDB();

    const { id } = event.data;
    await User.deleteOne({ clerkId: id });

    await deleteStreamUser(id.toString());
  }
);

// Auto-cleanup stale sessions (active for more than 3 hours)
const cleanupStaleSessions = inngest.createFunction(
  { id: "cleanup-stale-sessions" },
  { cron: "0 * * * *" }, // runs every hour
  async () => {
    await connectDB();

    const cutoff = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago
    const staleSessions = await Session.find({
      status: "active",
      createdAt: { $lt: cutoff },
    });

    for (const session of staleSessions) {
      try {
        // cleanup Stream resources
        if (session.callId) {
          const call = streamClient.video.call("default", session.callId);
          await call.delete({ hard: true }).catch(() => {});

          const channel = chatClient.channel("messaging", session.callId);
          await channel.delete().catch(() => {});
        }

        session.status = "completed";
        await session.save();
      } catch (error) {
        console.error(`Failed to cleanup session ${session._id}:`, error.message);
      }
    }

    console.log(`Cleaned up ${staleSessions.length} stale session(s)`);
  }
);

export const functions = [syncUser, deleteUserFromDB, cleanupStaleSessions];
