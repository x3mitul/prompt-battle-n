// Application constants

// Game Configuration
export const GAME_CONFIG = {
  MAX_PLAYERS: 5,
  MAX_ROUNDS: 5,
  PROMPT_PHASE_DURATION: 30, // seconds
  VOTING_PHASE_DURATION: 30, // seconds
  RESULTS_DISPLAY_DURATION: 8, // seconds
  COUNTDOWN_START: 3, // seconds
} as const;

// Arena Configuration
export const ARENA_CONFIG = {
  TOTAL_LEVELS: 5,
  MAX_PROMPT_LENGTH: 1000,
  XP_STORAGE_KEY: 'arena_xp',
  LEADERBOARD_STORAGE_KEY: 'leaderboard',
  USERNAME_STORAGE_KEY: 'username',
} as const;

// Lesson Configuration
export const LESSON_CONFIG = {
  TOTAL_LESSONS: 5,
  COMPLETED_LESSONS_KEY: 'completedLessons',
  MIN_PROMPT_LENGTH: 10,
  MAX_RESPONSE_TOKENS: 200,
} as const;

// API Configuration
export const API_CONFIG = {
  RETRY_ATTEMPTS: 3,
  RETRY_BASE_DELAY: 1000, // milliseconds
  REQUEST_TIMEOUT: 30000, // milliseconds
  RATE_LIMIT: 30, // requests per minute
} as const;

// Socket Configuration
export const SOCKET_CONFIG = {
  RECONNECTION_DELAY: 1000,
  RECONNECTION_ATTEMPTS: 10,
  RECONNECTION_DELAY_MAX: 5000,
  TIMEOUT: 20000,
  PATH: '/socket.io/',
} as const;

// Theme Configuration
export const THEME_CONFIG = {
  STORAGE_KEY: 'prompt-battle-theme',
  DEFAULT_THEME: 'dark' as const,
  AVAILABLE_THEMES: ['light', 'dark', 'system'] as const,
} as const;

// Avatar Options
export const AVATARS = ['👤', '😀', '😎', '🤖', '👻', '🦄', '🐱', '🐶', '🦊', '🐼'] as const;

// Lesson Icons
export const LESSON_ICONS = {
  SANDBOX: '🎯',
  REACTOR: '🧠',
  FORGE: '🔨',
  MIRROR: '✨',
  ETHICS: '⚖️',
} as const;

// Level Icons
export const LEVEL_ICONS = {
  BEGINNER: '🎯',
  EXPLORER: '🔍',
  CREATOR: '🎨',
  STRATEGIST: '♟️',
  PRODIGY: '⚡',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Connection issue detected. Please check your internet and try again.',
  TIMEOUT_ERROR: 'Request took too long. Please try again.',
  API_ERROR: 'Service temporarily unavailable. Please try again in a moment.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'Something unexpected happened. Please try again.',
  ROOM_FULL: 'Room is full (max 5 players)',
  ROOM_NOT_FOUND: 'Room not found',
  GAME_IN_PROGRESS: 'Game already in progress',
  NOT_HOST: 'Only the host can start the game',
  PLAYERS_NOT_READY: 'All players must be ready',
  EMPTY_PROMPT: 'Please enter a prompt to get started.',
  PROMPT_TOO_LONG: 'Your prompt is too long. Please keep it under 1000 characters.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  ROOM_CREATED: 'Room Created! 🎉',
  ROOM_JOINED: 'Joined Room! 🎉',
  PROMPT_SUBMITTED: 'Prompt Submitted!',
  VOTE_RECORDED: 'Vote Recorded!',
  BADGE_UNLOCKED: 'Badge Unlocked! 🏆',
  EVALUATION_COMPLETE: 'AI Evaluation Complete!',
  RESPONSE_GENERATED: 'Response Generated!',
} as const;

// Badge Types
export const BADGES = {
  FIRST_PROMPT: 'first-prompt',
  EXPLORER: 'explorer',
  DETAILED: 'detailed',
  CHALLENGER: 'challenger',
} as const;

// Keyboard Shortcuts
export const KEYBOARD_SHORTCUTS = {
  SUBMIT: 'Control+Enter',
  CLEAR: 'Escape',
  ESC_KEY: 'Escape',
  ENTER_KEY: 'Enter',
} as const;

// Animation Durations (milliseconds)
export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  FADE_IN: 500,
  SCALE_IN: 400,
} as const;

// Z-Index Layers
export const Z_INDEX = {
  MOBILE_NAV: 50,
  MODAL: 40,
  DROPDOWN: 30,
  HEADER: 20,
  CONTENT: 10,
} as const;

// Breakpoints (match Tailwind)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;
