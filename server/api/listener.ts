
import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import Subscriber from "./subscriber.js";
import Player from "../application/player.js";

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const connectedPlayers: Player[] = [];

interface ServerToClientEvents {
  svr_global_connected_players: () => void;
}

interface ClientToServerEvents {
  
}




io.on('connection', (p: Player) => {
  console.log(`New client connected: ${p.socket}`);
  socket.on('disconnect', () => {
    io.emit(ServerToClientEvents.feed_global_players);
  });

});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});