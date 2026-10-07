import { createContext, useState, useEffect, useContext } from "react";
import { publicAxiosRequest } from "../services/HttpMethod";
import { loginURL } from "../services/ConstantServies";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Check existing login session
  useEffect(() => {
    const user = localStorage.getItem("seaUser");
    const token = localStorage.getItem("userToken");

    if (user && token) {
      try {
        setCurrentUser(JSON.parse(user));
      } catch (error) {
        console.error("Failed to restore user session:", error);
        localStorage.removeItem("seaUser");
        localStorage.removeItem("userToken");
      }
    }

    setLoading(false);
  }, []);

  // User login
  const SeaFoodLogin = async (userData) => {
    try {
      setError("");

      const payload = {
        username: userData.username,
        password: userData.password,
      };

      const response = await publicAxiosRequest.post(loginURL, payload);

      if (response.status === 200) {
        const { key } = response.data;

        // Store authentication information
        localStorage.setItem("userToken", key);
        localStorage.setItem("seaUser", JSON.stringify(payload));

        // Extract database name from username
        const dbName = userData.username.split("@")[1];

        if (dbName) {
          localStorage.setItem("dbName", dbName);
        }

        setCurrentUser(payload);
        toast.success("Login successful!");
        window.location.href = "/docket/reimbursement-fees";

        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed. Please check your credentials.");
      toast.error("Login failed. Please check your credentials.");

      return false;
    }
  };

  // User logout
  const logout = () => {
    // Clear user session
    localStorage.removeItem("seaUser");
    localStorage.removeItem("userToken");
    localStorage.removeItem("dbName");

    setCurrentUser(null);
    toast.success("Logout successful!");
    window.location.href = "/docket/user/login";
  };

  const value = {
    currentUser,
    loading,
    error,
    SeaFoodLogin,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};