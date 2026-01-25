import { Server, Socket } from "socket.io";
// No need to import Listener here
import Player, { MatchRoom, PlayerData } from "../../../domain/entities/player.js";

export default class Subscriber {
  private static getSerializablePlayerList(): PlayerData[] | null{
    const list = Player.globalPlayerList.map(player => player.toData());
    return list;
  }

  static answerConnection(socket: Socket, io: Server) {
    console.log('Responding to player connection:', socket.id);
    io.emit('svr_global_connected_players', Subscriber.getSerializablePlayerList());  
}

  static answerDisconnection(socket: Socket, io: Server) {
    console.log('Responding to player disconnection:', socket.id);
    io.emit('svr_global_connected_players', Subscriber.getSerializablePlayerList());
  }
}