import PlayerService from "../../../application/services/player.service.js";
import Player from "../../../domain/entities/player.js";
import { validateGetPlayerByIdParams, validatePlayerSchema } from "../schemas/playerSchema.js";

export default class PlayerController {
    private _playerService: PlayerService;
    
    constructor(playerService: PlayerService) {
        this._playerService = playerService;
    }

    async getPlayerById(playerId: string): Promise<Player | null> {
        const isValid = validateGetPlayerByIdParams(playerId);
        if (!isValid) {
            throw new Error("Invalid player ID");
        }

        return this._playerService.getPlayerById(playerId);
    }

    async upsertPlayer(player: Player): Promise<{ message: string, player: Player | null}> {
        const isValid = validatePlayerSchema(player);
        if (!isValid) {
            throw new Error("Invalid player data");
        }

        return this._playerService.upsertPlayer(player);
    }
}