import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
export const AppContext = createContext();
import axios from "axios";

export const AppProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const getAuthState = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.get(backendUrl + "/auth/is-auth");

      if (data) {
        setUserData(data.data);
        setIsLoggedIn(true);
        console.log(data);
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  const value = {
    backendUrl,
    isLoggedIn,
    userData,
    setIsLoggedIn,
    setUserData,
    getAuthState,
  };

 
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
