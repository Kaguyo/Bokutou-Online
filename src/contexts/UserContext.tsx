import { createContext, Dispatch, SetStateAction, useContext } from "react";
import { User } from "../models/User";

interface UserContextType {
  me: User | null;
  setMe: Dispatch<SetStateAction<User | null>>;
}

export const UserContext = createContext<UserContextType | null>(null);

export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx){
        throw new Error("useUser deve ser usado dentro de UserProvider");
    }
    return ctx;
}