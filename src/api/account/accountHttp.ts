import Account from "../../models/Account";
import env from "../../../env.json";

export const accountHttp = {
  upsertAccount: async (account: Account): Promise<Account> => {
    try {
      const payload: any = { ...account };

      const response = await fetch(env.SERVER_URL + "/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.statusText}`);
      }
      const result = await response.json();
      const acc = result.account;
      console.log("Account returned from server:", acc);
      return acc;

    } catch (error) {
      console.error("Account upsert failed:", error);
      throw error;
    }
  }
};
