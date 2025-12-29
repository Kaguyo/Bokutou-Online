import './App.css'
import { useState } from 'react';
import MainMenu from './components/MainMenu';
import UserCard from './components/UserCard';
import MatchRoom from './components/MatchRoom';
import { UserContext } from './contexts/UserContext';
import { User } from './models/User';
import { SocketContext } from './contexts/SocketContext';
import { socket } from './api/socket';



function App() {
  const [me, setMe] = useState<User | null>(null)
  return (
    <>
      <SocketContext.Provider value={socket}>
        <UserContext.Provider value={{me, setMe}}>
          <h1>Bokutou no Game</h1>
          <div className="game-screen">
            <MatchRoom/>
            <UserCard/>
            <MainMenu/>
          </div>
        </UserContext.Provider>
      </SocketContext.Provider>
    </>
  );
}

export default App;