import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

class ServerToClientEvents {

}

class ClientToServerEvents {

}

const app = express();
app.use(cors());

export const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});



const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

