import { Socket } from "socket.io";

export default class Player {
    id: string;
    nickname: string;
    socket: Socket; 
    level: number;
    status: string;

    static onlinePlayerlist: Player[] = [];

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