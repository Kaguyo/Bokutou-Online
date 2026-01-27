import React, { JSX, useContext, useEffect, useRef, useState } from 'react';
import './MainMenu.css';
import { SocketContext } from '../contexts/SocketContext';
import { PlayerContext } from '../contexts/PlayerContext';
import { MatchRoom, Player, PlayerData } from '../models/Player';
import { socket } from '../api/socket';
import Account from '../models/Account';
import { accountHttp } from '../api/account/accountHttp';
import { saveAccountFile } from '../utils/saveData';
import { getStoredAccountHandle } from '../utils/indexedDb';
import env from '../../env.json';

type MainMenuPages = "DEFAULT" | "VERSUS" | "ARCADE" |
                     "MULTIPLAYER" | "ARCADE SETTINGS" | "MY ACCOUNT"; // Stricts values that can be setted to activeSession useState

interface MainMenuProps {
  loggedAccount: Account | null;
}
function MainMenu(props: MainMenuProps): JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null); // References the file input element in my account page
  
  const socketCtx = useContext(SocketContext);
  const playerCtx = useContext(PlayerContext);
  const loggedAccount = props.loggedAccount;

  const [activeSession, setActiveSession] = useState<MainMenuPages>("DEFAULT")
  const [optionTeamSize, setOptionTeamSize] = useState<number>(1);
  const [optionDifficultyIndex, setOptionDifficultyIndex] = useState<number>(2);
  const [matchRoom, setMatchRoom] = useState<MatchRoom | null>(null);

  const difficultyOptions: Record<number, string> = {
    1: "EASY",
    2: "NORMAL",
    3: "HARD",
    4: "INFERNAL"
  }

  function toggleRoom(activate: boolean) {
    if (activate) {
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
      }

      return;
    }

    const roomWrapper = document.getElementById("multiplayer-room-wrapper");
    if (roomWrapper) {
      roomWrapper.style.visibility = "hidden"
    }

    const roomOptions = document.getElementById("multiplayer-room-options");
    if (roomOptions){
      roomOptions.style.width = "0px";
      roomOptions.style.visibility = "hidden";
    }

    const roomBox = document.getElementById("multiplayer-room-box");
    if (roomBox) {
      roomBox.style.width = "0px";
      roomBox.style.visibility = "hidden";
    }
  }

  function addPlayerToRoom(player: Player | PlayerData) {
    // Never adds itself (player) to connectedPlayers array field, and prevents duplicate entries
    if (player.socketId !== playerCtx!.me!.socketId && 
      !playerCtx?.me?.matchRoom.connectedPlayers.some(
      p => p.socketId === player.socketId)
    ) {
      playerCtx?.me?.matchRoom.connectedPlayers.push(player);
    }

    buildRowInMatchRoom(player);
  }

  function updateRoom(players: PlayerData[] | null): void {
    const roomBox = document.getElementById("multiplayer-room-box");
    if (roomBox) {
      roomBox.innerHTML = "";
    }

    if (players) {
      players.forEach((p) => {
        addPlayerToRoom(p);
      });
    }
  }


  async function handleSelectOnline(): Promise<void> {
    if (socketCtx?.connected) return;
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
      if (socketCtx?.connected && playerCtx?.me) {
        let response
        if (loggedAccount) {
          response = await accountHttp.upsertAccount(loggedAccount);
          const accountHandle = await getStoredAccountHandle()
          if (accountHandle){
            const success = await saveAccountFile(accountHandle, response)
            if (!success) {
              throw Error("Couldn't update account file")
            }
          } else {
            throw Error("No account handle was found")
          }
        } else throw Error("Not connected to an account");
        
        const updatedMe: Player = new Player(response.id, socket.id!, response.nickname, response.level, "Online") 
        
        // Sends the player of this account to the websocket
        socketCtx.emit('clt_sending_player', updatedMe);
        updatedMe.host = true; // since this creates your initial room
        playerCtx.setMe(updatedMe);
        toggleRoom(true);
        updateRoom([updatedMe]);

        // Grabs other players connected to the websocket
        socketCtx.on('svr_global_connected_players', (playerList: Player[]) => {
          const filteredArray = playerList.filter(p => p.socketId != updatedMe.socketId);
          Player.globalPlayerList = filteredArray;
        });

        socketCtx?.on("svr_give_updated_matchRoom", (matchRoom: MatchRoom) => {
          console.log("Chegada do server", matchRoom)
          setMatchRoom(prevRoom => {
            return matchRoom
          });

          setActiveSession("MULTIPLAYER");
        });
      }
    } catch (error) {
      if (error == "Couldn't save account file") {
        /* The handler for this error must inform the user that 
        their account file couldn't be saved, but continue ahead
        */
      } else if (error == "No account handle was found") {
        /* The handler for this error must inform the user that 
        their account file handler wasn't found, and guide them through account save selection
        to make up their handle, then retry until they give up or another error interrupts
        */
      } else if (error == "Not connected to an account") {
        /* The handler for this error must inform the user that 
        they aren't connected to an account yet, and track through login/signup then retry
        or give up
        */
      } else {
        console.error("Error when attempting to connect to the server:", error);
        socketCtx?.disconnect();
        return;
      }
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

  // Tracks matchRoom useEffect to run updates on players matchroom and UI matchroom
  useEffect(() => {
    updateRoom(matchRoom?.connectedPlayers!);
  }, [matchRoom]);

  // Handles life cycle for listener through main menu pages
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

  const backMap: Record<MainMenuPages, MainMenuPages | null> = {
    "DEFAULT": null,
    "VERSUS" : "DEFAULT",
    "ARCADE" : "DEFAULT",
    "MULTIPLAYER" : "DEFAULT",
    "ARCADE SETTINGS" : "ARCADE",
    "MY ACCOUNT" : "DEFAULT"
  }

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

function buildRowInMatchRoom(player: Player | PlayerData) {
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
    avatar64.src = `${env.SERVER_URL}/accounts/${player.accountId}/avatar`;
    avatar64.alt = "";

    const playerNameContainer = document.createElement('div');
    playerNameContainer.className = "player-name-container";

    const playerName = document.createElement('p');
    playerName.className = "player-name";
    playerName.textContent = player.nickname!;

    const playerLevelContainer = document.createElement('div');
    playerLevelContainer.className = "player-level-container";
    
    const playerLevel = document.createElement('p');
    playerLevel.className = "player-level";
    playerLevel.textContent = "Lv. " + player.level.toString();

    avatar64Container.appendChild(avatar64);
    playerNameContainer.appendChild(playerName);
    playerLevelContainer.appendChild(playerLevel);
    roomItem.appendChild(avatar64Container);
    roomItem.appendChild(playerNameContainer);
    roomItem.appendChild(playerLevelContainer);
    roomBox.appendChild(roomItem);
  }
}

export default MainMenu;