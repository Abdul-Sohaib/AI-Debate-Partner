import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle role selection
  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", formData);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard"); // ✅ Redirect after register
    } catch (error) {
      console.error("Error registering:", error.response?.data?.message || error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-textcolor font-main">
      <input type="text" name="name" placeholder="Name" onChange={handleChange} required className="bg-transparent border border-white rounded-lg w-full p-3 focus:bg-transparent autofill:bg-transparent" />
      <input type="email" name="email" placeholder="Email" onChange={handleChange} required className="bg-transparent border border-white rounded-lg w-full p-3 focus:bg-transparent autofill:bg-transparent" />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} required className="bg-transparent border border-white rounded-lg w-full p-3 focus:bg-transparent autofill:bg-transparent" />

      {/* Role Selection Buttons */}
      <div className="flex justify-center gap-4">
        {["Learner", "Student", "Professional"].map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => handleRoleSelect(role)}
            className={`relative px-4 py-2 text-lg font-bold text-textcolor bg-transparent border-2 border-textcolor rounded-lg shadow-[2px_3px_0px_#808080] transition-all duration-200 ease-in-out active:shadow-none active:translate-x-1 active:translate-y-1 font-main
              ${formData.role === role.toLowerCase() ?"bg-gray-600 text-white" : "bg-transparent"}`}
          >
            {role}
          </button>
        ))}
      </div>

      
      <button type="submit" className="relative px-6 py-3 text-lg font-bold text-textcolor bg-transparent border-2 border-textcolor rounded-lg shadow-[3px_4px_0px_#808080] transition-all duration-200 ease-in-out active:shadow-none active:translate-x-1 active:translate-y-1 font-main">
        Register
      </button>
    </form>
  );
};

export default Register;
