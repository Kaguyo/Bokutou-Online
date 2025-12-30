import { JSX, useContext, useEffect, useState } from "react"
import { User } from "../models/User"
import { InviteContext } from "../contexts/InviteContext";
import './InviteCard.css';

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
        <div className="invite-card-box">
            <div className="invite-card">
                <div className="content-wrapper">
                    <div className="inviter-container">
                        <div id="inviter-picture-container"><img src="" alt="img" /></div>
                        <div id="inviter-name-container">
                            <span>{firstInvite.inviter.nickname!.length > 15
                            ? firstInvite.inviter.nickname?.slice(0, 12) + "..."
                            : firstInvite.inviter.nickname}
                            </span>
                        </div>
                        <div id="inviter-level-container"><span>Lv. {firstInvite.inviter.level}</span></div>
                    </div>
                    <span>{firstInvite.inviter.nickname!.length > 15
                    ? firstInvite.inviter.nickname?.slice(0, 12) + "..."
                    : firstInvite.inviter.nickname} invited you to play!
                    </span>
                </div>
            </div>
            <div className="response-options-box">
                <div className="response-container" id="yes" onClick={() => {}}>✓</div>
                <div className="response-container" id="no" onClick={() => {}}>X</div>
            </div>
        </div>
    );
}

