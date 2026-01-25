import { Server as IOServer, Socket } from "socket.io";
import Player, { MatchRoom, PlayerData } from "../../domain/entities/player.js";
import Listener from "./listeners/listener.js";
import Subscriber from "./subscribers/subscriber.js";

interface ClientToServerEvents {
  clt_sending_player: (playerData: PlayerData) => void;
  clt_inviting_player: (socketId: string, inviter: Player) => void;
  clt_respond_invite: (invitedPlayer: PlayerData, inviter: Player, acceptInvite: boolean ) => Promise<MatchRoom | null>;
}

interface ServerToClientEvents {
  svr_global_connected_players: (players: PlayerData[]) => void;
  svr_transfer_invite: (inviter: Player) => void;
  svr_give_updated_matchRoom: (matchRoom: MatchRoom) => void;
}

export default function setupWebSocketServer(server: import("http").Server  | import("https").Server) {
    const io = new IOServer<ClientToServerEvents, ServerToClientEvents>(server, {
        cors: { origin: '*' }
    });

    io.on('connection', (socket: Socket) => {
        console.log(`Player connected with ID: ${socket.id}`);
        socket.on('clt_sending_player', (playerData: PlayerData) => {
            const p = new Player(
            playerData.accountId, playerData.nickname, playerData.level,
            playerData.status, socket.id
            )
            Listener.receiveConnection(p);
            Subscriber.answerConnection(socket, io); 
        });

        socket.on('clt_inviting_player', (targetSocketId: string, inviter: Player) => {
            io.to(targetSocketId).emit("svr_transfer_invite", inviter);
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected with ID: ${socket.id}`);
            Listener.receiveDisconnection(socket);
            Subscriber.answerDisconnection(socket, io);
        });

        socket.on('clt_respond_invite', (playerData: PlayerData, inviter: Player, accepted) => {
            if (!accepted) return;

            const instanciatedInviter = new Player(
                inviter.accountId,
                inviter.nickname,
                inviter.level,
                inviter.status,
                inviter.socketId
            );
            
            console.log(`Player ${playerData.nickname} accepted ${inviter.nickname}'s invite`);
            
            const oldRoom = inviter.matchRoom;
            if (!oldRoom.connectedPlayers?.some(p => p.socketId == instanciatedInviter.socketId))
                oldRoom.connectedPlayers?.push(instanciatedInviter.toData());

            const updatedRoom = inviter.matchRoom;
            if (!oldRoom.connectedPlayers?.some(p => p.socketId == playerData.socketId))
                updatedRoom.connectedPlayers?.push(playerData);

            updatedRoom.connectedPlayers?.forEach((p) => {
                if (![playerData.accountId].includes(p.accountId)) {
                    io.to(p.socketId).emit("svr_give_updated_matchRoom", updatedRoom);
                } else {
                    io.to(p.socketId).emit("svr_give_updated_matchRoom", oldRoom);
                }
            });
        });
    });
}