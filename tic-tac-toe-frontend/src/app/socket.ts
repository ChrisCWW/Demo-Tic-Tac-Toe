'use client';

import { io } from 'socket.io-client';

let socket = io(`${process.env.SERVER_URL}`, {
  autoConnect: true,
  reconnection: true,
});

export default socket;