/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import axios from "axios";

const Points = ({ userId }) => {
  const [points, setPoints] = useState(0);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const res = await axios.get(`/api/user/points/${userId}`);
        setPoints(res.data.points);
        setBadges(res.data.badges);
      } catch (error) {
        console.error("Error fetching points:", error);
      }
    };
    
    fetchPoints();
  }, [userId]);

  return (
    <div className="p-4 bg-black rounded-lg shadow-md">
      <h2 className="text-lg font-semibold">🎖 Your Points</h2>
      <p className="text-xl font-bold">{points}</p>
      <h3 className="text-md mt-3 font-semibold">🏅 Badges</h3>
      <ul>
        {badges.length > 0 ? badges.map((badge, idx) => (
          <li key={idx} className="text-blue-600">{badge}</li>
        )) : <p>No badges yet.</p>}
      </ul>
    </div>
  );
};

export default Points;
