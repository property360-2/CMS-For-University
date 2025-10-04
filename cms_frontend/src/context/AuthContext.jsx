// cms_frontend/src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import axios from "axios";

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState({ access: null, refresh: null });
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initAuth = () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        const refreshToken = localStorage.getItem("refresh_token");
        const userData = localStorage.getItem("user_data");

        if (accessToken && refreshToken) {
          setTokens({ access: accessToken, refresh: refreshToken });
          setIsAuthenticated(true);
          if (userData) {
            setUser(JSON.parse(userData));
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setTokens({ access: null, refresh: null });
    setIsAuthenticated(false);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_data");
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const response = await axios.post("http://localhost:8000/api/token/", {
        email,
        password,
      });

      const { access, refresh } = response.data;

      // Store tokens
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      setTokens({ access, refresh });
      setIsAuthenticated(true);

      // Store user info
      const userData = { email };
      localStorage.setItem("user_data", JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.response?.data?.detail || "Invalid email or password",
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Optionally call backend logout endpoint
      if (tokens.refresh) {
        await axios.post("http://localhost:8000/api/logout/", {
          refresh: tokens.refresh,
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuth();
    }
  }, [tokens.refresh, clearAuth]);

  const refreshAccessToken = useCallback(async () => {
    try {
      if (!tokens.refresh) {
        throw new Error("No refresh token available");
      }

      const response = await axios.post(
        "http://localhost:8000/api/token/refresh/",
        {
          refresh: tokens.refresh,
        }
      );

      const { access } = response.data;
      localStorage.setItem("access_token", access);

      setTokens((prev) => ({ ...prev, access }));

      return access;
    } catch (error) {
      console.error("Token refresh error:", error);
      clearAuth();
      throw error;
    }
  }, [tokens.refresh, clearAuth]);

  const getAccessToken = useCallback(() => {
    return tokens.access;
  }, [tokens.access]);

  const value = {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshAccessToken,
    getAccessToken,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
