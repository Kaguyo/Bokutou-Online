import { JSX, useContext, useEffect, useState } from "react";
import './MatchRoom.css'
import { PlayerContext } from '../contexts/PlayerContext';
import { Player } from "../models/Player";
import { socket } from "../api/socket";
import env from '../../env.json'

function MatchRoom(): JSX.Element {
    const playerCtx = useContext(PlayerContext);
    const [searchingGlobalPlayers, setSearchingGlobalPlayers] = useState<boolean>(false);

    function handleGlobalPlayerListBtn(newMode: boolean): void {
        setSearchingGlobalPlayers(newMode);
    }

    function handleInvitePlayerBtn(socketId: string, me: Player | null | undefined): void {
        if (me?.host || me?.matchRoom.sessionLocked){
            socket.emit("clt_inviting_player", socketId, me);
        }
    }

    // Toggles global playerlist hud and adds/clears listener for Escape key
    useEffect(() => {
        const container = document.getElementById("global-playerlist-container");
        const exitBtn = document.getElementById("exit-btn");

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                handleGlobalPlayerListBtn(false);
            }
        };
        
        if (searchingGlobalPlayers) {
            container?.classList.add("active");
            exitBtn!.textContent = "X";

            window.addEventListener("keydown", handleKeyDown);
        } else {
            container?.classList.remove("active");
            exitBtn!.textContent = "";

            window.removeEventListener("keydown", handleKeyDown);
        }

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
        
    }, [searchingGlobalPlayers])

    return (
        <>
            <div id="multiplayer-room-wrapper">
                <div id="multiplayer-room-options">
                    <div id="lock-container">
                        <div id="latch"></div>
                        <div id="locker"></div>
                    </div>
                    <div id="password-container"></div>
                    <div id="invite-player-container" onClick={() => handleGlobalPlayerListBtn(true)}>+</div>
                </div>
                <div id="multiplayer-room-box">

                </div>
            </div>

            <div id="global-playerlist-container">
                <div id="options-bar">
                    <div id="exit-btn"onClick={() => handleGlobalPlayerListBtn(false)}></div>
                </div>
                <div>
                    {
                        Player.globalPlayerList.map((p) => 
                            <div key={p.socketId} className="global-playerlist-item">
                                <div className="item-profile-container"><img src={`${env.SERVER_URL}/accounts/${p.accountId}/avatar`} alt="" /></div>
                                <div className="item-nickname-container"><span>{p.nickname}</span></div>
                                <div className="item-level-container"><span>Lv. {p.level}</span></div>
                                <div className="item-status-container"><span>{p.status}</span></div>
                                <div className="item-add-friend-container">+</div>
                                <div className="item-invite-player-container" onClick={() => handleInvitePlayerBtn(p.socketId!, playerCtx?.me)}>+</div>
                            </div>
                        )
                    }
                </div>

            </div>
            
        </>
    );
}

export default MatchRoom;