import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import ChatComponent from "./ChatComponent";
import axios from "axios";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTone, setSelectedTone] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/");

        const response = await axios.get("http://localhost:5000/api/auth/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
        navigate("/");
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  //  Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  //  Handle tone selection
  const handleToneSelect = (tone) => {
    setSelectedTone(tone);
  };

  return (
    <div className="min-h-screen bg-primary">
      <div className="pt-2 pl-2 pr-2">
        <Navbar user={user} onLogout={handleLogout} />
      </div>

      <div className="p-5 text-center text-textcolor flex flex-col items-center gap-8 justify-center mt-5">
        <h2 className="text-2xl font-bold gap-2 flex justify-center items-center">
          <span className="bg-transparent border-textcolor rounded-lg p-2 shadow-[1px_2px_0px_#808080] flex justify-center items-center">HI,
             {user?.name}
          </span>
          <span>Select Category & the Tone to Debate</span>
        </h2>

        {/* Category Selection Buttons */}
        <div className="flex justify-center gap-4 items-center">
        <div className="flex justify-center gap-4 items-center">
          {["Beginner", "Intermediate", "Advanced"].map((category) => (
            <button
              key={category}
              onClick={() => handleCategorySelect(category.toLowerCase())}
              className={`relative px-6 py-3 text-lg font-bold text-textcolor bg-transparent border-2 border-textcolor rounded-lg shadow-[3px_4px_0px_#808080] transition-all duration-200 ease-in-out active:shadow-none active:translate-x-1 active:translate-y-1 font-main flex gap-2 justify-center items-center 
                ${selectedCategory === category.toLowerCase() ? "bg-gray-600 text-textcolor" : "bg-gray-600"}`}
            >
              {category}
            </button>
          ))}
        </div> 
        ||

        {/* Tone Selection Buttons */}
        <div className="flex justify-center gap-4 items-center">
          {["Humor", "Sarcastic", "Neutral"].map((tone) => (
            <button
              key={tone}
              onClick={() => handleToneSelect(tone.toLowerCase())}
              className={`relative px-6 py-3 text-lg font-bold text-textcolor bg-transparent border-2 border-textcolor rounded-lg shadow-[3px_4px_0px_#808080] transition-all duration-200 ease-in-out active:shadow-none active:translate-x-1 active:translate-y-1 font-main flex gap-2 justify-center items-center 
                ${selectedTone === tone.toLowerCase() ? "bg-gray-600 text-textcolor" : "bg-gray-600"}`}
            >
              {tone}
            </button>
          ))}
        </div>
        </div>
      </div>
      <div>
        <ChatComponent user={user} category={selectedCategory} tone={selectedTone} />
      </div>
    </div>
  );
};

export default Dashboard;
