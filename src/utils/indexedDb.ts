// Chave para guardar o handle no IndexedDB
const FILE_HANDLE_KEY = "account_save_handle";

export async function saveAccountToIndexedDB(handle: FileSystemFileHandle): Promise<void> {
  return new Promise((resolve, reject) => {
    const openRequest = indexedDB.open("storage-db", 1);

    openRequest.onupgradeneeded = () => {
      const db = openRequest.result;
      if (!db.objectStoreNames.contains("storage")) {
        console.warn("No storage store was found in IndexedDB, starting attempt to create a new one.");
        db.createObjectStore("storage");
      }
    };

    openRequest.onerror = () => reject(new Error("Failed to open IndexedDB"));

    openRequest.onsuccess = () => {
      const db = openRequest.result;
      const tx = db.transaction("storage", "readwrite");
      const store = tx.objectStore("storage");
      console.log("Success when creating new store");
        
      const request = store.put(handle, FILE_HANDLE_KEY);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("Failed to save account to IndexedDB"));
      
      // Close connection when transaction is finished
      tx.oncomplete = () => db.close();
    };
  });
}

// Busca arquivo de conta salva no indexedDb
export async function getStoredAccountHandle(): Promise<FileSystemFileHandle | null> {
  return new Promise((resolve) => {
    const openRequest = indexedDB.open("storage-db", 1);
    openRequest.onsuccess = () => {
      const db = openRequest.result;
      const storeName = "storage";
      if (!db.objectStoreNames.contains(storeName)) {
        console.warn(`No store named ${storeName} was found in IndexedDB, starting attempt to create a new one.`);
        try {
        db.createObjectStore("storage");
        } catch (error) {
          console.error("Failed at storage creation.", error);
          console.warn("Deleting previous DB to fix storage creation issue.")
          indexedDB.deleteDatabase("storage-db");
          return;
        }
      }
      
      const tx = db.transaction("storage", "readonly");
      const store = tx.objectStore("storage");
      const request = store.get(FILE_HANDLE_KEY);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => {
        throw Error("Failed to get handle from IndexedDB.")
      }
    };
    openRequest.onerror = () => resolve(null);
  });
}
