import { JSX, useContext, useEffect, useRef } from "react"
import { InviteContext } from "../contexts/InviteContext";
import './InviteCard.css';
import { MatchRoom, Player } from "../models/Player";
import { SocketContext } from '../contexts/SocketContext';
import { PlayerContext } from '../contexts/PlayerContext'

export interface Invite {
    inviter: Player
}

export function InviteCard(): JSX.Element | null {   
    const { inviteList, setInviteList } = useContext(InviteContext)!;
    const firstInvite: Invite | null = inviteList[0];
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const socketCtx = useContext(SocketContext);
    const playerCtx = useContext(PlayerContext);

    useEffect(() => {
        const inviteCard = document.getElementById("invite-card-box");

        if (!firstInvite) {
            inviteCard?.classList.remove('active');
            return;
        }

        if (inviteCard) {
            inviteCard.classList.add('active');
        }

        // Start timeout
        timerRef.current = setTimeout(() => {
            inviteCard?.classList.remove('active');
            setInviteList(prev => prev!.slice(1));
        }, 10000);

        // Cleanup
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [firstInvite, setInviteList]);

    if (!firstInvite) {
        return <div id="invite-card-box"></div>
    }

    function handleRespondInviteCard(accepted: boolean) {
        // Clear timer to avoid race conditions
        if (timerRef.current) clearTimeout(timerRef.current);

        if (!accepted) {
            // Remove current invite
            setInviteList(prev => prev!.slice(1));
            return;
        }

        // Removes accepted invite
        setInviteList(prev => prev!.slice(1));
        playerCtx!.me!.host = false;
        if (playerCtx!.me!.matchRoom.connectedPlayers.filter(
            p => p.accountId != playerCtx?.me?.accountId).length > 0
        ) socketCtx?.socket.emit("clt_leave_matchroom", playerCtx?.me, firstInvite?.inviter.matchRoom) 
        
        playerCtx!.me!.matchRoom.connectedPlayers = []; // Resets my matchroom since we just left one
        socketCtx?.socket.emit("clt_respond_invite", playerCtx?.me?.toData(), firstInvite?.inviter, accepted);
        
    }   

    return (
        <div id="invite-card-box">
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
                <div className="response-container" id="yes" onClick={() => handleRespondInviteCard(true)}>✓</div>
                <div className="response-container" id="no" onClick={() => handleRespondInviteCard(false)}>X</div>
            </div>
        </div>
    );
}
