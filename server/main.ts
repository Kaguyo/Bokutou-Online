import express from "express";
import http from "http";
import setupAccountRoutes from "./api/rest/api.server.js";
import AccountRepository from "./infrastructure/repositories/mongodb/account.repository.js";
import AccountService from "./application/services/account.service.js";
import AccountController from "./api/rest/controllers/account.controller.js";
import setupWebSocketServer from "./api/websocket/ws.server.js";
import Database from "./infrastructure/repositories/mongodb/connection.js";
import cors from "cors";

const app = express();
app.use(cors());
const db = new Database();
await db.connect();
const accountRepo = new AccountRepository(db.getConnection());
const accountService = new AccountService(accountRepo);
const accountController = new AccountController(accountService);

setupAccountRoutes(app, accountController);

const server = http.createServer(app);

setupWebSocketServer(server);

// --- Server Listener ---
const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});