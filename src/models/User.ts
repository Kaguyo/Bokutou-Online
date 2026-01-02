export class User {
    socketId?: string | undefined;
    nickname?: string;
    level?: number;
    status?: string;

    activeSession: boolean = false; // tracks whether the user is within a matching room
    hosting: boolean = false; // tracks whether the user is hosting a matching room

    constructor(socketId: string | undefined, nickname: string, level: number, status: string){
        this.socketId =  socketId;
        this.nickname = nickname;
        this.level = level;
        this.status = status;
    }

    static pfpImageUrl: string;
}