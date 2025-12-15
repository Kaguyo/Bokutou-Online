import envUser from '../../env.user.json'
import envDB from '../../env.db.json'

export default class Player {
  id: number;
  nickname: string;
  socketId: string;
  level: number;
  status: string;

  static onlinePlayerlist: Player[] = [];

  constructor(socketId: string) {
    this.id = envDB.lastId;
    this.nickname = envUser.nickname;
    this.socketId = socketId;
    this.level = envUser.level;
    this.status = "Online";
  }
}
