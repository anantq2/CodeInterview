import { requireAuth, clerkClient } from "@clerk/express"; // 1. Import clerkClient
import User from "../models/User.js";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const { userId } = req.auth; // get userId from auth object

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized - invalid token" });
      }

      // 1. Try to find user in db
      let user = await User.findOne({ clerkId: userId });

      // 2. THE FIX: If user is missing, create them instead of erroring
      if (!user) {
        console.log("User not found in DB. Syncing from Clerk...");
        
        // Fetch user details from Clerk
        const clerkUser = await clerkClient.users.getUser(userId);
        
        // Create user in MongoDB
        user = await User.create({
          clerkId: userId,
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
          email: clerkUser.emailAddresses[0].emailAddress,
          profileImage: clerkUser.imageUrl,
        });

        console.log("User synced to DB:", user._id);
      }

      // 3. Attach user to req and proceed
      req.user = user;
      next();
      
    } catch (error) {
      console.error("Error in protectRoute middleware", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
];