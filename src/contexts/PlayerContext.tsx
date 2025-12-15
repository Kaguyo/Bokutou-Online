import { createContext, useEffect, useState } from "react";
import { socket } from "../api/socket";
import Player from "../models/Player";

interface PlayerContextValue {
  onlinePlayers: Player[];
  connectSocket: () => void;
}

export const PlayerContext = createContext<PlayerContextValue>({
  onlinePlayers: [],
  connectSocket: () => {},
});

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [onlinePlayers, setOnlinePlayers] = useState<Player[]>([]);

  useEffect(() => {
    socket.on('svr_global_connected_players', (playerlist: Player[]) => {
      setOnlinePlayers(playerlist);
      console.log('Updated online players in context:', playerlist);
    });

    return () => {
      socket.off('svr_global_connected_players');
    };
  }, []);

  const connectSocket = () => {
    socket.connect();
    socket.on('connect', () => {
      console.log('Socket fully connected. ID:', socket.id); 
      socket.emit("clt_sending_player", new Player(socket.id!)); 
    });
  };

  return (
    <PlayerContext.Provider value={{ onlinePlayers, connectSocket }}>
      {children}
    </PlayerContext.Provider>
  );
};
