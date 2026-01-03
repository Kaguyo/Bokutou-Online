import { UserContext } from '../contexts/UserContext';
import Account from '../models/Account';
import { pickImageAndConvert } from '../utils/saveData';
import './UserCard.css'
import { Dispatch, JSX, SetStateAction, useContext, useEffect } from 'react';

interface UserCardProps {
    accountHandle: FileSystemFileHandle | null;
    loggedAccount: Account | null;
    profilePicUrl: string | null;
    setProfilePicUrl: Dispatch<SetStateAction<string | null>>;
    setLoggedAccount: Dispatch<SetStateAction<Account | null>>;
}

function UserCard(props: UserCardProps): JSX.Element {
    const userCtx = useContext(UserContext);

    useEffect(() => {
        let userPfpElements = document.getElementsByClassName('user-pfp');
        Array.from(userPfpElements).forEach((img) => {
        console.log(img);
        if (img instanceof HTMLImageElement) {
            img.src = userCtx?.profilePicUrl!;
            console.log(img);
        }
        });
    }, [userCtx?.profilePicUrl]);
    return (
        <div id="profile-template">
            <div id="profile-template-card">
                <div id="profile-icon" onClick={() => pickImageAndConvert(userCtx?.me!, props.accountHandle, props.loggedAccount, props.profilePicUrl, props.setProfilePicUrl, props.setLoggedAccount)}>
                    <img className="user-pfp" alt=" " src={userCtx?.profilePicUrl || " "} />
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