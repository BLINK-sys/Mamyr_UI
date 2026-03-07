import React, { createContext, useContext, useState } from "react";
import { api, setToken } from "@/services/api";

interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "owner" | "admin" | "cook" | "reception";
  locationId: number;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem("auth_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email: string, password: string): Promise<AuthUser> => {
    const data = await api.post("/auth/login", { email, password });
    setToken(data.token);
    const u = data.user as AuthUser;
    setUser(u);
    localStorage.setItem("auth_user", JSON.stringify(u));
    return u;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
