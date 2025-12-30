import React, { JSX, useContext, useState } from 'react';
import './MainMenu.css';
import { SocketContext } from '../contexts/SocketContext';
import { UserContext } from '../contexts/UserContext';
import userEnv from '../../env.user.json';
import { User } from '../models/User';
import { Player } from '../models/Player';

const MainMenu: React.FC = () => {
  const socketCtx = useContext(SocketContext);
  const userCtx = useContext(UserContext);

  const [activeSession, setActiveSession] = useState<"DEFAULT" | "VERSUS" | "ARCADE" | "MULTIPLAYER" | "ARCADE SETTINGS">("DEFAULT")
  const [optionTeamSize, setOptionTeamSize] = useState<number>(1);
  const [optionDifficultyIndex, setOptionDifficultyIndex] = useState<number>(2);
  
  const difficultyOptions: Record<number, string> = {
    1: "EASY",
    2: "NORMAL",
    3: "HARD",
    4: "INFERNAL"
  }

  function feedHostRoom(user: User): void {
    if (user.hosting)
      return;

    user.hosting = true;
    user.activeSession = true;

    const roomWrapper = document.getElementById("multiplayer-room-wrapper");
    if (roomWrapper) {
      roomWrapper.style.visibility = "visible"
    }

    const roomOptions = document.getElementById("multiplayer-room-options");
    if (roomOptions){
      roomOptions.style.width = "300px";
      roomOptions.style.visibility = "visible";
    }

    const roomBox = document.getElementById("multiplayer-room-box");
    if (roomBox) {
      roomBox.style.width = "300px";
      roomBox.style.visibility = "visible";
      
      const roomItem = document.createElement('div');
      roomItem.className = "multiplayer-room-item";
      roomItem.style.width = "100%";
      
      const profilePictureContainer = document.createElement('div');
      
      profilePictureContainer.className = "profile-picture-container";
      const profilePicture = document.createElement('img');
      profilePicture.src = "/gohan.jpg";
      profilePicture.alt = "IMG";
      profilePicture.className = "profile-picture";
      
      const playerNameContainer = document.createElement('div');
      playerNameContainer.className = "player-name-container";

      const playerName = document.createElement('p');
      playerName.className = "player-name";
      playerName.textContent = user.nickname!;

      const playerLevelContainer = document.createElement('div');
      playerLevelContainer.className = "player-level-container";
      
      const playerLevel = document.createElement('p');
      playerLevel.className = "player-level"
      playerLevel.textContent = "Lv. "+user.level!.toString();

      profilePictureContainer.appendChild(profilePicture);
      playerNameContainer.appendChild(playerName);
      playerLevelContainer.appendChild(playerLevel);
      roomItem.appendChild(profilePictureContainer);
      roomItem.appendChild(playerNameContainer);
      roomItem.appendChild(playerLevelContainer);
      roomBox.appendChild(roomItem);
    }
  }

  async function handleSelectOnline(): Promise<void> {
    let user: User;

    socketCtx?.connect();

    const connectionPromise = new Promise<void>((resolve) => {
      if (socketCtx?.connected) return resolve();
      socketCtx?.once('connect', () => resolve());
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 10000)
    );

    try {
      await Promise.race([connectionPromise, timeoutPromise]);

      if (socketCtx?.connected) {
        if (!userCtx?.me) {
          user = new User(socketCtx.id!, userEnv.nickname, userEnv.level, "Online");
          if (user) {
            userCtx?.setMe(user);
            feedHostRoom(user); 
          }

          socketCtx.emit('clt_sending_player', user);
        }
      
        socketCtx.on('svr_global_connected_players', (playerList: Player[]) => {
          const filteredArray = playerList.filter(p => p.socketId != user.socketId);
          Player.globalPlayerList = filteredArray;
          console.warn(Player.globalPlayerList);
        });
        
        setActiveSession("MULTIPLAYER");
      }
    } catch (error) {
      console.warn("Erro ao tentar se conectar ao servidor. (Tempo esgotado)");
      socketCtx?.disconnect();
      return;
    }
  }

  function handleTeamSizeButton(value: number): void {
    if ((optionTeamSize  + value) > 0 && (optionTeamSize  + value) < 4) {
      setOptionTeamSize(o => o + value);
    }
  }

  function handleDifficultyButton(value: number): void {
    if ((optionDifficultyIndex + value) > 0 && (optionDifficultyIndex + value) < 5) {
      setOptionDifficultyIndex(o => o + value)
    }
  }

  function handleMainMenuButton(): void {
    setOptionTeamSize(1);
    setOptionDifficultyIndex(2);
    setActiveSession("DEFAULT");
  }
 
  const mainMenuSessions: Record<string, JSX.Element> = {
    "DEFAULT": 
    <div className="main-menu">
      <ul id="menu-list" className="no-dots">
        <li className="menu-item" onClick={() => {setActiveSession("ARCADE")}}>ARCADE</li>
        <li className="menu-item" onClick={() => {setActiveSession("VERSUS")}}>VERSUS</li>
        <li className="menu-item" onClick={handleSelectOnline}>
          ONLINE
        </li>
        <li className="menu-item">MY ACCOUNT</li>
      </ul>
    </div>,
    "VERSUS": 
    <div className="main-menu">
      <ul id="menu-list" className="no-dots">
        <li className="menu-item" onClick={() => {setActiveSession("ARCADE")}}>ARCADE</li>
        <li className="menu-item" onClick={() => {setActiveSession("VERSUS")}}>VERSUS</li>
        <li className="menu-item" onClick={handleSelectOnline}>
          ONLINE
        </li>
        <li className="menu-item">MY ACCOUNT</li>
      </ul>
    </div>,
    "ARCADE":
    <div className="main-menu">
      <ul id="menu-list" className="no-dots">

        <li className="menu-item" onClick={() => {}}>
          START
        </li>

        <li className="menu-item" onClick={() => {setActiveSession("ARCADE SETTINGS")}}>
          SETTINGS
        </li>
        
        <li className="menu-item" onClick={handleMainMenuButton}>
          MAIN MENU
        </li>
      </ul>
    </div>,
    "MULTIPLAYER":
    <div className="main-menu">
      <ul id="menu-list" className="no-dots">
        <li className="menu-item" onClick={() => {}}>ARCADE COOP</li>
        
        <li className="menu-item" onClick={() => {}}>
          PLAYER VS PLAYER
        </li>

        <li className="menu-item" onClick={handleSelectOnline}>
          PLAYERS VS CPU
        </li>
        <li className="menu-item" onClick={handleMainMenuButton}>MAIN MENU</li>
      </ul>
    </div>,
    "ARCADE SETTINGS":
    <div className="main-menu">
      <ul id="menu-list" className="no-dots">
        <li className="difficulty-btn">
          <div id="easier-btn" onClick={() => {handleDifficultyButton(-1)}}>▽</div>
          {difficultyOptions[optionDifficultyIndex]}
          <div id="harder-btn" onClick={() => {handleDifficultyButton(+1)}}>△</div>
        </li>

        <li className="team-size-btn" onClick={() => {}}>
          <div id="substract-btn" onClick={() => {handleTeamSizeButton(-1)}}>▽</div>
          TEAM SIZE:<p>{optionTeamSize}</p>
          <div id="add-btn" onClick={() => {handleTeamSizeButton(+1)}}>△</div>
        </li>

        <li className="menu-item" onClick={() => {setActiveSession("ARCADE")}}>
          BACK
        </li>

      </ul>
    </div>
  };

  return (
    <>
      {mainMenuSessions[activeSession]}
    </>
  );
};

export default MainMenu;