import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  age: string;
}

const DEFAULT_USER: UserInfo = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@email.com",
  phone: "+1 (555) 123-4567",
  address: "123 Fitness Street, Gym City, GC 12345",
  age: "28",
};

interface UserContextValue {
  user: UserInfo;
  updateUser: (info: UserInfo) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo>(DEFAULT_USER);
  return (
    <UserContext.Provider value={{ user, updateUser: setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
}
