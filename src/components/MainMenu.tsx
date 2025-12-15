import React, { useContext } from 'react';
import { PlayerContext } from '../contexts/PlayerContext';
import './MainMenu.css';

const MainMenu: React.FC = () => {
  const { onlinePlayers, connectSocket } = useContext(PlayerContext);

  return (
    <div className="main-menu">
      <ul id="menu-list" className="no-dots">
        <li className="menu-item">ARCADE</li>
        <li className="menu-item">VERSUS</li>
        <li className="menu-item" onClick={connectSocket}>
          ONLINE
        </li>
        <li className="menu-item">MY ACCOUNT</li>
      </ul>
    </div>
  );
};

export default MainMenu;
