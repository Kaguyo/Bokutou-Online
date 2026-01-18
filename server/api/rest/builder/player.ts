import { Express, Request, Response } from "express";
import PlayerController from "../controllers/playerController.js";
import { validatePlayerSchema } from "../schemas/playerSchema.js";

export default function setupPlayerRoutes(app: Express, playerController: PlayerController): void {
    app.get('/players/:id', async (req: Request, res: Response) => {
        try {
            const playerId = req.params.id;
            
            const player = await playerController.getPlayerById(playerId as string);
            if (!player) {
                return res.status(404).json({ message: "Player not found" });
            }

            res.status(200).json(player);

        } catch (error: Error | any) {
            if (error.message === "Invalid player ID") {
                return res.status(400).json({ message: "Invalid player ID" });
            }
            res.status(500).json({ message: "Internal Server Error: " +  error.message });
        }
    });

    app.post('/players', async (req: Request, res: Response) => {
        try {
            const playerData = req.body;
            const isValid = validatePlayerSchema(playerData);

            if (!isValid) {
                return res.status(400).json({ message: "Invalid player data" });
            }

            const upsertedPlayer = await playerController.upsertPlayer(playerData);
            res.status(200).json(upsertedPlayer);
        } catch (error) {
            res.status(400).json({ message: "Invalid player data" });
        }
    });
}
