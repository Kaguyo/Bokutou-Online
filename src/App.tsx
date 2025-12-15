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
        <MainMenu/>
      </div>
    </PlayerProvider>
  )
}

export default App;
