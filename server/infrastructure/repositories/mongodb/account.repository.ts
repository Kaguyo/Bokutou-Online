import { Connection, Model } from 'mongoose';
import Account from '../../../domain/entities/account.js';
import { AccountSchema } from './account.schema.js'; // Import the schema

export default class AccountRepository {
  private model: Model<any>;

  constructor(dbConnection: Connection) {
    // Use the proper schema
    this.model = dbConnection.model('Account', AccountSchema);
  }

  async upsertAccount(account: Account): Promise<{ message: string; account: Account | null }> {
    try {
      if (!account.id) {
        const lastPlayer = await this.model
          .findOne({}, { id: 1 })
          .sort({ id: -1 })
          .lean();
        
        if (lastPlayer && lastPlayer.id) {
          account.id = (parseInt(lastPlayer.id) + 1).toString();
        } else {
          account.id = "10000000";
        }
      }

      const result = await this.model.findOneAndUpdate(
        { id: account.id },
        { $set: account },
        { 
          upsert: true, 
          new: true, 
          runValidators: true 
        }
      );

      console.log(`Account upserted for ID: ${account.id}`);
      
      return {
        message: "Account upserted successfully",
        account: result.toObject() as Account
      };

    } catch (err) {
      throw err instanceof Error ? err : new Error(String(err));
    }
  }

  async findAccountById(accountId: string): Promise<Account | null> {
    try {
      const accountData = await this.model.findOne({ id: accountId }).lean();

      if (!accountData) {
        return null;
      }

      return new Account(
        accountData.id,
        accountData.nickname || '', 
        accountData.level || 0,
        accountData.avatar64 || ''
      );
    } catch (err) {
      console.error("Error finding Account by ID:", err);
      return null;
    }
  }
}