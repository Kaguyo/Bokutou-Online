import './App.css'
import { useEffect, useState } from 'react';
import MainMenu from './components/MainMenu';
import UserCard from './components/UserCard';
import MatchRoom from './components/MatchRoom';
import { InviteCard } from './components/InviteCard';
import guest from '../guest.json';
import { UserContext } from './contexts/UserContext';
import { User } from './models/User';
import { SocketContext } from './contexts/SocketContext';
import { InviteContext } from './contexts/InviteContext';
import { socket } from './api/socket';
import type { Invite } from './components/InviteCard';
import { getStoredAccountHandle, pickMyAccountFile, saveAccountToIndexedDB, verifyAccountPermission } from './utils/indexedDb';
import GuideToSave from './components/GuideToSave';

function App() {
  const [accountHandle, setAccountHandle] = useState<FileSystemFileHandle | null>(null);
  const [isActive, setIsActive] = useState(false);

  const [me, setMe] = useState<User | null>(null);
  const [inviteList, setInviteList] = useState<Invite[]>([]);

  async function handleSelectAccount(): Promise<void>{
    const handle = await pickMyAccountFile();
    if (!handle) return;

    if (handle.name != "account.save.json") throw Error("invalid file provided.");
    
    try {
      await saveAccountToIndexedDB(handle);
      await getStoredAccountHandle();
    } catch (error) {
      console.error("Failure when trying to save account to IndexedDB", error);
    }
  };


  
  // useEffect for invites sent to this client
  useEffect(() => {
    function handleNewInvite(newInviter: User) {
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

  // useEffect to search for save file in the indexedDb
  useEffect(() => {
    async function init() {
      try {
      const handle = await getStoredAccountHandle();
        if (!handle) return;
        setAccountHandle(handle); // gets handle for account file found in indexedDb
        let isActive = await verifyAccountPermission(handle);
        if (!isActive){
          return;
        }
        
        setIsActive(true);
      } catch (error) {
        console.error(error);
      }
    }
    init();

  }, []);

  return (
    <>
      <SocketContext.Provider value={socket}>
        <UserContext.Provider value={{me, setMe}}>
          <InviteContext.Provider value={{ inviteList, setInviteList}}>
            <h1>Bokutou no Game</h1>
            <div className="game-screen">
              <h2 id="auto-save-info">Sync Save: {isActive && accountHandle ? <span id="on">ON</span> : <span id="off">OFF</span>}</h2>
              <MainMenu/>
              <MatchRoom/>
              <div onClick={handleSelectAccount} id="save-box">
                <img src="save.png" alt=""/>
                {
                  isActive && accountHandle ? 
                  <span id="auto-save-on">✓</span>:
                  <span id="auto-save-off">X</span>  
                }
              </div>
              <UserCard accountHandle={accountHandle} user={me}/>
              <InviteCard/>
              <GuideToSave 
              accountHandle={accountHandle}
              isActive={isActive}
              setIsActive={setIsActive}
              handleSelectAccount={handleSelectAccount}/>  
            </div>
          </InviteContext.Provider>
        </UserContext.Provider>
      </SocketContext.Provider>
    </>
  );
}

export default App;