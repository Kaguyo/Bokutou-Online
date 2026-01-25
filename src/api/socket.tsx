import { io } from 'socket.io-client';
import { Socket } from 'socket.io-client';
import { MatchRoom, Player, PlayerData } from '../models/Player';
import env from '../../env.json'
import { JSX } from 'react';

interface ServerToClientEvents {
  svr_global_connected_players: (playerlist: PlayerData[]) => void;
  svr_transfer_invite: (inviter: Player) => void;
  svr_give_updated_matchRoom: (matchRoom: MatchRoom) => void;
}
interface ClientToServerEvents {
  clt_sending_player: (player: PlayerData) => void;
  clt_inviting_player: (invitedPlayerSocketId: string, host: Player) => void;
  clt_respond_invite: (invitedPlayer: PlayerData, inviter: Player, acceptInvite: boolean ) => Promise<MatchRoom | null>;
}

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
  io(env.SERVER_URL, {
    autoConnect: false,
    transports: ["websocket"]
  });
