import { createContext, useContext } from "react";
import { Socket } from "socket.io-client";

export const SocketContext = createContext<Socket | null>(null);

export function useSocket() {
    const ctx = useContext(SocketContext);
    if (!ctx){
        throw new Error("useSocket deve ser usado dentro de SocketProvider");
    }
    return ctx;
}