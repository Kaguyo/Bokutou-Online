import { Server as IOServer, Socket } from "socket.io";
import Player, { MatchRoom, PlayerData } from "../../domain/entities/player.js";
import Listener from "./listeners/listener.js";
import Subscriber from "./subscribers/subscriber.js";
import { Logger } from "../../resources/utils.js";

interface ClientToServerEvents {
  clt_sending_player: (invitedPlayer: PlayerData) => void;
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
        socket.on('clt_sending_player', (invitedPlayer: PlayerData) => {
            const p = new Player(
            invitedPlayer.accountId, invitedPlayer.nickname, invitedPlayer.level,
            invitedPlayer.status, socket.id
            )
            Listener.receiveConnection(p);
            Subscriber.answerConnection(socket, io); 
        });

        socket.on('clt_inviting_player', (targetSocketId: string, inviter: Player) => {
            io.to(targetSocketId).emit("svr_transfer_invite", inviter);
        });

        socket.on('disconnect', () => {
            Logger(`User disconnected with ID: ${socket.id}`);
            
            const p = Player.globalPlayerList.find(p => p.socketId == socket.id);
            if (!p) return;

            // Updates matchroom for player's teammates before server removes this respected player from global list
            Listener.leaveMatchRoom(p.toData(), io);

            // Removes from global list (receiveDisconnection), then updates every client (answerDisconnection)
            Listener.receiveDisconnection(socket);
            Subscriber.answerDisconnection(socket, io);
        });

        socket.on('clt_respond_invite', (invitedPlayer: PlayerData, inviter: Player, accepted: boolean) => {
            if (!accepted) return;

            // 1. Find the source room
            const sourcePlayer = Player.globalPlayerList.find(p => p.socketId == inviter.socketId);
            if (!sourcePlayer || !sourcePlayer.matchRoom) return;

            // 2. New room containing every single player that is expected to be there after invited player joined
            const updatedRoom: MatchRoom = structuredClone(sourcePlayer.matchRoom);
            updatedRoom.connectedPlayers.push(sourcePlayer.toData());
            


            const p = Player.globalPlayerList.find(x => x.socketId == invitedPlayer.socketId);
            if (!p) return;

            // 3. Initial value for invited target's index in room
            p.matchRoom.playerIndexInRoom = updatedRoom.connectedPlayers.length;

            // 4. Actual room that will be distributed to UI and server instances updates
            updatedRoom.connectedPlayers.push(p.toData());

            // 5. New list to sort updatedList
            const newOrganizedPlayerList: Player[] = [];

            // 6. Fills up list to start sorting
            updatedRoom.connectedPlayers.forEach((x) => {
                const _ = Player.globalPlayerList.find((pl => pl.socketId == x.socketId));
                if (_) newOrganizedPlayerList.push(_);
            });
            
            // 7. Clears previous array and sorts players by playerIndexInRoom (ascending)
            updatedRoom.connectedPlayers = [];

            // Sort newOrganizedPlayerList by playerIndexInRoom ascending
            newOrganizedPlayerList.sort((a, b) => a.matchRoom.playerIndexInRoom - b.matchRoom.playerIndexInRoom);

            // Fill updatedRoom.connectedPlayers with sorted players
            Logger("LISTA SORTED:")
            newOrganizedPlayerList.forEach((p) => {
                console.log(p);
                updatedRoom.connectedPlayers.push(p.toData());
            });

            // 8. Update server-side matchrooms and send to clients
            updatedRoom.connectedPlayers.forEach((playerData) => {
                const playerInstance = Player.globalPlayerList.find(pl => pl.socketId == playerData.socketId);
                if (!playerInstance) return;

                // Create server-side matchroom that excludes themselves
                const serverSideRoom: MatchRoom = {
                    ...updatedRoom,
                    connectedPlayers: updatedRoom.connectedPlayers.filter(p => p.socketId !== playerData.socketId),
                    // PRESERVE the playerIndexInRoom from the actual player instance
                    playerIndexInRoom: playerInstance.matchRoom.playerIndexInRoom
                };

                // Create client-side matchroom that includes themselves for UI building
                const clientSideRoom: MatchRoom = {
                    ...updatedRoom,
                    connectedPlayers: [...updatedRoom.connectedPlayers],
                    // PRESERVE the playerIndexInRoom
                    playerIndexInRoom: playerInstance.matchRoom.playerIndexInRoom
                };

                // Update the player's matchroom in the global list
                playerInstance.matchRoom = serverSideRoom;

                // Send to client: with themselves included
                io.to(playerData.socketId).emit("svr_give_updated_matchRoom", clientSideRoom);
            });
        });

        socket.on('clt_leave_matchroom', (disconnectedPlayer: PlayerData, newRoom: MatchRoom | null) => {
            Listener.leaveMatchRoom(disconnectedPlayer, io);
            if (newRoom) return; // if theres replacing room, server doesn't feedback player for their disconnection
            Subscriber.leaveMatchRoom(disconnectedPlayer, io); // feeds player's UI and server data
        });
    });
}