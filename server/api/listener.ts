import { Server, Socket } from "socket.io";
import Subscriber from "./subscriber.js";
import Player from "../application/player.js";

export default class Listener {
  static receiveConnection(player: Player) {
    Player.onlinePlayerlist.push(player);
    console.log('New player connected:', player.socket.id);
  }

  static receiveDisconnection(player: Player) {
    Player.onlinePlayerlist = Player.onlinePlayerlist.filter(p => p.socket.id !== player.socket.id);
    console.log('Player disconnected:', player.socket.id);
  }
}
