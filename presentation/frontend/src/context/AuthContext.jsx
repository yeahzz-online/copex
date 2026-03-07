import { createContext, useContext, useMemo, useState } from "react";
import api from "../services/api";
import {
  clearAuthSession,
  getStoredUser,
  setAuthSession
} from "../services/tokenStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(false);

  const login = async ({ identifier, password, role = null }) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { identifier, password, role });
      const { accessToken, refreshToken, user: responseUser } = response.data;
      setAuthSession({ accessToken, refreshToken, user: responseUser });
      setUser(responseUser);
      return responseUser;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    return api.post("/auth/register", payload);
  };

  const verifyOtp = async ({ email, otp }) => {
    return api.post("/auth/verify-otp", { email, otp });
  };

  const completeStudentSetup = async (payload) => {
    return api.post("/auth/student-setup", payload);
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("cmr_refresh_token");
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch (error) {
      // Ignore logout network failures; local session still gets removed.
    } finally {
      clearAuthSession();
      setUser(null);
    }
  };

  const updateUserSession = (nextUser) => {
    if (!nextUser) return;
    setAuthSession({ user: nextUser });
    setUser(nextUser);
  };

  const value = useMemo(
    () => ({
      loading,
      user,
      isAuthenticated: Boolean(user),
      role: user?.role || null,
      login,
      logout,
      updateUserSession,
      register,
      verifyOtp,
      completeStudentSetup
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
