'use client';

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import socketIO from '@/app/socket';
import { updateConnection } from '@/lib/store/features/IndexSlice';

export default function useSocket() {
  const dispatch = useDispatch();
  const [socket, setSocket] = useState<typeof socketIO>();

  useEffect(() => {
    setSocket(socketIO);

    function onConnect() {
      dispatch(updateConnection({ connect: true, uid: socketIO.id }));
    }
    function onDisconnect() {
      dispatch(updateConnection({ connect: false }));
    }

    socketIO.on('connect', onConnect);
    socketIO.on('disconnect', onDisconnect);

    return () => {
      socketIO.off('connect', onConnect);
      socketIO.off('disconnect', onDisconnect);
    };
  }, []);

  return socket;
}
