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

  async upsertAccount(account: Account): Promise<{ message: string, account: Account | null}> {
    return this._accountRepository.upsertAccount(account);
  }
}
