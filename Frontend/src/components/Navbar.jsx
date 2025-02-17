/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TbLogout } from "react-icons/tb";
import { IoStarOutline } from "react-icons/io5";
import { GiHamburgerMenu } from "react-icons/gi";
import axios from "axios"; 

// eslint-disable-next-line no-unused-vars
const Navbar = ({ user, onLogout, token }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [debateHistory, setDebateHistory] = useState([]); // Stores user debate history
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);

  // Generate a random avatar for new users
  const avatarUrl = user?.profilePic || `https://api.dicebear.com/9.x/lorelei/png?seed=${user?.name || "Guest"}`;

  // Logout function
  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  // Fetch user debate history when sidebar opens
  const fetchDebateHistory = async () => {
    if (!user?._id) return;

    try {
      const response = await axios.get(`http://localhost:5000/api/debate/history/${user._id}`);
      setDebateHistory(response.data.history || []);
    } catch (error) {
      console.error("❌ Error fetching debate history:", error);
    }
  };

  // Close dropdown or sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !event.target.closest("#hamburger-icon")
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handlePointsClick = () => {
    alert(`comming soon........`);// ✅ Navigate to Points.jsx
  };

  return (
    <>
      {/* Navbar */}
      <nav className="flex justify-between items-center p-3 text-textcolor bg-secondary rounded-lg backdrop-filter backdrop-blur-[10px] shadow-[0_2px_10px_rgba(255,255,255,0.3)]">
        {/* Hamburger Menu Icon */}
        <div id="hamburger-icon">
          <GiHamburgerMenu
            size={25}
            className="cursor-pointer ml-2"
            onClick={() => {
              setSidebarOpen(!sidebarOpen);
              if (!sidebarOpen) fetchDebateHistory(); // Fetch debate history when opening sidebar
            }}
          />
        </div>

        {/* Web App Name */}
        <h1 className="text-3xl font-bold">Debatra</h1>

        {/* Profile Section */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1 bg-transparent border-2 border-textcolor rounded-lg shadow-[3px_4px_0px_#808080] transition-all duration-200 ease-in-out active:shadow-none active:translate-x-1 active:translate-y-1 font-main"
          >
            <span>{user?.name || "User"}</span>
            <img src={avatarUrl} alt="Profile" className="w-8 h-8 rounded-full" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-4 text-textcolor w-48 flex flex-col gap-2 justify-center items-center p-5 rounded-lg bg-textcolor/5 backdrop-filter backdrop-blur-[10px] shadow-[3px_4px_0px_#808080] transition-all duration-200 ease-in-out z-50">
              <p className="text-center font-bold bg-transparent text-textcolor  font-main">{user?.role || "No Type Selected"}</p>
              
              <button
                className="flex justify-center items-center gap-2 w-full bg-transparent border-2 border-textcolor rounded-lg shadow-[3px_4px_0px_#808080] transition-all duration-200 ease-in-out active:shadow-none active:translate-x-1 active:translate-y-1 font-main"
                onClick={(handlePointsClick)}
              >
                <IoStarOutline /> Points: {user?.points || 0}
              </button>
              <button
                className="w-full flex justify-center items-center gap-2 bg-transparent border-2 border-textcolor rounded-lg shadow-[3px_4px_0px_#808080] transition-all duration-200 ease-in-out active:shadow-none active:translate-x-1 active:translate-y-1 font-main"
                onClick={handleLogout}
              >
                <TbLogout /> Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Sidebar for Debate History */}
      <div
        ref={sidebarRef}
        className={`z-50 fixed top-2 left-0 h-[98vh] w-64 bg-primary border-2 border-textcolor rounded-lg shadow-lg text-textcolor p-5 transform transition-transform duration-300 ease-in-out flex flex-col backdrop-blur-xl ${
          sidebarOpen ? "translate-x-2" : "-translate-x-full"
        }`}
      >
        <h2 className="text-lg font-bold mb-4 text-center font-main">Your Debate History</h2>
        {debateHistory.length > 0 ? (
          <ul className="space-y-2 overflow-auto max-h-[80vh] p-3">
            {debateHistory.map((question, index) => (
              <li key={index} className="p-2 text-sm bg-transparent border-2 border-textcolor rounded-lg shadow-[3px_4px_0px_#808080] transition-all duration-200 ease-in-out active:shadow-none active:translate-x-1 active:translate-y-1 font-main cursor-pointer">
                {question}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-textcolor font-main">No debate history available.</p>
        )}
      </div>
    </>
  );
};

export default Navbar;
