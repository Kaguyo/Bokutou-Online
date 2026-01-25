import { Socket } from "socket.io";



export interface MatchRoom {
    sessionLocked: boolean;
    sessionPassword: string;
    connectedPlayers: PlayerData[];
}

export interface PlayerData {
    accountId: string;
    nickname: string;
    socketId: string; 
    level: number;
    status: string;
    avatar64: string;
    host: boolean;
}

export default class Player {
    accountId: string;
    nickname: string;
    socketId: string;
    level: number;
    status: string;
    avatar64: string = "";
    host: boolean = false;

    matchRoom: MatchRoom = {
        sessionLocked: true,
        sessionPassword: "",
        connectedPlayers: []
    }

    static globalPlayerList: Player[] = [];

    constructor(accountId: string, nickname: string, level: number, status: string, socketId: string) {
        this.accountId = accountId;
        this.nickname = nickname;
        this.level = level;
        this.status = status;
        this.socketId = socketId;
    }

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
}