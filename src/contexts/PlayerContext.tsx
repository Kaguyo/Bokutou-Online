import { createContext, useContext } from "react";
import { Player } from "../models/Player";

export const PlayerContext = createContext<Player | null>(null);

export function usePlayer() {
    const ctx = useContext(PlayerContext);
    if (!ctx){
        throw new Error("usePlayer deve ser usado dentro de PlayerProvider");
    }
    return ctx;
}