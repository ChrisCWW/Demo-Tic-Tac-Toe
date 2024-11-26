'use client';

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import socketIO from '@/app/socket';
import { updateConnection } from '@/lib/store/features/IndexSlice';

export default function useSocket() {
  const dispatch = useDispatch();
  const [socket] = useState(socketIO);

  useEffect(() => {
    function onConnect() {
      dispatch(updateConnection({ connect: true, uid: socket.id }));
    }
    function onDisconnect() {
      dispatch(updateConnection({ connect: false }));
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return socket;
}
