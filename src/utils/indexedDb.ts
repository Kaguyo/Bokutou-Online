import Account from "../models/Account";
import { User } from "../models/User";

export async function getImageFromIndexedDB(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const openRequest = indexedDB.open("images-db", 1);

    openRequest.onerror = () => reject("Erro ao abrir DB");

    openRequest.onsuccess = () => {
      const db = openRequest.result;
      const tx = db.transaction("images", "readonly");
      const store = tx.objectStore("images");
      const getRequest = store.get("lastImage");

      getRequest.onsuccess = () => {
        const blob: Blob | undefined = getRequest.result;
        if (!blob) {
          resolve(null);
        } else {
          const url = URL.createObjectURL(blob);
          resolve(url);
        }
      };

      getRequest.onerror = () => reject("Erro ao recuperar imagem");
      
      // Close the connection once the transaction finishes
      tx.oncomplete = () => db.close();
    };
  });
}



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
      if (!db.objectStoreNames.contains("storage")) {
        console.warn("No storage store was found in IndexedDB, starting attempt to create a new one.");
        try {
        db.createObjectStore("storage");
        } catch (error) {
          console.error("Failed at storage creation.", error);
          console.warn("Deleting previous DB to allow storage creation.")
          indexedDB.deleteDatabase("storage-db");
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

// Abre o seletor forçando o nome 'myAccount.json'
export async function pickMyAccountFile(): Promise<FileSystemFileHandle> {
  const [handle] = await (window as unknown as any).showOpenFilePicker({
    suggestedName: 'account.save.json',
    types: [{
      description: 'Account Data (JSON)',
      accept: { 'application/json': ['.json'] }
    }],
    multiple: false
  });

  return handle;
}

export async function pickImageAndConvert(accountHandle: FileSystemFileHandle | null, user: User | null): Promise<void> {
  console.log("executed")
  const [handle] = await (window as any).showOpenFilePicker({
    types: [
      {
        description: "Imagem (jpg, png, gif)",
        accept: {
          "image/*": [".jpg", ".jpeg", ".png", ".gif"],
        },
      },
    ],
    multiple: false,
  });

  const file = await handle.getFile();
  const mimeType = file.type;

  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64Only = dataUrl.split(",")[1];
      resolve(base64Only);
    };
    reader.readAsDataURL(file);
  });

  const updateAccountObject: Account = new Account("100000000", user?.nickname!, base64);

  if (accountHandle) {
    let success = await updateAccountFile(accountHandle, updateAccountObject);
    if (success){
      const imageUrl = URL.createObjectURL(file);

      const userPfpElements = document.getElementsByClassName("user-pfp");
      
      // Como getElementsByClassName retorna um HTMLCollection, precisamos iterar
      Array.from(userPfpElements).forEach((img) => {
        if (img instanceof HTMLImageElement) {
          img.src = imageUrl;
          User.pfpImageUrl = imageUrl;
        }
      });
    }
  }
}

// Verifica/Solicita permissão (Deve ser chamado num evento de clique)
export async function verifyAccountPermission(handle: FileSystemFileHandle): Promise<boolean> {
  const options = { mode: 'readwrite'};
  if ((await (handle as any).queryPermission(options)) === 'granted') return true;
  return (await (handle as any).requestPermission(options)) === 'granted';
}


export async function updateAccountFile(handle: FileSystemFileHandle, data: Account): Promise<boolean> {
  try {
    const writable = await (handle as any).createWritable();
    await writable.write(JSON.stringify(data, null, 2)); // JSON formatado
    await writable.close();
    console.log("account.save.json atualizado com sucesso!");
    return true;
  } catch (error) {
    console.error("Falha ao escrever no arquivo:", error);
    return false;
  }
}