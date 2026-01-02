export default class Account {
    id: string;
    name: string;
    profilePicture: string;

    constructor(id: string, name: string, profilePictureToBase64: string) {
        this.id = id;
        this.name = name;
        this.profilePicture = profilePictureToBase64;
    }
}