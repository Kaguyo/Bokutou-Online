import { Server, Socket } from "socket.io";
// No need to import Listener here
import Player from "../../../domain/entities/player.js";

// Define the shape of the data that will actually be sent to the client
interface PlayerData {
    id: string;
    nickname: string;
    level: number;
    status: string;
    socketId?: string; // Optional: include if the client needs it
}

interface ServerToClientEvents {
  svr_global_connected_players: (players: PlayerData[]) => void; // IMPORTANT: Change type to PlayerData[]
}

export default class Subscriber {
  private static getSerializablePlayerList(): PlayerData[] {
    return Player.globalPlayerList.map(player => player.toData());
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