import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  debateHistory: [String],
  role: { type: String, enum: ["Learner", "Student", "Professional"], default: "Learner" },
  points: { type: Number, default: 0 },
  badges: [String],
});

export default mongoose.model("User", UserSchema);
