import React, { useContext, useEffect, useRef } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function EmailVerify() {
  const inputRef = useRef([]);
  const { backendUrl, userData, getAuthState } = useContext(AppContext);
  const navigate = useNavigate();
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
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const otp = inputRef.current.map((input) => input.value).join("");
      const { data } = await axios.post(backendUrl + "/auth/verify-email", {
        otp,
      });
      if (data.success) {
        toast.success("User verified");
        getAuthState();
        navigate("/");
      } else {
        toast.error(data.message);
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
      <form
        onSubmit={onSubmitHandler}
        className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
      >
        <h1 className="text-white text-2xl font-semibold text-center mb-4">
          Verify Otp
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
          Verify Email
        </button>
      </form>
    </div>
  );
}

export default EmailVerify;
