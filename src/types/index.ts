// Shared TypeScript types for the application

// Game types
export interface Player {
  id: string;
  socketId: string;
  name: string;
  avatar: string;
  isReady: boolean;
  isHost: boolean;
  score: number;
}

export interface Room {
  id: string;
  code: string;
  players: Player[];
  state: GameState;
  phase: GamePhase;
  currentRound: number;
  maxRounds: number;
  word: string | null;
  timer: number;
}

export type GameState = "waiting" | "starting" | "prompting" | "generating" | "voting" | "revealing" | "finished";
export type GamePhase = GameState;

export interface PromptSubmission {
  playerId: string;
  prompt: string;
  timestamp: number;
}

export interface Image {
  playerId: string;
  playerName?: string;
  imageUrl: string;
  prompt?: string;
  votes?: number;
}

export interface RoundResult {
  round: number;
  word: string;
  votes: Record<string, number>;
  winner: string | string[];
  scores: ScoreEntry[];
}

export interface ScoreEntry {
  id: string;
  name: string;
  score: number;
}

// Arena types
export interface Level {
  id: number;
  name: string;
  icon: string;
  challenge: string;
}

export interface PromptFeedback {
  clarity: number;
  specificity: number;
  creativity: number;
  structure: number;
  feedbackText?: string;
  tip?: string;
}

// Lesson types
export interface Lesson {
  id: number;
  title: string;
  component: React.ComponentType<LessonProps>;
  icon: string;
}

export interface LessonProps {
  onComplete: () => void;
}

// AI Response types
export interface AIResponse {
  response: string;
}

export interface PromptEvaluation {
  clarity: number;
  specificity: number;
  creativity: number;
  structure: number;
  feedback: string;
  tip?: string;
}

// Socket event types
export interface SocketEvents {
  // Room events
  createRoom: (data: { playerName: string; avatar: string }) => void;
  joinRoom: (data: { roomCode: string; playerName: string; avatar: string }) => void;
  getRoomData: (data: { roomCode: string }) => void;
  toggleReady: () => void;
  startGame: () => void;
  
  // Gameplay events
  submitPrompt: (data: { prompt: string }) => void;
  submitVote: (data: { targetPlayerId: string }) => void;
  
  // Server events (received)
  roomCreated: (data: { roomCode: string; roomId: string; room: Room }) => void;
  roomUpdated: (room: Room) => void;
  playerJoined: (data: { player: Player }) => void;
  playerLeft: (data: { player: Player }) => void;
  gameStarting: (data: { countdown: number }) => void;
  roundStart: (data: { round: number; word: string; totalRounds: number }) => void;
  timerStart: (data: { duration: number }) => void;
  timerTick: (data: { timeLeft: number }) => void;
  phaseChange: (data: { phase: GameState }) => void;
  votingStart: (data: { images: Image[] }) => void;
  roundResults: (data: { results: RoundResult; images: Image[] }) => void;
  gameFinished: (data: { finalScores: ScoreEntry[]; winner: ScoreEntry; allResults: RoundResult[] }) => void;
  error: (data: { message: string }) => void;
}

// API Response types
export interface ApiError {
  error: string;
}

export interface LessonResponseData {
  response: string;
}

export type EvaluationResponseData = PromptEvaluation;
