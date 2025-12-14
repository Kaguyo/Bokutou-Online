import { Server, Socket } from "socket.io";
import Listener from "./listener.js";
import Player from "../application/player.js";

interface ServerToClientEvents {
  svr_global_connected_players: (players: Player[]) => void;
}

export default class Subscriber {
  static answerConnection(socket: Socket, io: Server) {
    console.log('Responding to player connection:', socket.id);
    io.emit('svr_global_connected_players', Player.onlinePlayerlist);
    // socket.emit('svr_global_connected_players', []);
  }

  static answerDisconnection(socket: Socket, io: Server) {
    console.log('Responding to player disconnection:', socket.id);
    io.emit('svr_global_connected_players', Player.onlinePlayerlist);
    // socket.emit('svr_global_connected_players', []);
  }
}
