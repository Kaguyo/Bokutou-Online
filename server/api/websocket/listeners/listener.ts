import { Server, Socket } from "socket.io";
import Player, { MatchRoom, PlayerData } from "../../../domain/entities/player.js";
import { Logger } from "../../../resources/utils.js";

export default class Listener {
  static receiveConnection(player: Player) {
    Player.globalPlayerList.push(player);
    Logger('New player registered in the open server: '+ player.socketId);
  }

  static receiveDisconnection(socket: Socket): Player {

    const disconnectedPlayer = Player.globalPlayerList.find(p => p.socketId === socket.id);
    
    if (!disconnectedPlayer) {
      Logger(`Error: Could not find player with socket ID: ${socket.id}`);
      return {} as Player; 
    }
    
    Player.globalPlayerList = Player.globalPlayerList.filter(p => p.socketId !== socket.id);

    Logger('Player disconnected: ' + disconnectedPlayer.socketId);
    return disconnectedPlayer;
  }

  /* 
    summary
    this function is mean't to feedback only the players that were along with the 
    disconnected player during their disconnection, but not the disconnected player themselves
  */
  static leaveMatchRoom(disconnectedPlayer: PlayerData, io: Server){
    Logger(`Player (${disconnectedPlayer.nickname} was disconnected from a MatchRoom, updating players' room)`);
    
    const p = Player.globalPlayerList.find(p => p.socketId == disconnectedPlayer.socketId);
    if (!p) return; 

    // creates copy of disconnectedPlayer matchroom, easing up filter since they MUST not have themselves in it
    const copyRoom: MatchRoom = {
      ...p.matchRoom, connectedPlayers: p.matchRoom.connectedPlayers.filter(
        x => x.socketId != p.socketId // ensures even more to not include the disconnected player
      )
    };

    p.matchRoom.connectedPlayers.forEach((remainingPlayer) => {
      const updatedMatchRoom = copyRoom;

      // UI requires the own player to be included to construct interface with them, so no filter here
      io.to(remainingPlayer.socketId).emit("svr_give_updated_matchRoom", updatedMatchRoom);

      if (remainingPlayer.socketId != p.socketId) { // ensures to not send it to the disconnected player
        // updates the found remainingPlayer in the global list, providing him a matchRoom without themself and the disconnected player
        Player.globalPlayerList.find(player => {
          if (player.accountId == remainingPlayer.accountId) {
            // if ure reading this, just trust me, this filter returns everyone from player's list without the disconnected p and remainingPlayer, wink
            player.matchRoom.connectedPlayers = player.matchRoom.connectedPlayers.filter(
              _ => _.accountId != p.accountId && _.accountId != remainingPlayer.accountId  
            )
            return true;
          } 
          return false;
        });
      }
    });
  }
}
