import { Connection, Model } from 'mongoose';
import Player from '../../../domain/entities/player.js';

export default class PlayerRepository {
  private model: Model<any>;

  constructor(dbConnection: Connection) {
    this.model = dbConnection.model('Player', (Player as any).schema || {});
  }

  async upsertPlayer(player: Player): Promise<{ message: string; player: Player | null }> {
    try {
      if (!player.id) {
        const lastPlayer = await this.model
          .findOne({}, { id: 1 })
          .sort({ id: -1 })
          .lean();
        
        if (lastPlayer && lastPlayer.id) {
          player.id = (parseInt(lastPlayer.id) + 1).toString();
        } else {
          player.id = "10000000";
        }
      }

      const result = await this.model.findOneAndUpdate(
        { id: player.id },
        { $set: player },
        { 
          upsert: true, 
          new: true, 
          runValidators: true 
        }
      );
      
      console.log(`Player upserted for ID: ${player.id}`);
      
      return {
        message: "Player upserted successfully",
        player: result.toObject() as Player
      };

    } catch (err) {
      throw err instanceof Error ? err : new Error(String(err));
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
        playerData.avatar64 || null,
        {} as any
      );
    } catch (err) {
      console.error("Error finding Player by ID:", err);
      return null;
    }
  }
}