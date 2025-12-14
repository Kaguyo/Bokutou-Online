import { Socket } from "socket.io-client";

export default class Player {
    id: string;
    nickname: string;
    socket: Socket; 
    level: number;
    status: string;

    static onlinePlayerlist: Player[] = [];

    constructor(id: string, nickname: string, socket: Socket, status: string = "Online", level: number = 1) {
        this.id = id;
        this.nickname = nickname;
        this.socket = socket;
        this.level = level;
        this.status = status;
    }
}