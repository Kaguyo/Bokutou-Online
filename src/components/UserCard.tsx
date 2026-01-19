import { UserContext } from '../contexts/UserContext';
import Account from '../models/Account';
import { User } from '../models/User';
import { pickImageAndConvert } from '../utils/saveData';
import './UserCard.css'
import { Dispatch, JSX, SetStateAction, useContext, useEffect, useState } from 'react';

interface UserCardProps {
    accountHandle: FileSystemFileHandle | null;
    loggedAccount: Account | null;
    profilePicUrl: string | null;
    setProfilePicUrl: Dispatch<SetStateAction<string | null>>;
    setLoggedAccount: Dispatch<SetStateAction<Account | null>>;
    setIsSynced: Dispatch<SetStateAction<boolean>>;
}

function UserCard(props: UserCardProps): JSX.Element {
    const userCtx = useContext(UserContext);

    const handleImageSelect = async () => {
        try {
            let success = await pickImageAndConvert(
                userCtx?.me!, props.accountHandle,
                props.setProfilePicUrl, props.setLoggedAccount
            );

            
            if (!success) {
                props.setIsSynced(false);
                return;
            }

            if (props.loggedAccount){
                props.setIsSynced(true);
            }
        } catch (error) {
            throw Error("Failed to pick and convert image.");
        }
    };

    useEffect(() => {
        let userPfpElements = document.getElementsByClassName('user-pfp');
        Array.from(userPfpElements).forEach((img) => {
        if (img instanceof HTMLImageElement) {
            img.src = userCtx?.profilePicUrl!;
        }
        });
    }, [userCtx?.profilePicUrl]);
    
    return (
        <div id="profile-template">
            <div id="profile-template-card">
                <div id="profile-icon" onClick={handleImageSelect}>
                    <div className="user-pfp-placeholder" />
                    <img 
                        src={userCtx?.profilePicUrl || " "} 
                        className="user-pfp" 
                    />
                </div>  
            </div>

            <div id="user-info">
                <div className="us-info-item">
                    <span id="name">{userCtx?.me?.nickname}</span>
                </div>

                <div className="us-info-item">
                    <span id="level">Lv. {userCtx?.me?.level}</span>
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