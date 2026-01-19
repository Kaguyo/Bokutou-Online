import { Socket } from "socket.io";

interface MatchRoom {
    sessionLocked: boolean;
    connectedPlayers: Player[] | null;
}

export default class Player {
    id: string;
    nickname: string;
    socket: Socket; 
    level: number;
    status: string;
    avatar64: string;

    host: boolean = false;

    static globalPlayerList: Player[] = [];

    matchRoom: MatchRoom = {
        sessionLocked: true,
        connectedPlayers: []
    }

    setHost(isHost: boolean, connectedPlayers: Player[]) {
        this.host = isHost;
        this.matchRoom.connectedPlayers = connectedPlayers;
    }

    constructor(id: string, nickname: string, level: number, status: string, avatar64: string, socket: Socket) {
        this.id = id;
        this.nickname = nickname;
        this.level = level;
        this.status = status;
        this.socket = socket;
        this.avatar64 = avatar64;
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