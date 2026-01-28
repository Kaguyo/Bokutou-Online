import { Server as IOServer, Socket } from "socket.io";
import Player, { MatchRoom, PlayerData } from "../../domain/entities/player.js";
import Listener from "./listeners/listener.js";
import Subscriber from "./subscribers/subscriber.js";
import { Logger } from "../../resources/utils.js";

interface ClientToServerEvents {
  clt_sending_player: (playerData: PlayerData) => void;
  clt_inviting_player: (socketId: string, inviter: Player) => void;
  clt_respond_invite: (invitedPlayer: PlayerData, inviter: Player, acceptInvite: boolean ) => Promise<MatchRoom | null>;
  clt_leave_matchroom: (disconnectedPlayer: PlayerData, newRoom: MatchRoom | null) => void;
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
        Logger(`Player connected with ID: ${socket.id}`);
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
            Logger(`User disconnected with ID: ${socket.id}`);
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
            
            Logger(`Player ${playerData.nickname} accepted ${inviter.nickname}'s invite`);
            
            const oldRoom = Player.globalPlayerList.find(p => p.socketId == inviter.socketId)?.matchRoom;
            if (!oldRoom?.connectedPlayers?.some(p => p.socketId == instanciatedInviter.socketId)){
                // Adds inviter to the oldRoom to keep exact sequence in the list organization
                oldRoom?.connectedPlayers?.push(instanciatedInviter.toData());
            }

            const updatedRoom = Player.globalPlayerList.find(p => p.socketId == inviter.socketId)?.matchRoom;

            if (!updatedRoom?.connectedPlayers?.some(p => p.socketId == playerData.socketId))
                updatedRoom?.connectedPlayers?.push(playerData);

            updatedRoom?.connectedPlayers?.forEach((p) => {
                if (![playerData.accountId].includes(p.accountId)) {
                    // Keeps players' matchroom syncronized
                    Player.globalPlayerList.find(pl => pl.socketId == p.socketId)!.matchRoom = updatedRoom;
                    io.to(p.socketId).emit("svr_give_updated_matchRoom", updatedRoom);
                } else {
                    // Keeps invited player's matchroom syncronized
                    Player.globalPlayerList.find(pl => pl.socketId == playerData.socketId)!.matchRoom = oldRoom!;
                    io.to(p.socketId).emit("svr_give_updated_matchRoom", oldRoom!);
                }
            });
        });

        socket.on('clt_leave_matchroom', (disconnectedPlayer: PlayerData, newRoom: MatchRoom | null) => {
            Listener.leaveMatchRoom(disconnectedPlayer, io);
            if (newRoom) return; // if theres replacing room, server doesn't feedback player for their disconnection
            Subscriber.leaveMatchRoom(disconnectedPlayer, io); // feeds player's UI and server data
        });
    });
}