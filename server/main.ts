import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import Listener from "./api/listener.js";
import Player from "./application/player.js";
import Subscriber from "./api/subscriber.js";

interface ClientToServerEvents {
  clt_sending_player: (player: Player) => void;
}

interface ServerToClientEvents {
  svr_global_connected_players: (players: Player[]) => void;
}

const app = express();
app.use(cors());

const server = http.createServer(app);
import { Server as IOServer } from 'socket.io';

const io = new IOServer<ClientToServerEvents,ServerToClientEvents>(server, {
  cors: { origin: '*' }
});

io.on('clt_sending_player', (player: Player) => {
  Listener.receiveConnection(player);
  Subscriber.answerConnection(player.socket, io);

  player.socket.on('disconnect', () => {
    Listener.receiveDisconnection(player);
    Subscriber.answerDisconnection(player.socket, io);
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

