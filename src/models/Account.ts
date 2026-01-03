export default class Account {
    id: string;
    nickname: string;
    profilePicture: string;
    level: number;

    constructor(id: string, nickname: string, level: number, profilePictureToBase64: string) {
        this.id = id;
        this.nickname = nickname;
        this.level = level;
        this.profilePicture = profilePictureToBase64;
    }
}