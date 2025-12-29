import { JSX } from "react";
import './MatchRoom.css'
function MatchRoom(): JSX.Element {

    return (
        <>
            <div id="multiplayer-room-wrapper">
                <div id="multiplayer-room-options">
                    <div id="lock-container"></div>
                    <div id="password-container"></div>
                    <div id="invite-player-container">+</div>
                </div>
                <div id="multiplayer-room-box">
                    
                </div>
            </div>

        </>
    );
}

export default MatchRoom;