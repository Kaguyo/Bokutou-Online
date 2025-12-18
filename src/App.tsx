import './App.css'
import React from 'react';
import { PlayerProvider } from './contexts/PlayerContext';
import MainMenu from './components/MainMenu';

function App() {
  const [onlinePlayers, setOnlinePlayers] = React.useState([]);

  return (
    <PlayerProvider>
      <h1>Bokutou no Game</h1>
      <div className="game-screen">
        <div id="profile-template">
          <div id="profile-template-card">
            <div id="profile-icon">
              <img id="img-pfp" src="/gohan.gif" alt="img"/>
            </div>  
          </div>
          <div id="user-info">
              <div className="us-info-item">Kaguyo</div>
              <div className="us-info-item">Lvl. 78</div>
              <div className="us-info-item">Offline</div>
            </div>
        </div>
        <MainMenu/>
      </div>
    </PlayerProvider>
  )
}

export default App;
