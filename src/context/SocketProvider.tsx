import {socket} from '../api/socket';


interface ServerToClientEvents {
    svr_global_connected_players: () => void;
}

interface ClientToServerEvents {

}


socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
});