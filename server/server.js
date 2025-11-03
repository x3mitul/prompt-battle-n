import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import { GameManager } from './gameManager.js';
import { PromptEvaluator } from './promptEvaluator.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// CORS configuration - add your production URL here
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8080", 
  "http://localhost:8081",
  process.env.FRONTEND_URL, // Add production frontend URL to .env
].filter(Boolean);

console.log('🌐 Allowed origins:', allowedOrigins);

// Dynamic CORS function for flexibility
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc)
    if (!origin) {
      return callback(null, true);
    }
    
    // In development, allow all localhost
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // In production, you can be more strict or log the rejected origin
    console.warn('⚠️ CORS blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

const io = new Server(httpServer, {
  cors: corsOptions,
  // Performance optimizations
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
  allowUpgrades: true,
  path: '/socket.io/',
  maxHttpBufferSize: 1e6, // 1MB max message size
  connectTimeout: 45000, // 45s connection timeout
});

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' })); // Limit payload size
app.use(compression()); // Enable gzip compression

// Simple rate limiting for API endpoints
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 30; // 30 requests per minute

const rateLimit = (req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress;
  const now = Date.now();
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  const record = rateLimitMap.get(ip);
  
  if (now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  if (record.count >= MAX_REQUESTS) {
    return res.status(429).json({ error: 'Too many requests, please try again later' });
  }
  
  record.count++;
  next();
};

// Clean up old rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 300000);

const gameManager = new GameManager(io);
const promptEvaluator = new PromptEvaluator();

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Prompt Battle Server is running',
    endpoints: {
      health: '/health',
      evaluate: '/api/evaluate-prompt'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', rooms: gameManager.getRoomCount() });
});

// Prompt evaluation endpoint for solo arena with rate limiting
app.post('/api/evaluate-prompt', rateLimit, async (req, res) => {
  try {
    const { prompt, challenge, levelId } = req.body;
    
    if (!prompt || !challenge) {
      return res.status(400).json({ error: 'Missing prompt or challenge' });
    }
    
    const evaluation = await promptEvaluator.evaluatePrompt(prompt, challenge, levelId);
    res.json(evaluation);
    
  } catch (error) {
    console.error('Evaluation endpoint error:', error);
    res.status(500).json({ error: 'Failed to evaluate prompt' });
  }
});

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Room management
  socket.on('createRoom', ({ playerName, avatar }) => {
    gameManager.createRoom(socket, playerName, avatar);
  });

  socket.on('joinRoom', ({ roomCode, playerName, avatar }) => {
    gameManager.joinRoom(socket, roomCode, playerName, avatar);
  });

  socket.on('getRoomData', ({ roomCode }) => {
    gameManager.getRoomData(socket, roomCode);
  });

  socket.on('toggleReady', () => {
    gameManager.toggleReady(socket);
  });

  socket.on('startGame', () => {
    gameManager.startGame(socket);
  });

  // Gameplay
  socket.on('submitPrompt', ({ prompt }) => {
    gameManager.submitPrompt(socket, prompt);
  });

  socket.on('submitVote', ({ targetPlayerId }) => {
    gameManager.submitVote(socket, targetPlayerId);
  });

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    gameManager.handleDisconnect(socket);
  });
});

const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0'; // Bind to all network interfaces for Railway

httpServer.listen(PORT, HOST, () => {
  console.log(`🎮 Prompt Battle server running on ${HOST}:${PORT}`);
});
