import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard"); // Redirect user to Dashboard after login
    } catch (error) {
      console.error("Login failed:", error.response?.data?.message || error.message);
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-4 text-textcolor font-main">
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="bg-transparent border border-white rounded-lg w-80 p-3 focus:bg-transparent autofill:bg-transparent" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="bg-transparent border border-white rounded-lg w-80 p-3 focus:bg-transparent autofill:bg-transparent" />
      <button type="submit" className="relative px-6 py-3 text-lg font-bold text-textcolor bg-transparent border-2 border-textcolor rounded-lg shadow-[3px_4px_0px_#808080] transition-all duration-200 ease-in-out  active:shadow-none active:translate-x-1 active:translate-y-1 font-main">Login</button>
    </form>
  );
};

export default Login;
