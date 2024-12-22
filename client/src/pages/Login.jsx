import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
function Login() {
  const [state, setState] = useState("Sign-Up");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { backendUrl, setIsLoggedIn, setUserData, useData } =
    useContext(AppContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      axios.defaults.withCredentials = true;
      if (state === "Sign-Up") {
        const { data } = await axios.post(backendUrl + "/auth/signup", {
          username,
          email,
          password,
        });
        if (data.success) {
          setIsLoggedIn(true);
          setState("login");
          setUsername("");
          setEmail("");
          setPassword("");
          toast.success("SignUp successful");
        } else {
          toast.error(data.message);
          console.log("hi");
        }
      } else {
        const { data } = await axios.post(backendUrl + "/auth/signin", {
          email,
          password,
        });
        if (data.success) {
          setIsLoggedIn(true);
          setUserData(data.user);
          navigate("/");
          toast.success("Login successful");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt=""
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32  cursor-pointer"
      />
      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
        <h2 className="text-3xl font-semibold text-white text-center mb-3">
          {state === "Sign-Up" ? "Create Account" : "Login Account"}
        </h2>
        <p className="text-center text-sm mb-6">
          {state === "Sign-Up" ? "Create your account" : "Login your account"}
        </p>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {state === "Sign-Up" && (
            <div className="flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333a5c] ">
              <img src={assets.person_icon} alt="" />
              <input
                type="text"
                placeholder="username"
                required
                className="bg-transparent outline-none text-white"
                onChange={(e) => setUsername(e.target.value)}
                value={username}
              />
            </div>
          )}

          <div className="flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333a5c]">
            <img src={assets.mail_icon} alt="" />
            <input
              type="email"
              placeholder="email"
              required
              className="bg-transparent outline-none text-white"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>
          <div className="flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333a5c]">
            <img src={assets.lock_icon} alt="" />
            <input
              type="password"
              placeholder="password"
              required
              className="bg-transparent outline-none text-white"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </div>
          <p
            onClick={() => navigate("/reset-password")}
            className="mb-6 text-indigo-500 cursor-pointer"
          >
            Forgot password?
          </p>
          <button
            type="submit"
            className="rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 w-full py-2.5 text-white font-medium"
          >
            {state}
          </button>
        </form>
        {state === "Sign-Up" ? (
          <p className="text-gray-400 text-center text-xs mt-4">
            Already have an account?{" "}
            <span
              onClick={() => setState("Login")}
              className="text-blue-400 cursor-pointer underline"
            >
              Login
            </span>
          </p>
        ) : (
          <p className="text-gray-400 text-center text-xs mt-4">
            Don't have an account?{" "}
            <span
              onClick={() => setState("Sign-Up")}
              className="text-blue-400 cursor-pointer underline"
            >
              SignUp
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;
