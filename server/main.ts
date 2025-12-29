import express from "express";
import http from "http";
import cors from "cors";
import { Server as IOServer, Socket } from "socket.io";
import Listener from "./api/listener.js";
import Player from "./application/player.js";
import Subscriber from "./api/subscriber.js"; 

interface ClientToServerEvents {
  clt_sending_player: (player: Player) => void;
}

interface ServerToClientEvents {
  svr_global_connected_players: (players: Player[]) => void;
}

interface ClientPlayerInput {
  id: string;
  nickname: string;
  level: number;
  status: string;
}

const app = express();
app.use(cors());

const server = http.createServer(app);

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

  socket.on('disconnect', () => {
    console.log(`User disconnected with ID: ${socket.id}`);
    Listener.receiveDisconnection(socket);
    Subscriber.answerDisconnection(socket, io);
  });
});

// --- Server Listener ---
const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});