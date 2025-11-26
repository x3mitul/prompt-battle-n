import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import type { Room, Player, GamePhase, PromptSubmission } from '@/types';
import { GAME_CONFIG } from '@/constants';

export function useGame(roomId: string | null) {
  const { socket } = useSocket();
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [phase, setPhase] = useState<GamePhase>('waiting');
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [mySubmission, setMySubmission] = useState<PromptSubmission | null>(null);
  const [isHost, setIsHost] = useState<boolean>(false);

  // Listen for room updates
  useEffect(() => {
    if (!socket || !roomId) return;

    socket.on('roomUpdate', (updatedRoom: Room) => {
      setRoom(updatedRoom);
      setPlayers(updatedRoom.players);
      setPhase(updatedRoom.phase);
      setCurrentRound(updatedRoom.currentRound);
      
      // Check if current user is host
      const currentPlayer = updatedRoom.players.find(
        (p: Player) => p.socketId === socket.id
      );
      setIsHost(currentPlayer?.isHost || false);
    });

    socket.on('phaseChange', (newPhase: GamePhase) => {
      setPhase(newPhase);
      setMySubmission(null);
    });

    socket.on('timerUpdate', (seconds: number) => {
      setTimeLeft(seconds);
    });

    socket.on('gameEnd', (results: unknown) => {
      setPhase('finished');
      console.log('Game ended:', results);
    });

    return () => {
      socket.off('roomUpdate');
      socket.off('phaseChange');
      socket.off('timerUpdate');
      socket.off('gameEnd');
    };
  }, [socket, roomId]);

  // Start game (host only)
  const startGame = useCallback(() => {
    if (socket && roomId && isHost) {
      socket.emit('startGame', roomId);
    }
  }, [socket, roomId, isHost]);

  // Submit prompt
  const submitPrompt = useCallback(
    (prompt: string) => {
      if (socket && roomId && phase === 'prompting') {
        const submission: PromptSubmission = {
          playerId: socket.id || '',
          prompt,
          timestamp: Date.now(),
        };
        socket.emit('submitPrompt', { roomId, prompt });
        setMySubmission(submission);
      }
    },
    [socket, roomId, phase]
  );

  // Vote for prompt
  const voteForPrompt = useCallback(
    (playerId: string) => {
      if (socket && roomId && phase === 'voting') {
        socket.emit('vote', { roomId, votedFor: playerId });
      }
    },
    [socket, roomId, phase]
  );

  // Leave room
  const leaveRoom = useCallback(() => {
    if (socket && roomId) {
      socket.emit('leaveRoom', roomId);
      setRoom(null);
      setPlayers([]);
      setPhase('waiting');
      setMySubmission(null);
    }
  }, [socket, roomId]);

  // Get current player
  const getCurrentPlayer = useCallback(() => {
    if (!socket) return null;
    return players.find((p) => p.socketId === socket.id) || null;
  }, [socket, players]);

  // Get player by ID
  const getPlayerById = useCallback(
    (playerId: string) => {
      return players.find((p) => p.socketId === playerId) || null;
    },
    [players]
  );

  // Check if all players are ready
  const allPlayersReady = useCallback(() => {
    return players.length >= 2 && players.every((p) => p.isReady);
  }, [players]);

  // Get phase duration
  const getPhaseDuration = useCallback(() => {
    switch (phase) {
      case 'prompting':
        return GAME_CONFIG.PROMPT_PHASE_DURATION;
      case 'voting':
        return GAME_CONFIG.VOTING_PHASE_DURATION;
      case 'finished':
        return GAME_CONFIG.RESULTS_DISPLAY_DURATION;
      default:
        return 0;
    }
  }, [phase]);

  return {
    room,
    players,
    phase,
    currentRound,
    timeLeft,
    mySubmission,
    isHost,
    startGame,
    submitPrompt,
    voteForPrompt,
    leaveRoom,
    getCurrentPlayer,
    getPlayerById,
    allPlayersReady,
    getPhaseDuration,
  };
}
