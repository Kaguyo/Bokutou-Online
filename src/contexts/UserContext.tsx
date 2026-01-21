import { createContext, Dispatch, SetStateAction, useContext } from "react";
import { Player } from "../models/Player";

interface UserContextType {
  me: Player | null;
  setMe: Dispatch<SetStateAction<Player | null>>;
  profilePicUrl: string | null;
  setProfilePicUrl: Dispatch<SetStateAction<string | null>>;
}

export const UserContext = createContext<UserContextType | null>(null);

export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx){
        throw new Error("useUser deve ser usado dentro de UserProvider");
    }
    return ctx;
}