import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { createServer } from "http";
import axios from "axios";
import authRoutes from "./routes/authRoutes.js";
import jwt from "jsonwebtoken";


dotenv.config(); // ✅ Load environment variables

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: " http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`📩 [${req.method}] ${req.url}`);
  next();
});

// ✅ Load Environment Variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const API_KEY = process.env.API_KEY;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing in .env file");
  process.exit(1);
}

if (!API_KEY) {
  console.error("❌ API_KEY is missing in .env file");
  process.exit(1);
}

// ✅ AI API URL
const AI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

// ✅ Connect to MongoDB
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

// ✅ Auth Routes
app.use("/api/auth", authRoutes);

// ✅ Chat Schema & Model
const ChatSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Identify which user owns the chat
  messages: [
    {
      question: String,
      answer: String,
      timestamp: { type: Date, default: Date.now },
      points: { type: Number, default: 0 }, // ✅ Add points
      badges: { type: [String], default: [] },
    },
  ],
});

const Chat = mongoose.model("Chat", ChatSchema);

// ✅ Function to Format Debate Prompt
const formatDebatePrompt = (question, category = "General", tone = "Neutral") => {
  return `You are an AI debate partner. 
  - Debate Level: ${category}
  - Response Tone: ${tone}
  - User's Question: ${question}
  
  Provide a response in the chosen debate level and tone.`;
};


const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from headers

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    req.user = decoded; // Attach user details to request
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

app.get("/api/debate/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const userChats = await Chat.findOne({ userId });

    if (!userChats) {
      return res.json({ history: [] });
    }

    // Extracting only questions from the messages array
    const history = userChats.messages.map((msg) => msg.question);

    res.json({ history });
  } catch (error) {
    console.error("❌ Error fetching user chat history:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/chat/messages", async (req, res) => {
  try {
    const { userId, question, responseStyle, tone } = req.query;
    if (!userId || !question) {
      return res.status(400).json({ error: "User ID and question are required" });
    }

    // Fetch user chat history based on question
    const userChats = await Chat.findOne({ userId });
    if (!userChats) {
      return res.json({ messages: [] });
    }

    let filteredMessages = userChats.messages.filter((msg) => msg.question === question);

    // Apply filters if provided
    if (responseStyle) {
      filteredMessages = filteredMessages.filter((msg) =>
        msg.answer.includes(responseStyle)
      );
    }

    if (tone) {
      filteredMessages = filteredMessages.filter((msg) => msg.answer.includes(tone));
    }

    res.json({ messages: filteredMessages });
  } catch (error) {
    console.error("❌ Error fetching filtered chat messages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



// ✅ Chat API Route (AI API Call & MongoDB Storage)
app.post("/api/chat", async (req, res) => {
  try {
    const { question, userId , category, tone } = req.body;
    if (!question) return res.status(400).json({ error: "Question is required" });
    
    const debatePrompt = formatDebatePrompt(question, category, tone);
    console.log("📩 AI Request:", { prompt: debatePrompt }); // ✅ Add points for each chat
    // ✅ Call AI API
    const response = await axios.post(
      AI_API_URL,
      { contents: [{ parts: [{ text: debatePrompt }] }] },
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("✅ AI API Response:", JSON.stringify(response.data, null, 2));

    // ✅ Extract AI Response Safely
    let aiResponse = "No response from AI";
    if (response.data && response.data.candidates?.length > 0) {
      aiResponse = response.data.candidates[0]?.content?.parts?.[0]?.text || aiResponse;
    }

    console.log("🤖 Extracted AI Response:", aiResponse);

    // ✅ Save chat to MongoDB
    try {
      const newChat = new Chat({ userId, question, answer: aiResponse });
      await newChat.save();
      console.log("💾 Chat saved to MongoDB");
    } catch (mongoError) {
      console.error("❌ MongoDB Save Error:", mongoError.message);
    }
    const chat = await Chat.findOneAndUpdate(
      { userId }, // Find the document by userId
      { 
        $push: { messages: { question, answer: aiResponse, timestamp: new Date() } } 
      }, 
      { new: true, upsert: true } // Create a new document if none exists
    );

    res.json({ reply: aiResponse, category, tone});

  } catch (error) {
    console.error("❌ AI API Error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.response?.data || error.message,
    });
  }
});

app.post("/api/points/claim", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // ✅ Increase points
    user.points += 10;

    // ✅ Check for badge unlocks
    if (user.points >= 100 && !user.badges.includes("Debate Master")) {
      user.badges.push("Debate Master");
    }
    if (user.points >= 50 && !user.badges.includes("Active Debater")) {
      user.badges.push("Active Debater");
    }

    await user.save();

    res.json({ points: user.points, badges: user.badges });
  } catch (error) {
    console.error("❌ Error claiming points:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// ✅ WebSocket (Socket.io) Setup
io.on("connection", (socket) => {
  console.log("⚡ New WebSocket Connection");

  socket.on("chatMessage", (data) => {
    console.log("📩 Received Message:", data);
    io.emit("chatMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("⚠️ User Disconnected");
  });
});

// ✅ Start Server
httpServer.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
