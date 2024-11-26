'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import GameInfo from "@/components/GameInfo/GameInfo";
import Loading from "@/components/Loading/Loading";
import MessageBox from "@/components/MessageBox/MessageBox";
import WinPage from "@/components/WinPage/WinPage";
import useSocket from "@/hooks/useSocket";
import { useThree } from "@/hooks/useThree";
import { nextTurn, reset, restartGame, startNetworkGame } from "@/lib/store/features/GameSlice";
import { RootState } from "@/lib/store/store";
import { whoIsWinner } from "@/lib/utils/GameUtils";
import { GameBoard, GameMode } from "@/types/GameTypes";
import styles from './page.module.css';

// Define the gamebaord size: 3x3 board
const boxCount = 3;

export default function Game() {
  const socket = useSocket();
  const router = useRouter();
  const dispatch = useDispatch();

  const uid = useSelector((state: RootState) => state.index.uid);
  const data = useSelector((state: RootState) => state.game);
  const [matching, setMatching] = useState(false);
  const [messageBox, setMessageBox] = useState(false);
  const canvas = useRef<HTMLDivElement>(null);
  const { startTouch, moveTouch, resetBoard } = useThree(canvas);
  
  const next = (turn: number, board: GameBoard, winner: number) => {
    // Store game data
    dispatch(nextTurn({ turn, board, winner }));
  }

  const handleStartTouch = useCallback((e: MouseEvent | TouchEvent) => {
    // Player pick the box
    const result = startTouch(e);
    if (!result) return;

    const { idx, coord, value } = result;

    if (data.mode === GameMode.network) {      
      socket.emit('ttt-nextTurn', { rid: data.rid, move: idx });
    }

    const newBoard = JSON.parse(JSON.stringify(data.board));
    newBoard[coord.y][coord.x] = value;
    const win = whoIsWinner(newBoard, boxCount);

    next(data.turn + 1, newBoard, win);
  }, [data.mode, data.rid, data.turn, data.board, startTouch, next]);

  const toggleMatch = (isMatch: boolean) => {
    setMessageBox(false);

    if (isMatch) {
      socket.emit('ttt-match');  
      setMatching(true);
    } else {
      // Redirect user to home page if user cancel the new network game matching
      socket.emit('ttt-leave');  
      setMatching(false);
      router.push('/');
    }
  }

  const restart = () => {
    if (data.mode === GameMode.loacl) {
      dispatch(restartGame());
      resetBoard();  
    } else {
      toggleMatch(true);
    }
  }

  useEffect(() => {
    // Redirect user to home page when user reload
    if (data.mode === GameMode.null) {
      dispatch(reset());
      router.push('/');
    }

    // Listen events from backend for network game
    function onNext(data: { turn: number, board: GameBoard, winner: number }) {
      const { turn, board, winner } = data;
      next(turn, board, winner);
    }

    function onLeave() {
      if (data.winner === 0) setMessageBox(true);
    }

    if (data.mode === GameMode.network) {
      socket.on('tt-nextTurn', onNext);
      socket.on('tt-leave', onLeave);
    } else {
      socket.off('tt-nextTurn', onNext);
      socket.off('tt-leave', onLeave);
    }
    
    return () => {
      socket.off('tt-nextTurn', onNext);
      socket.off('tt-leave', onLeave);
    }
  }, []);

  useEffect(() => {
    // Handle player matching a new network game

    function startNetwork(data: { rid: string, players: string[] }) {
      const { rid, players } = data;
      dispatch(startNetworkGame({ rid, players }));
      resetBoard();
      setMatching(false);
    }
  
    if (matching) {
      socket.on('tt-battle', startNetwork);
    } else {
      socket.off('tt-battle', startNetwork);
    }

    return () => {
      socket.off('tt-battle', startNetwork);
    };
  }, [matching, resetBoard])

  useEffect(() => {
    // Handle player game actions
    window.addEventListener('mousedown', handleStartTouch);
    window.addEventListener('mousemove', moveTouch);
    window.addEventListener('touchstart', handleStartTouch);

    return () => {
      window.removeEventListener('mousedown', handleStartTouch);
      window.removeEventListener('mousemove', moveTouch);
      window.removeEventListener('touchstart', handleStartTouch);
    };    
  }, [data.turn, data.board, data.winner, handleStartTouch , moveTouch]);

  const isYourTurn = useMemo(() => {
    // For Network Game only, display the message when this is your turn
    return data.mode === GameMode.network &&  data.players[data.turn % 2] === uid;
  }, [data.mode, uid, data.players, data.turn]);

  return (
    <div className={styles.container}>
      <GameInfo />

      <div ref={canvas} className={styles.container}>
        { isYourTurn &&
          <p className={styles.yourturn}>Your Turn!</p>
        }
      </div>

      {/* Show win page when the game is end */}
      { data.winner > 0 && <WinPage winner={data.winner} restart={restart} /> }

      {/* Show matching page when player want match another game */}
      { matching && <Loading text="Matching" dismiss={() => toggleMatch(false)} /> }

      {/* Show message box when competitor left the game */}
      { messageBox &&
        <MessageBox
          message={"Player Left! You Won!"}
          button={{ name: "Match", action: () => toggleMatch(true) }}
          cancelText="Home"
          cancel={() => router.push('/') }
        />
      }
    </div>
  )
}