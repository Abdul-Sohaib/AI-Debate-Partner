import axios from "axios";

const API_URL = "http://localhost:5000/api/user"; // Adjust if using a different backend URL

// ✅ Function to update user points
export const updateUserPoints = async (userId, question, answer) => {
  try {
    const response = await axios.post(`${API_URL}/update-points`, {
      userId,
      question,
      answer,
    });
    return response.data; // Returns { points, badges, message }
  } catch (error) {
    console.error("❌ Error updating points:", error.response?.data || error.message);
    return null;
  }
};
