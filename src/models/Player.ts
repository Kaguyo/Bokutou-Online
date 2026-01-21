import { Dispatch, SetStateAction } from "react";
import Account from "./Account";

export interface MatchRoom {
    sessionLocked: boolean;
    connectedPlayers: Player[];
}

export class Player {
    socketId?: string;
    nickname: string;
    level: number;
    status: string;
    avatar64: string = "";
    accountId: string = "";
    
    host: boolean = false;

    static globalPlayerList: Player[] = [];

    matchRoom: MatchRoom = {
        sessionLocked: true,
        connectedPlayers: []
    }

    constructor(socketId: string, nickname: string, level: number, status: string){
        this.socketId = socketId;
        this.nickname = nickname;
        this.level = level;
        this.status = status;
    }

    activeSession: boolean = false; // tracks whether the player is within a matching room
    hosting: boolean = false; // tracks whether the player is hosting a matching room


    static updateProfilePicture(profilePicUrl: string | null, loggedAccount: Account | null, setProfilePicUrl: Dispatch<SetStateAction<string | null>>){
        if (loggedAccount?.avatar64) {

          // Revoke previous URL (if any)
          if (profilePicUrl) {
            URL.revokeObjectURL(profilePicUrl); // release old one
          }

          const base64Data = loggedAccount.avatar64.split(",")[1] ?? loggedAccount.avatar64;
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