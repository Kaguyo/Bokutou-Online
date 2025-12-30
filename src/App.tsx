import './App.css'
import { useContext, useEffect, useState } from 'react';
import MainMenu from './components/MainMenu';
import UserCard from './components/UserCard';
import MatchRoom from './components/MatchRoom';
import { InviteCard } from './components/InviteCard';

import { UserContext } from './contexts/UserContext';
import { User } from './models/User';
import { SocketContext } from './contexts/SocketContext';
import { InviteContext } from './contexts/InviteContext';
import { socket } from './api/socket';
import type { Invite } from './components/InviteCard';


function App() {
  const [me, setMe] = useState<User | null>(null);
  const [inviteList, setInviteList] = useState<Invite[]>([]);

  useEffect(() => {
    function handleNewInvite(newInviter: User) {
      if (!inviteList?.some(i => i.inviter.socketId === newInviter.socketId)) {
        const newInvite: Invite = { inviter: newInviter };
        setInviteList(prev => [...prev ?? [], newInvite]);
        console.warn("CONVITE RECEBIDO");
        console.warn(newInvite, inviteList);
      }
    }

    socket.on("svr_transfer_invite", handleNewInvite);

    return () => {
      socket.off("svr_transfer_invite", handleNewInvite);
    };
  }, [setInviteList]);

  return (
    <>
      <SocketContext.Provider value={socket}>
        <UserContext.Provider value={{me, setMe}}>
          <InviteContext.Provider value={{ inviteList, setInviteList}}>
            <h1>Bokutou no Game</h1>
            <div className="game-screen">
              <MainMenu/>
              <MatchRoom/>
              <UserCard/>
              {inviteList.length > 0 ?
                <InviteCard />
              : <div id="VAZIA"></div>}
            </div>
          </InviteContext.Provider>
        </UserContext.Provider>
      </SocketContext.Provider>
    </>
  );
}

export default App;