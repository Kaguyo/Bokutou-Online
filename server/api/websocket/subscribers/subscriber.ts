import { Server, Socket } from "socket.io";
// No need to import Listener here
import Player, { MatchRoom, PlayerData } from "../../../domain/entities/player.js";
import { Logger } from "../../../resources/utils.js";

export default class Subscriber {
  private static getSerializablePlayerList(): PlayerData[] | null{
    const list = Player.globalPlayerList.map(player => player.toData());
    return list;
  }

  static answerConnection(socket: Socket, io: Server) {
    Logger('Distributing new global list after connection from Player: ' + socket.id);
    io.emit('svr_global_connected_players', Subscriber.getSerializablePlayerList());  
}

  static answerDisconnection(socket: Socket, io: Server) {
    Logger('Distributing new global list after disconnection from Player: ' + socket.id);
    io.emit('svr_global_connected_players', Subscriber.getSerializablePlayerList());
  }

  /* 
    summary
    this function is mean't to feedback only the disconnected player, not the others
    that may have been with them before the disconnection
  */
  static leaveMatchRoom(disconnectedPlayer: PlayerData, io: Server) {
    Logger(`Responding to MatchRoom disconnection for player: ${disconnectedPlayer.socketId}`);
    const newMatchRoom: MatchRoom = {
      connectedPlayers: [],
      sessionLocked: true,
      sessionPassword: "",
      playerIndexInRoom: 0
    };

    Player.globalPlayerList.find(p => p.socketId == disconnectedPlayer.socketId)!.matchRoom = newMatchRoom;
    newMatchRoom.connectedPlayers.push(disconnectedPlayer);
    
    io.to(disconnectedPlayer.socketId).emit('svr_give_updated_matchRoom', newMatchRoom);
  }
}