import { Connection, Model } from 'mongoose';
import Player from '../../../domain/entities/player.js';

export default class PlayerRepository {
  private model: Model<any>;

  constructor(dbConnection: Connection) {
    this.model = dbConnection.model('Player', (Player as any).schema || {});
  }

  async upsertPlayer(player: Player): Promise<Error | null> {
    try {
      await this.model.updateOne(
        { id: player.id },
        { $set: player },
        { upsert: true }
      );

      console.log(`Player updated for ID: ${player.id}`);
      return null;
    } catch (err) {
      console.error("Error upserting Player:", err);
      return err instanceof Error ? err : new Error(String(err));
    }
  }

  async findPlayerById(playerId: string): Promise<Player | null> {
    try {
      const playerData = await this.model.findOne({ id: playerId }).lean();

      if (!playerData) {
        return null;
      }

      return new Player(
        playerData.id,
        playerData.nickname || '', 
        playerData.level || 0,
        playerData.status || '',
        {} as any
      );
    } catch (err) {
      console.error("Error finding Player by ID:", err);
      return null;
    }
  }
}