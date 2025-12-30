import { JSX, useContext, useEffect, useState } from "react";
import './MatchRoom.css'
import {UserContext} from '../contexts/UserContext';
import { User } from "../models/User";
import { Player } from "../models/Player";

function MatchRoom(): JSX.Element {
    const userCtx = useContext(UserContext);
    const [searchingGlobalPlayers, setSearchingGlobalPlayers] = useState<boolean>(false);

    function handleInvitePlayerBtn(user: User | null | undefined, newMode: boolean): void {
        if (user?.hosting) {
            setSearchingGlobalPlayers(newMode);
        }
    }

    // Toggles global playerlist hud and adds/clears listener for Escape key
    useEffect(() => {
        const container = document.getElementById("global-playerlist-container");
        const exitBtn = document.getElementById("exit-btn");

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                handleInvitePlayerBtn(userCtx?.me, false);
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
                    <div id="invite-player-container" onClick={() => handleInvitePlayerBtn(userCtx?.me, true)}>+</div>
                </div>
                <div id="multiplayer-room-box">

                    <div></div>
                </div>
            </div>

            <div id="global-playerlist-container">
                <div id="options-bar">
                    <div id="exit-btn"onClick={() => handleInvitePlayerBtn(userCtx?.me, false)}></div>
                </div>
                <div>
                    {
                        Player.globalPlayerList.map((p) => 
                            <div className="global-playerlist-item">
                                <div className="item-profile-container"><img src={"../../public/gohan.gif"} alt="pfp" /></div>
                                <div className="item-nickname-container"><span>{p.nickname}</span></div>
                                <div className="item-level-container"><span>Lv. {p.level}</span></div>
                                <div className="item-status-container"><span>{p.status}</span></div>
                                <div className="item-add-friend-container">+</div>
                                <div className="item-invite-player-container">+</div>
                            </div>
                        )
                    }
                </div>

            </div>
            
        </>
    );
}

export default MatchRoom;