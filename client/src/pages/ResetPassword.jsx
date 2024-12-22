import React, { useContext, useRef, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

function ResetPassword() {
  const navigate = useNavigate();
  axios.defaults.withCredentials = true;
  const { backendUrl } = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);
  const inputRef = useRef([]);
  const handleInput = (e, i) => {
    if (e.target.value.length > 0 && i < inputRef.current.length - 1) {
      inputRef.current[i + 1].focus();
    }
  };
  const handleKeyDown = (e, i) => {
    if (e.key === "Backspace" && e.target.value.length === 0 && i > 0) {
      inputRef.current[i - 1].focus();
    }
  };
  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text");
    const pasteArr = paste.split("");
    console.log(pasteArr);
    pasteArr.forEach((char, i) => {
      if (inputRef.current[i]) {
        inputRef.current[i].value = char;
      }
    });
  };
  const onSubmitEmail = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(backendUrl + "/auth/send-reset-otp", {
        email,
      });
      if (data.success) {
        toast.success(data.message);
        setIsEmailSent(true);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  const onSubmitOtp = async (e) => {
    e.preventDefault();

    const otp = inputRef.current.map((input) => input.value).join("");
    setOtp(otp);
    setIsOtpSubmitted(true);
  };

  const onSubmitNewPassword = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(backendUrl + "/auth/reset-password", {
        otp,
        email,
        newPassword,
      });
      if (data.success) {
        toast.success(data.message);
        navigate("/login");
      }
    } catch (error) {
      console.log(error.message);
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
      {!isEmailSent && (
        <form
          onSubmit={onSubmitEmail}
          className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
        >
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            Reset Password
          </h1>
          <p className="text-center mb-6 text-indigo-300">
            Enter Your Registered Email
          </p>
          <div className="flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333a5c]">
            <img src={assets.mail_icon} alt="" />
            <input
              type="email"
              placeholder="email"
              required
              className="bg-transparent outline-none text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full"
          >
            Submit
          </button>
        </form>
      )}

      {/* input reset otp */}
      {!isOtpSubmitted && isEmailSent && (
        <form
          onSubmit={onSubmitOtp}
          className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
        >
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            Reset Password Otp
          </h1>
          <p className="text-center mb-6 text-indigo-300">
            Enter the 6 digit code sent to your Email
          </p>
          <div className="flex justify-between mb-8">
            {Array(6)
              .fill("")
              .map((_, i) => (
                <input
                  type="text"
                  key={i}
                  required
                  maxLength={"1"}
                  className="w-12 h-12 text-white text-center text-xl rounded-md bg-[#333a5c]"
                  ref={(e) => (inputRef.current[i] = e)}
                  onInput={(e) => handleInput(e, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  onPaste={handlePaste}
                />
              ))}
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full"
          >
            Submit
          </button>
        </form>
      )}

      {/* enter new password */}
      {isOtpSubmitted && isEmailSent && (
        <form
          onSubmit={onSubmitNewPassword}
          className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
        >
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            New Password
          </h1>
          <p className="text-center mb-6 text-indigo-300">
            Enter The New Password below
          </p>
          <div className="flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333a5c]">
            <img src={assets.lock_icon} alt="" />
            <input
              type="password"
              placeholder="new password"
              required
              className="bg-transparent outline-none text-white"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full"
          >
            Submit
          </button>
        </form>
      )}
    </div>
  );
}

export default ResetPassword;
