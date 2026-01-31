import './App.css'
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import MainMenu from './components/MainMenu';
import UserCard from './components/UserCard';
import MatchRoom from './components/MatchRoom';
import { InviteCard } from './components/InviteCard';
import { PlayerContext } from './contexts/PlayerContext';
import { SocketContext } from './contexts/SocketContext';
import { InviteContext } from './contexts/InviteContext';
import { socket } from './api/socket';
import type { Invite } from './components/InviteCard';
import { getStoredAccountHandle, saveAccountToIndexedDB} from './utils/indexedDb';
import GuideToSave from './components/GuideToSave';
import { verifyAccountPermission, loadGame, pickMyAccountFile } from './utils/saveData';
import Account from './models/Account';
import guest from '../guest.json';
import { Player } from './models/Player';

function App() {
  const [accountHandle, setAccountHandle] = useState<FileSystemFileHandle | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [me, setMe] = useState<Player | null>(null);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [inviteList, setInviteList] = useState<Invite[]>([]);
  const [loggedAccount, setLoggedAccount] = useState<Account | null>(null);
  const [globalPlayerList, setGlobalPlayerList] = useState<Player[]>([]);

  async function handleSelectAccount(
    setIsLoading: Dispatch<SetStateAction<boolean>> | null = null,
    setLoadingState: Dispatch<SetStateAction<string | null>> | null = null
  ): Promise<void>{
    const handle = await pickMyAccountFile();
    if (!handle) return;
    if (handle.name != "account.save.json") throw Error("invalid file provided.");
    
    try {
      setIsLoading?.(true);
      setLoadingState?.("Extraindo dados do save providenciado...");
      const account = await loadGame(handle);
      if (!account) throw Error();
      
      setLoadingState?.("Alocando save no cache do navegador...");
      await saveAccountToIndexedDB(handle);
      
      setLoadingState?.("Validando integridade do cache...");
      const saveHandle = await getStoredAccountHandle();
      if (!saveHandle) throw Error("Failure on attempt to get account handle from IndexedDB.");
      
      setLoadingState?.("Carregando dados da conta...");
      const newMe = new Player(loggedAccount?.id!, socket.id!, account!.nickname, account!.level, "Offline");
      setAccountHandle(saveHandle);
      setLoggedAccount(account);
      setMe(newMe);
      Player.updateProfilePicture(profilePicUrl, account, setProfilePicUrl);
      setLoadingState?.(null);
      setIsLoading?.(false);
      socket.disconnect();
    } catch (error) {
      console.error("Failure on attempt to load game.", error);
    }
  };
  

  // useEffect for invites sent to this client
  useEffect(() => {
    function handleNewInvite(newInviter: Player) {
      if (!inviteList.some(i => i.inviter.socketId === newInviter.socketId)) {
        const newInvite: Invite = { inviter: newInviter };
        setInviteList(prev => [...prev, newInvite]);
      }
    }

    socket.on("svr_transfer_invite", handleNewInvite);

    return () => {
      socket.off("svr_transfer_invite", handleNewInvite);
    };
  }, [inviteList]);

  // useEffect to search for save file in the indexedDb and if found, set initial configurations.
  useEffect(() => {
    async function init() {
      try {
        const handle = await getStoredAccountHandle();
        if (!handle) return;
        setAccountHandle(handle); // gets handle for account file found in indexedDb
        const isActive = await verifyAccountPermission(handle);
        if (!isActive) return;
        setIsActive(true);
        const loadAccount = await loadGame(handle);
        if (!loadAccount) { // login guest caso não tenha progresso salvo.
          const guestAccount = new Account(guest.id.toString(), guest.nickname, guest.level, guest.avatar64Base64);
          const newMe = new Player(loggedAccount?.id!, socket.id!, guest.nickname, guest.level, guest.status);
          setLoggedAccount(guestAccount);
          setMe(newMe);
          Player.updateProfilePicture(profilePicUrl, guestAccount, setProfilePicUrl);
          return;
        }

        // login com progresso detectado.
        setLoggedAccount(loadAccount);
        const newMe = new Player(loggedAccount?.id!, socket.id!, loadAccount!.nickname, loadAccount!.level, "Offline");
        setMe(newMe);
        Player.updateProfilePicture(profilePicUrl, loadAccount, setProfilePicUrl);
        setIsSynced(true);
      } catch (error) {
        console.error(error);
      }
    }
    
    init();

  }, []);

  // useEffect to set isSynced when isActive and accountHandle are set
  useEffect(() => {
    if (loggedAccount && isActive && accountHandle)
      setIsSynced(true);
  }, [isActive])

  return (
    <>
      <SocketContext.Provider value={{socket: socket, globalPlayerList: globalPlayerList, setGlobalPlayerList}}>
        <PlayerContext.Provider value={{me: me, setMe, profilePicUrl: profilePicUrl, setProfilePicUrl}}>
          <InviteContext.Provider value={{ inviteList: inviteList, setInviteList}}>
            <h1>Bokutou no Game</h1>
            <div className="game-screen">
              <h2 id="auto-save-info">Save: {!isActive || !accountHandle || !isSynced || !loggedAccount? <span id="off">OFF</span> : <span id="on">ON</span>}</h2>
              <MainMenu loggedAccount={loggedAccount} />
              <MatchRoom/>
              <div onClick={() => handleSelectAccount()} id="save-box">
                <img src="save.png" alt=""/>
                {
                  !isActive || !accountHandle || !isSynced || !loggedAccount? 
                  <span id="auto-save-off">X</span>:  
                  <span id="auto-save-on">✓</span>
                }
              </div>
              <UserCard accountHandle={accountHandle} loggedAccount={loggedAccount} profilePicUrl={profilePicUrl} setLoggedAccount={setLoggedAccount} setProfilePicUrl={setProfilePicUrl} setIsSynced={setIsSynced}/>
              <InviteCard/>
              <GuideToSave 
              accountHandle={accountHandle}
              isActive={isActive}
              setIsActive={setIsActive}
              handleSelectAccount={handleSelectAccount}/>  
            </div>
          </InviteContext.Provider>
        </PlayerContext.Provider>
      </SocketContext.Provider>
    </>
  );
}

export default App;