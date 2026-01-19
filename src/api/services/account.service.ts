// api/services/account.service.ts
import Account from "../../models/Account";

export const accountService = {
  upsertAccount: async (file: File | null, account: Account): Promise<JSON> => {
    const formData = new FormData();
    formData.append('account', JSON.stringify(account));
    if (file) {
      formData.append('avatar', file);
    }

    console.log("Sending Upsert request for Account with Id:", account.id)
    const response = await fetch('http://localhost:4000/players', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload avatar: ${response.statusText}`);
    }

    return response.json();
  }
};