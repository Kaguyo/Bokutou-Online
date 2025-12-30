import { User } from "./User";

export interface MatchRoom {
    sessionLocked: boolean;
    connectedPlayers: User[];
}

export class Player {
    socketId: string;
    nickname: string;
    level: number;
    status: string;
    profilePicture: Uint8Array | "" = "";
    
    host: boolean = false;

    static globalPlayerList: Player[] = [];

    matchRoom: MatchRoom = {
        sessionLocked: true,
        connectedPlayers: []
    }

    constructor(socketId: string, nickname: string, level: number, status: string){
        this.socketId =  socketId;
        this.nickname = nickname;
        this.level = level;
        this.status = status;
    }
}