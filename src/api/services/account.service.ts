// api/services/account.service.ts
import Account from "../../models/Account";

export const accountService = {
  upsertAccount: async (file: File | null, account: Account): Promise<Account> => {
    const formData = new FormData();
    
    // 1. Append the account data as a string
    formData.append('account', JSON.stringify(account));
    
    // 2. Append the file if it exists
    if (file) {
      formData.append('avatar', file);
    }

    console.log("Sending Upsert request for Account with Id:", account.id);

    try {
      const response = await fetch('http://localhost:4000/accounts', {
        method: 'POST',
        // Note: Do NOT manually set 'Content-Type' header here. 
        // The browser automatically sets it to 'multipart/form-data' 
        // with the correct boundary when it sees FormData.
        body: formData,
      });

      if (!response.ok) {
        // Attempt to parse error message from server if available
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.statusText}`);
      }
      const result = await response.json()
      console.log(result)
      return await result;
    } catch (error) {
      console.error("Account upsert failed:", error);
      throw error;
    }
  }
};