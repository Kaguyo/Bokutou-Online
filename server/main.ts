import express from "express";
import http from "http";
import setupPlayerRoutes from "./api/rest/builder/player.js";
import PlayerRepository from "./infrastructure/repositories/mongodb/player.js";
import PlayerService from "./application/services/player.js";
import PlayerController from "./api/rest/controllers/playerController.js";
import initWebSocketServer from "./api/websocket/server.js";
import Database from "./infrastructure/repositories/mongodb/connection.js";

const app = express();

const db = new Database();
await db.connect();
const playerRepo = new PlayerRepository(db.getConnection());
const playerService = new PlayerService(playerRepo);
const playerController = new PlayerController(playerService);

setupPlayerRoutes(app, playerController);

const server = http.createServer(app);

initWebSocketServer(server);

// --- Server Listener ---
const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});