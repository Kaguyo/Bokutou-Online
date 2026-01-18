import { Server as IOServer, Socket } from "socket.io";
import Player from "../../domain/entities/player.js";
import Listener from "./listeners/listener.js";
import Subscriber from "./subscribers/subscriber.js";

interface ClientToServerEvents {
  clt_sending_player: (player: Player) => void;
  clt_inviting_player: (socketId: string, inviter: Player) => void;
}

interface ServerToClientEvents {
  svr_global_connected_players: (players: Player[]) => void;
  svr_transfer_invite: (inviter: Player) => void;
}

interface ClientPlayerInput {
  id: string;
  nickname: string;
  level: number;
  status: string;
}

export default function initWebSocketServer(server: import("http").Server  | import("https").Server) {
    const io = new IOServer<ClientToServerEvents, ServerToClientEvents>(server, {
        cors: { origin: '*' }
    });

    io.on('connection', (socket: Socket) => {
        console.log(`User connected with ID: ${socket.id}`);
        socket.on('clt_sending_player', (playerData: ClientPlayerInput) => {
            const p = new Player(
            playerData.id, playerData.nickname, playerData.level,
            playerData.status, socket
            )
            Listener.receiveConnection(p, socket);
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
    });
}