import { Server, Socket } from "socket.io";
import Player from "../../../domain/entities/player.js";

export default class Listener {
  static receiveConnection(player: Player) {
    Player.globalPlayerList.push(player);
    console.log('New player registered in the open server:', player.socketId);
  }

  static receiveDisconnection(socket: Socket): Player {

    const disconnectedPlayer = Player.globalPlayerList.find(p => p.socketId === socket.id);
    
    if (!disconnectedPlayer) {
      console.error(`Error: Could not find player with socket ID: ${socket.id}`);
      return {} as Player; 
    }
    
    Player.globalPlayerList = Player.globalPlayerList.filter(p => p.socketId !== socket.id);

    console.log('Player disconnected:', disconnectedPlayer.socketId);
    return disconnectedPlayer;
  }
}
