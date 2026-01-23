import Account from "../../domain/entities/account.js";
import AccountRepository from "../../infrastructure/repositories/mongodb/account.repository.js";

export default class AccountService {
  private _accountRepository: AccountRepository;

  constructor(accountRepository: AccountRepository) {
    this._accountRepository = accountRepository;
  }

  async getPlayerByAccountId(accountId: string): Promise<Account | null> {
    const account = await this._accountRepository.findAccountById(accountId);
    return account;
  }

  async upsertAccount(accountData: Account | any): Promise<{ message: string, account: Account | null}> {
    try {
      // Parse do JSON se vier como string
      let account: Account;
      if (typeof accountData === 'string') {
        account = JSON.parse(accountData);
      } else if (typeof accountData.account === 'string') {
        account = JSON.parse(accountData.account);
      } else {
        account = accountData;
      }
      return this._accountRepository.upsertAccount(account);

    } catch (err) {
      throw err instanceof Error ? err : new Error(String(err));
    } 
  }
}
