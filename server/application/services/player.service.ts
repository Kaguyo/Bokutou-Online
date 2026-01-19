import Player from "../../domain/entities/player.js";
import PlayerRepository from "../../infrastructure/repositories/mongodb/player.repository.js";

export default class PlayerService {
  private _playerRepository: PlayerRepository;

  constructor(playerRepository: PlayerRepository) {
    this._playerRepository = playerRepository;
  }

  async getPlayerById(playerId: string): Promise<Player | null> {
    const player = await this._playerRepository.findPlayerById(playerId);
    return player;
  }

  async upsertPlayer(player: Player): Promise<{ message: string, player: Player | null}> {
    return this._playerRepository.upsertPlayer(player);
  }
}
