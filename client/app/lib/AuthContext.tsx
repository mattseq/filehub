"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import Cookies from "js-cookie";

interface AuthContextType {
  isLoggedIn: boolean;
  loading: boolean;
  login: (key: string) => void;
  logout: () => void;
  getKey: () => string | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const key = Cookies.get("apikey") || "";
    if (key) {
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  const login = (key: string) => {
    Cookies.set("apikey", key);
    setIsLoggedIn(true);
  };

  const logout = () => {
    Cookies.remove("apikey");
    setIsLoggedIn(false);
  };

  const getKey = () => {
    return Cookies.get("apikey");
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, login, logout, loading, getKey }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
