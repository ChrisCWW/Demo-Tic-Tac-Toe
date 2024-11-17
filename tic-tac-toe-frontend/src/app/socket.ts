'use client';

import { io, Socket } from 'socket.io-client';

let socketIO: Socket;

export const SocketIO = () => {  
  if (!socketIO) {
    socketIO = io(`${process.env.SERVER_URL}`, {
      autoConnect: true,
      reconnection: true,
    });
  }
  return socketIO;
}