export default class Account {
    id: string;
    nickname: string;
    player64: string;
    level: number;

    constructor(id: string, nickname: string, level: number, player64ToBase64: string) {
        this.id = id;
        this.nickname = nickname;
        this.level = level;
        this.player64 = player64ToBase64;
    }
}