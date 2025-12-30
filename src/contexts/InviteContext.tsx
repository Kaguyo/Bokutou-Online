import { createContext, Dispatch, SetStateAction, useContext } from "react";
import type { Invite } from '../components/InviteCard';

interface InviteContextType {
    inviteList: Invite[];
    setInviteList: Dispatch<SetStateAction<Invite[]>>;
}

export const InviteContext = createContext<InviteContextType | null>(null)

export function useInvite() {
    const ctx = useContext(InviteContext);
    if (!ctx) {
        throw new Error("useInvite deve ser usado dentro de InviteProvider");
    }
    return ctx;
}
