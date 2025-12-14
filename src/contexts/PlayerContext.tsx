import React, { createContext, useState, useEffect } from 'react';
import { socket } from '../api/socket';
import Player from '../models/Player';

interface PlayerContextValue {
  onlinePlayers: Player[];
}

export const PlayerContext = createContext<PlayerContextValue>({
  onlinePlayers: [],
});

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [onlinePlayers, setOnlinePlayers] = useState<Player[]>([]);

  useEffect(() => {
    socket.on('svr_global_connected_players', (playerlist: Player[]) => {
      console.log('Received updated player list from server:', playerlist);
      setOnlinePlayers(playerlist); // 🟢 Reactive update
    });

    return () => {
      socket.off('svr_global_connected_players'); // cleanup
    };
  }, []);

  return (
    <PlayerContext.Provider value={{ onlinePlayers }}>
      {children}
    </PlayerContext.Provider>
  );
};
