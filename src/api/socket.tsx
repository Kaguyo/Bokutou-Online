import { io } from 'socket.io-client';
import { Socket } from 'socket.io-client';
import { Player } from '../models/Player';
import env from '../../env.json'

interface ServerToClientEvents {
  svr_global_connected_players: (playerlist: Player[]) => void;
}
interface ClientToServerEvents {
  clt_sending_player: (player: Player) => void;
}


export const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
  io(env.SERVER_URL, {
    autoConnect: false,
    transports: ["websocket"]
  });
  