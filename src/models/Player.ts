import { Dispatch, SetStateAction } from "react";
import Account from "./Account";


export interface PlayerData {
  accountId: string;
  nickname: string;
  level: number;
  status: string;
  socketId: string;
  avatar64: string;
  host: boolean;
}

export interface MatchRoom {
    sessionLocked: boolean;
    connectedPlayers: PlayerData[];
    sessionPassword: string;
    playerIndexInRoom: number;
}

export class Player {
    socketId: string;
    nickname: string;
    level: number;
    status: string;
    avatar64: string = "";
    accountId: string;
    
    host: boolean = false;

    static globalPlayerList: Player[] = [];

    matchRoom: MatchRoom = {
        sessionLocked: true,
        sessionPassword: "",
        connectedPlayers: [],
        playerIndexInRoom: 0
    }

    constructor(accountId: string, socketId: string, nickname: string, level: number, status: string){
        this.accountId = accountId
        this.socketId = socketId;
        this.nickname = nickname;
        this.level = level;
        this.status = status;
    }

    activeSession: boolean = false; // tracks whether the player is within a matching room

    toData() {
        const playerData: PlayerData = {
            accountId: this.accountId,
            nickname: this.nickname,
            level: this.level,
            status: this.status,
            socketId: this.socketId,
            avatar64: this.avatar64,
            host: this.host
        }

        return playerData;
    }

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