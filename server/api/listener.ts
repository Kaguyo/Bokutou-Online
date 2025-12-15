import { Server, Socket } from "socket.io";
import Subscriber from "./subscriber.js";
import Player from "../application/player.js";

export default class Listener {
  static receiveConnection(player: any, socket: Socket) { // NOTE: Changed type to 'any' for POJO safety
    const p = new Player( // New instance created (p)
      player.id,
      player.nickname,
      player.level,
      player.status,
      socket
    );
    Player.onlinePlayerlist.push(p);
    
    console.log('New player connected:', p.socket.id);
  }

  static receiveDisconnection(socket: Socket): Player {

    const disconnectedPlayer = Player.onlinePlayerlist.find(p => p.socket.id === socket.id);
    
    if (!disconnectedPlayer) {
      console.error(`Error: Could not find player with socket ID: ${socket.id}`);
      return {} as Player; 
    }
    
    Player.onlinePlayerlist = Player.onlinePlayerlist.filter(p => p.socket.id !== socket.id);

    console.log('Player disconnected:', disconnectedPlayer.socket.id);
    return disconnectedPlayer;
  }
}
