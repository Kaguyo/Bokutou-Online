import { Server, Socket } from "socket.io";
import Player from "../../../domain/entities/player.js";

export default class Listener {
  static receiveConnection(player: Player, socket: Socket) {
    Player.globalPlayerList.push(player);
    console.log('New player connected:', player.socket.id);
  }

  static receiveDisconnection(socket: Socket): Player {

    const disconnectedPlayer = Player.globalPlayerList.find(p => p.socket.id === socket.id);
    
    if (!disconnectedPlayer) {
      console.error(`Error: Could not find player with socket ID: ${socket.id}`);
      return {} as Player; 
    }
    
    Player.globalPlayerList = Player.globalPlayerList.filter(p => p.socket.id !== socket.id);

    console.log('Player disconnected:', disconnectedPlayer.socket.id);
    return disconnectedPlayer;
  }
}
