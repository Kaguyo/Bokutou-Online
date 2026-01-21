import React, { JSX, useContext, useEffect, useRef, useState } from 'react';
import './MainMenu.css';
import { SocketContext } from '../contexts/SocketContext';
import { UserContext } from '../contexts/UserContext';
import { Player } from '../models/Player';
import { socket } from '../api/socket';
import Account from '../models/Account';
import { accountService } from '../api/services/account.service';

type MainMenuPages = "DEFAULT" | "VERSUS" | "ARCADE" |
                     "MULTIPLAYER" | "ARCADE SETTINGS" | "MY ACCOUNT"; // Stricts values that can be setted to activeSession useState

interface MainMenuProps {
  loggedAccount: Account | null;
}
function MainMenu(props: MainMenuProps): JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null); // References the file input element in my account page
  
  const socketCtx = useContext(SocketContext);
  const userCtx = useContext(UserContext);
  const loggedAccount = props.loggedAccount;

  const [activeSession, setActiveSession] = useState<MainMenuPages>("DEFAULT")
  const [optionTeamSize, setOptionTeamSize] = useState<number>(1);
  const [optionDifficultyIndex, setOptionDifficultyIndex] = useState<number>(2);
  
  const difficultyOptions: Record<number, string> = {
    1: "EASY",
    2: "NORMAL",
    3: "HARD",
    4: "INFERNAL"
  }

  async function feedHostRoom(me: Player): Promise<void> {
    if (me.hosting)
      return;

    me.hosting = true;
    me.activeSession = true;
  
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
      
      const avatar64Container = document.createElement('div');
      avatar64Container.className = "profile-picture-container";

      const avatar64 = document.createElement('img');
      avatar64.className = "user-pfp";
      avatar64.src = `${userCtx?.profilePicUrl}` || " ";

      const playerNameContainer = document.createElement('div');
      playerNameContainer.className = "player-name-container";

      const playerName = document.createElement('p');
      playerName.className = "player-name";
      playerName.textContent = me.nickname!;

      const playerLevelContainer = document.createElement('div');
      playerLevelContainer.className = "player-level-container";
      
      const playerLevel = document.createElement('p');
      playerLevel.className = "player-level"
      playerLevel.textContent = "Lv. " + (me.level.toString());

      avatar64Container.appendChild(avatar64);
      playerNameContainer.appendChild(playerName);
      playerLevelContainer.appendChild(playerLevel);
      roomItem.appendChild(avatar64Container);
      roomItem.appendChild(playerNameContainer);
      roomItem.appendChild(playerLevelContainer);
      roomBox.appendChild(roomItem);
    }
  }

  async function handleSelectOnline(): Promise<void> {
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
      if (socketCtx?.connected && userCtx?.me) {
        const updatedMe = { ...userCtx.me, socketId: socket.id, status: "Online" };
        userCtx.setMe(updatedMe as Player);
        feedHostRoom(updatedMe as Player);
        let result;
        if (loggedAccount) {
          result = await accountService.upsertAccount(null, loggedAccount);
        } else console.warn("No logged account to update on online selection.");

        if (result && result.id) {
          console.log(result)
          updatedMe.accountId = result.id; // Atualiza o ID
        }

        socketCtx.emit('clt_sending_player', updatedMe);
        socketCtx.on('svr_global_connected_players', (playerList: Player[]) => {
          const filteredArray = playerList.filter(p => p.socketId != updatedMe.socketId);
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

  const backMap: Record<MainMenuPages, MainMenuPages | null> = {
    "DEFAULT": null,
    "VERSUS" : "DEFAULT",
    "ARCADE" : "DEFAULT",
    "MULTIPLAYER" : "DEFAULT",
    "ARCADE SETTINGS" : "ARCADE",
    "MY ACCOUNT" : "DEFAULT"
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        const previous = backMap[activeSession];
        if (previous) {
          setActiveSession(previous);
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeSession]);

  const mainMenuSessions: Record<string, JSX.Element> = {
    "DEFAULT": 
    <div className="main-menu">
      <ul id="menu-list" className="no-dots">
        <li className="menu-item" onClick={() => {setActiveSession("ARCADE")}}>ARCADE</li>
        <li className="menu-item" onClick={() => {setActiveSession("VERSUS")}}>VERSUS</li>
        <li className="menu-item" onClick={handleSelectOnline}>ONLINE</li>
        <li className="menu-item" onClick={() => {setActiveSession("MY ACCOUNT")}}>MY ACCOUNT</li>
      </ul>
    </div>,
    "VERSUS": 
    <div className="main-menu">
      <ul id="menu-list" className="no-dots">
        <li className="menu-item" onClick={() => {setActiveSession("ARCADE")}}>ARCADE</li>
        <li className="menu-item" onClick={() => {setActiveSession("VERSUS")}}>VERSUS</li>
        <li className="menu-item" onClick={handleSelectOnline}>ONLINE</li>
        <li className="menu-item" >MY ACCOUNT</li>
      </ul>
    </div>,
    "ARCADE":
    <div className="main-menu">
      <ul id="menu-list" className="no-dots">
        <li className="menu-item" onClick={() => {}}>START</li>
        <li className="menu-item" onClick={() => {setActiveSession("ARCADE SETTINGS")}}>SETTINGS</li>
        <li className="menu-item" onClick={handleMainMenuButton}>MAIN MENU</li>
      </ul>
    </div>,
    "MULTIPLAYER":
    <div className="main-menu">
      <ul id="menu-list" className="no-dots">
        <li className="menu-item" onClick={() => {}}>ARCADE COOP</li>
        <li className="menu-item" onClick={() => {}}>PLAYER VS PLAYER</li>
        <li className="menu-item" onClick={handleSelectOnline}>PLAYERS VS CPU</li>
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
    </div>,
    "MY ACCOUNT":
    <div className="main-menu">
      <ul id="menu-list" className="no-dots">
        <li className="menu-item" onClick={() => {}}>CHANGE NICKNAME</li>
        <li className="menu-item" onClick={() => fileInputRef.current?.click()}>CHANGE PROFILE PICTURE 
          <input  ref={fileInputRef} type="file" style={{display: 'none'}}/>
        </li>
        <li className="menu-item" onClick={handleMainMenuButton}>MAIN MENU</li>
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