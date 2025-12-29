export class Player {
    socketId: string;
    nickname: string;
    level: number;
    status: string;
    
    host: boolean = false;

    static globalPlayerList: Player[] = [];

    MatchRoom: Player[] = [];

    constructor(socketId: string, nickname: string, level: number, status: string){
        this.socketId =  socketId;
        this.nickname = nickname;
        this.level = level;
        this.status = status;
    }
}