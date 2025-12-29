export class User {
    socketId?: string | undefined;
    nickname?: string;
    level?: number;
    status?: string;

    constructor(socketId: string | undefined, nickname: string, level: number, status: string){
        this.socketId =  socketId;
        this.nickname = nickname;
        this.level = level;
        this.status = status;
    }
}