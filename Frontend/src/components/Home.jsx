import { useState } from "react";
import Login from "./Login";
import Register from "./Register";

const Home = () => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <>
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary   text-textcolor gap-20">
      <h1 className="text-7xl font-bold flex justify-center items-center font-main">Welcome to Debatra</h1>
      <div className="bg-transparent p-6 rounded-lg backdrop-filter backdrop-blur-[10px] shadow-[3px_4px_0px_#808080] transition-all duration-200 ease-in-out h-fit w-fit flex justify-center items-center flex-col gap-8 border-2 border-textcolor">
        {showLogin ? <Login /> : <Register />}
        <p className="mt-4 font-main flex justify-center items-center flex-col gap-2 text-2xl font-semibold w-full">
          {showLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            className="relative px-4 py-1 w-full text-lg font-bold text-textcolor bg-transparent border-2 border-textcolor rounded-lg shadow-[3px_4px_0px_#808080] transition-all duration-200 ease-in-out  active:shadow-none active:translate-x-1 active:translate-y-1 font-main"
            onClick={() => setShowLogin(!showLogin)}
          >
            {showLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
    </>
  );
};

export default Home;
