import AccountService from "../../../application/services/account.service.js";
import Account from "../../../domain/entities/account.js";
import Player from "../../../domain/entities/player.js";
import { validateGetPlayerByIdParams, validatePlayerSchema } from "../schemas/account.schema.js";

export default class AccountController {
    private _accountService: AccountService;
    
    constructor(playerService: AccountService) {
        this._accountService = playerService;
    }

    async getPlayerByAccountId(accountId: string): Promise<Account | null> {
        const isValid = validateGetPlayerByIdParams(accountId);
        if (!isValid) {
            throw new Error("Invalid player ID");
        }

        return this._accountService.getPlayerByAccountId(accountId);
    }

    async upsertAccount(account: Account): Promise<{ message: string, account: Account | null}> {
        // const isValid = validatePlayerSchema(player);
        // if (!isValid) {
        //     throw new Error("Invalid player data");
        // }

        return this._accountService.upsertAccount(account);
    }
}