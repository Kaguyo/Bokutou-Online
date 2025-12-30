import { JSX, useContext, useEffect, useState } from "react"
import { User } from "../models/User"
import { InviteContext } from "../contexts/InviteContext";

export interface Invite {
    inviter: User
}

export function InviteCard(): JSX.Element | null {   
    const { inviteList, setInviteList } = useContext(InviteContext)!;
    const firstInvite = inviteList[0];
    
    useEffect(() => {
        if (!firstInvite) return;

        const timer = setTimeout(() => {
            setInviteList(prev => prev!.slice(1));
        }, 10000); // 10s

        return () => clearTimeout(timer);
    }, [firstInvite, setInviteList]);

    if (!firstInvite) {
        console.log(inviteList);
        return null;

    }

    return (
        <div className="invite-card">
            
        </div>
    );
}

