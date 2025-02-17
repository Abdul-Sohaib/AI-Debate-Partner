import express from "express";
import User from "../models/user.js";
import { calculatePoints } from "../utils/pointSystem.js";

const router = express.Router();

// ✅ Update user points
router.post("/update-points", async (req, res) => {
  try {
    const { userId, question, answer } = req.body;
    if (!userId || !question || !answer) {
      return res.status(400).json({ error: "User ID, question, and answer are required" });
    }

    // Calculate points based on the question and answer
    const pointsEarned = calculatePoints(question, answer);
    
    // Find user and update points
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.points += pointsEarned;

    // Assign Badges
    if (user.points >= 100 && !user.badges.includes("Debate Master")) {
      user.badges.push("Debate Master");
    }
    if (user.points >= 200 && !user.badges.includes("Grand Debater")) {
      user.badges.push("Grand Debater");
    }
    
    await user.save();
    
    res.json({ points: user.points, badges: user.badges, message: "Points updated successfully" });
  } catch (error) {
    console.error("❌ Error updating user points:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Get user points and badges
router.get("/points/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ points: user.points, badges: user.badges });
  } catch (error) {
    console.error("❌ Error fetching user points:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
