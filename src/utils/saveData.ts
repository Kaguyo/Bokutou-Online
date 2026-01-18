import { Dispatch, SetStateAction, useContext } from "react";
import Account from "../models/Account";
import { User } from "../models/User";
import { getStoredAccountHandle, saveAccountToIndexedDB } from "./indexedDb";

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

// Verifica/Solicita permissão (Deve ser chamado num evento de clique)
export async function verifyAccountPermission(handle: FileSystemFileHandle): Promise<boolean> {
  const options = { mode: 'readwrite'};
  if ((await (handle as any).queryPermission(options)) === 'granted') return true;
  return (await (handle as any).requestPermission(options)) === 'granted';
}

// Carrega dados da conta para o user através de um handle providenciado por parametro.
// Retorna como resultado uma nova instância de Account com os valores contidos do handle.
export async function loadGame(handle: FileSystemFileHandle): Promise<Account | undefined> {
    try {
      const jsonSave = await handle.getFile();
      const loadedGame = await JSON.parse(await jsonSave.text());
      
      if (!loadedGame ){
        console.warn("Failure to load game.");
        return;
      }

      const result = new Account(loadedGame.id, loadedGame.nickname, loadedGame.level, loadedGame.player64);
      console.log("Game Loaded");
      return result;

    } catch(err) {
      console.error("Error to load game:", err);
      return;
    }
}

// Função para seleção de imagem e alteração de registro de imagem de perfil da conta.
export async function pickImageAndConvert(
  me: User,
  accountHandle: FileSystemFileHandle | null,
  setProfilePicUrl: Dispatch<SetStateAction<string | null>>,
  setLoggedAccount: Dispatch<SetStateAction<Account | null>>): Promise<boolean> {
  
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

  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64Only = dataUrl.split(",")[1];
      resolve(base64Only);
    };
    reader.onloadend = () => {
      setProfilePicUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  });

  const updateAccountObject: Account = new Account("1", me.nickname, me.level, base64);

  if (accountHandle) {
    let success = await updateAccountFile(accountHandle, updateAccountObject);
    
    if (!success) return false;
    
    try {
      await saveAccountToIndexedDB(accountHandle);
    } catch (indexedDbErr) {
      console.error("Failure to save account to IndexedDB.", indexedDbErr);
      return false;
    }

    setLoggedAccount(updateAccountObject);
  }
  
  return true;
}

// Função para seleção e retorno de handle para um arquivo de progresso de uma conta.
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