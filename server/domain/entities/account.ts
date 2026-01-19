export default class Account {
    id: string;
    nickname: string;
    avatar64: string;
    level: number;

    constructor(id: string, nickname: string, level: number, avatar64: string) {
        this.id = id;
        this.nickname = nickname;
        this.level = level;
        this.avatar64 = avatar64;
    }
}