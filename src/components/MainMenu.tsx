// src/components/MainMenu.tsx
import React, { useState } from 'react';
import './MainMenu.css'

interface MainMenuProps {

}

const MainMenu: React.FC<MainMenuProps> = ({   
}) => {
    const component = 
    <div className="main-menu">
        <ul id="menu-list" className="no-dots">
            <li className="menu-item">CREATE ROOM</li>
            <li className="menu-item">FIND ROOM</li>
            <li className="menu-item">FRIEND LIST</li>
            <li className="menu-item">FIND PLAYERS</li>
        </ul>
    </div>
    

  return (
    component
  );
};

export default MainMenu;