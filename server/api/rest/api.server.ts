import { Express, Request, Response } from "express";
import fs from "fs/promises";
import AccountController from "./controllers/account.controller.js";
import path from "path";
import { fileURLToPath } from "url";

// cria __filename e __dirname em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function setupAccountRoutes(app: Express, accountController: AccountController): void {
    app.get('/accounts/:id', async (req: Request, res: Response) => {
        try {
            const playerId = req.params.id;
            
            const player = await accountController.getPlayerByAccountId(playerId as string);
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

    app.post('/accounts', async (req: Request, res: Response) => {
        try {
            const accountData = req.body;

            const { avatar64, id } = accountData;

            if (avatar64) {
                const uploadDir = path.join(__dirname, '../../uploads/avatars');
                await fs.mkdir(uploadDir, { recursive: true });

                // Separar dados base64 da parte antes da vírgula se tiver data URI
                const base64Data = avatar64.split(',').pop();
                const buffer = Buffer.from(base64Data as string, 'base64');

                // Determinar extensão (aqui exemplo sempre png — pode adaptar)
                const filename = `${id}.png`;
                const fullPath = path.join(uploadDir, filename);

                await fs.writeFile(fullPath, buffer);
            }

            const result = await accountController.upsertAccount(accountData);

            res.status(200).json(result);
        } catch (error: any) {
            console.error(error);
            res.status(400).json({ message: "Erro ao salvar conta" });
        }
    });

    app.get('/accounts/:id/avatar', async (req: Request, res: Response) => {
        try {
            const playerId = req.params.id;
            const uploadDir = path.join(__dirname, '../../uploads/avatars');
            
            const extensions = ['.png', '.jpg', '.jpeg', '.gif'];
            let filePath: string | null = null;
            
            for (const ext of extensions) {
                const testPath = path.join(uploadDir, `${playerId}${ext}`);
                try {
                    await fs.access(testPath);
                    filePath = testPath;
                    break;
                } catch {
                    continue;
                }
            }

            if (!filePath) {
                return res.status(404).json({ message: "Avatar not found" });
            }

            const ext = path.extname(filePath);
            const contentType = {
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.gif': 'image/gif'
            }[ext] || 'application/octet-stream';

            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type");
            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            
            res.sendFile(filePath);
        } catch (error) {
            console.error('Error serving avatar:', error);
            res.status(500).json({ message: "Error retrieving avatar" });
        }
    });
}