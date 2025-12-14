import {socket} from '../api/socket';
import Player from '../models/Player';

socket.on('svr_global_connected_players', (playerlist: Player[]) => {
  console.log('Received updated player list from server:', playerlist);
  Player.onlinePlayerlist = playerlist;
});