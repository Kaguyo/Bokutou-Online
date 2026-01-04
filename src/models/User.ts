import { Dispatch, SetStateAction } from "react";
import Account from "./Account";

export class User {
    socketId?: string;
    nickname: string;
    level: number;
    status: string;

    activeSession: boolean = false; // tracks whether the user is within a matching room
    hosting: boolean = false; // tracks whether the user is hosting a matching room

    constructor(socketId: string | undefined, nickname: string, level: number, status: string){
        this.socketId =  socketId;
        this.nickname = nickname;
        this.level = level;
        this.status = status;
    }

    static updateProfilePicture(profilePicUrl: string | null, loggedAccount: Account | null, setProfilePicUrl: Dispatch<SetStateAction<string | null>>){
        if (loggedAccount?.profilePicture) {

          // Revoke previous URL (if any)
          if (profilePicUrl) {
            URL.revokeObjectURL(profilePicUrl); // release old one
          }

          const base64Data = loggedAccount.profilePicture.split(",")[1] ?? loggedAccount.profilePicture;
          const binary = atob(base64Data);
          const array = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            array[i] = binary.charCodeAt(i);
          }

          const blob = new Blob([array], { type: "image/png" });
          const imageUrl = URL.createObjectURL(blob);
          setProfilePicUrl(imageUrl);
        }
    }
}