import { Express, Request, Response } from "express";
import Player from "../../domain/entities/player.js";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import AccountController from "./controllers/account.controller.js";

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/avatars');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const playerId = req.body.id;
    const ext = path.extname(file.originalname);
    cb(null, `${playerId}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

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

    app.post('/accounts', upload.single('avatar'), async (req: Request, res: Response) => {
        try {
            console.log("Received POST/request with:", req.body)
            const playerData = req.body;
            //const isValid = validatePlayerSchema(playerData);

            // if (!isValid) {
            //     return res.status(400).json({ message: "Invalid player data" });
            // }

            // Check if player is online
            const onlinePlayer = Player.globalPlayerList.find(p => p.accountId === playerData.id);

            // Only save avatar info if player is online
            if (onlinePlayer && req.file) {
                playerData.avatarPath = req.file.path;
                playerData.avatarFilename = req.file.filename;
            } else if (!onlinePlayer && req.file) {
                console.log("Corresponding player wasn't online")
                // Player is offline - clean up uploaded file
                await fs.unlink(req.file.path).catch(err => 
                    console.error('Failed to delete uploaded file:', err)
                );
            }
            const result = await accountController.upsertAccount(playerData);
            
            res.status(200).json(result);

        } catch (error: any) {
            console.error('Error upserting player:', error);
            
            if (error instanceof multer.MulterError) {
                if (error.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ message: "File too large (max 5MB)" });
                }
                return res.status(400).json({ message: `Upload error: ${error.message}` });
            }
            
            res.status(400).json({ message: "Invalid player data" });
        }
    });

    app.get('/accounts/:id/avatar', async (req: Request, res: Response) => {
        try {
            const playerId = req.params.id;
            const uploadDir = path.join(__dirname, '../uploads/avatars');
            
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

            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'public, max-age=31536000');
            
            res.sendFile(filePath);
        } catch (error) {
            console.error('Error serving avatar:', error);
            res.status(500).json({ message: "Error retrieving avatar" });
        }
    });
}