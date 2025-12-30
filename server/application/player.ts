import { Socket } from "socket.io";
import { User } from "./user";

interface MatchRoom {
    sessionLocked: boolean;
    connectedPlayers: User[];
}

export default class Player {
    id: string;
    nickname: string;
    socket: Socket; 
    level: number;
    status: string;

    host: boolean = false;

    static globalPlayerList: Player[] = [];

    matchRoom: MatchRoom = {
        sessionLocked: true,
        connectedPlayers: []
    }

    constructor(id: string, nickname: string, level: number, status: string, socket: Socket) {
        this.id = id;
        this.nickname = nickname;
        this.level = level;
        this.status = status;
        this.socket = socket;
    }

    toData() {
        return {
            id: this.id,
            nickname: this.nickname,
            level: this.level,
            status: this.status,
            socketId: this.socket.id
        };
    }
}