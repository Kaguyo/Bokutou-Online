import { UserContext } from '../contexts/UserContext';
import { User } from '../models/User';
import './UserCard.css'
import { JSX, useContext } from 'react';


function UserCard(): JSX.Element {
    const userCtx = useContext(UserContext);
    
    return (
        <div id="profile-template">
            <div id="profile-template-card">
                <div id="profile-icon">
                    <img id="img-pfp" src="/gohan.jpg" alt="img"/>
                </div>  
            </div>

            <div id="user-info">
                <div className="us-info-item">
                    <span id="name">{userCtx?.me?.nickname ?? "Guest"}</span>
                </div>

                <div className="us-info-item">
                    <span id="level">{userCtx?.me?.level ? `Lv. ${userCtx?.me.level}` : "Lv. 1"}</span>
                </div>

                <div className="us-info-item">
                    <span id="status">{userCtx?.me?.status ?? "Offline"}</span>
                    <div 
                        id="status-icon" 
                        className={userCtx?.me?.status === "Online" ? "online-glow" : ""}
                        style={{ 
                        backgroundColor: userCtx?.me?.status === "Online" ? "#2ecc71" : "#888" 
                        }}
                    />
                </div>
            </div>
        </div>  
    );
}

export default UserCard;