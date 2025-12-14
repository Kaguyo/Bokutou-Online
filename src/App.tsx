import './App.css'
import React from 'react';
import ReactDOM from 'react-dom';
import { PlayerProvider } from './contexts/PlayerContext';

function App() {


  return (
    <>
      <PlayerProvider>
        <App />
      </PlayerProvider>,
    </>
  )
}

export default App
