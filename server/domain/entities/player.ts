import { Socket } from "socket.io";

interface MatchRoom {
    sessionLocked: boolean;
    connectedPlayers: Player[] | null;
}

export default class Player {
    accountId: string;
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

    setHost(isHost: boolean, connectedPlayers: Player[]) {
        this.host = isHost;
        this.matchRoom.connectedPlayers = connectedPlayers;
    }

    constructor(accountId: string, nickname: string, level: number, status: string, socket: Socket) {
        this.accountId = accountId;
        this.nickname = nickname;
        this.level = level;
        this.status = status;
        this.socket = socket;
    }

    toData() {
        return {
            accountId: this.accountId,
            nickname: this.nickname,
            level: this.level,
            status: this.status,
            socketId: this.socket.id
        };
    }
}