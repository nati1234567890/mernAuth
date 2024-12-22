import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
function Navbar() {
  const navigate = useNavigate();
  const [isLoding, setIsLoading] = useState(false);
  const { userData, isLoggedIn, setIsLoggedIn, backendUrl, setUserData } =
    useContext(AppContext);

  const handleLogout = async () => {
    try {
      axios.defaults.withCredentials = true;

      const { data } = await axios.post(backendUrl + "/auth/logout");

      if (data.success) {
        setUserData(null);
        setIsLoggedIn(false);
        navigate("/");
        toast.success("Logged out");
      }
    } catch (error) {
      console.log(error.mesage);
    }
  };
  const sendOtp = async () => {
    try {
      setIsLoading(true);
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + "/auth/send-verify-otp");
      if (data.success) {
        setIsLoading(false);
        navigate("/email-verify");
        toast.success(data.message);
      } else {
        console.log(err.message);
        setIsLoading(false);
      }
    } catch (error) {
      log(error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-between items-center p-4 sm:p- absolute top-0 left-0 bg-white  sm:px-24">
      <img src={assets.logo} className="w-24 sm:w-32" />
      {isLoggedIn ? (
        <div className="flex justify-center items-center rounded-full text-white bg-black w-8 h-8 relative group play">
          {userData.username[0].toUpperCase()}
          <div className="absolute hidden group-hover:block top-0 right-0 text-black rounded pt-10">
            <ul className=" m-0 list-none bg-gray-100 text-sm  flex flex-col w-32">
              {userData.isVerified ? null : (
                <li
                  onClick={sendOtp}
                  className="py-1 px-2 cursor-pointer bg-gray-200 hover:bg-gray-300"
                >
                  {isLoding ? "sending email.." : "Verify Email"}
                </li>
              )}

              <li
                onClick={handleLogout}
                className="py-1 px-2 cursor-pointer bg-gray-200 hover:bg-gray-300"
              >
                Logout
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 border border-gray-400 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-200 transition-all "
        >
          SignUp <img src={assets.arrow_icon} />
        </button>
      )}
    </div>
  );
}

export default Navbar;
