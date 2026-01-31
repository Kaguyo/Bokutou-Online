import { createContext, Dispatch, SetStateAction, useContext } from "react";
import { Socket } from "socket.io-client";
import { Player } from "../models/Player";


interface SocketContextType {
    socket: Socket,
    globalPlayerList: Player[],
    setGlobalPlayerList: Dispatch<SetStateAction<Player[]>>;
}

export const SocketContext = createContext<SocketContextType | null>(null);

export function useSocket() {
    const ctx = useContext(SocketContext);
    if (!ctx){
        throw new Error("useSocket deve ser usado dentro de SocketProvider");
    }
    return ctx;
}