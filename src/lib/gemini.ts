import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI client - Using gemini-pro model
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

// Simple in-memory cache to avoid duplicate API calls (max 50 entries, 5 min TTL)
const responseCache = new Map<string, { response: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 50;

function getCachedResponse(key: string): string | null {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.response;
  }
  responseCache.delete(key);
  return null;
}

function setCachedResponse(key: string, response: string): void {
  // Evict oldest entries if cache is full
  if (responseCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = responseCache.keys().next().value;
    if (oldestKey) responseCache.delete(oldestKey);
  }
  responseCache.set(key, { response, timestamp: Date.now() });
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: string;
}

export interface GenerateResponseOptions {
  prompt: string;
  systemMessage?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

/**
 * Generate a response from Gemini AI based on user prompt
 * @param options Configuration for the API call
 * @returns The generated response text
 */
export async function generateResponse(options: GenerateResponseOptions): Promise<string> {
  const {
    prompt,
    systemMessage = 'Be concise.',
    temperature = 0.7,
    maxTokens = 100,
    model = 'gemini-2.0-flash'
  } = options;

  try {
    const genModel = genAI.getGenerativeModel({ 
      model,
      systemInstruction: systemMessage,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      }
    });

    const result = await genModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text || 'No response generated.';
  } catch (error: unknown) {
    console.error('Gemini API Error:', error);
    
    const apiError = error as { message?: string; status?: number };
    const errorMessage = apiError?.message || '';
    
    if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('API key')) {
      throw new Error('Invalid API key. Please check your Gemini API key configuration.');
    } else if (errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      throw new Error('API quota exceeded. Please try again later.');
    } else if (errorMessage.includes('SAFETY')) {
      throw new Error('Content was blocked due to safety filters. Try rephrasing your prompt.');
    } else if (!navigator.onLine) {
      throw new Error('No internet connection. Please check your network.');
    } else {
      throw new Error(apiError?.message || 'Failed to generate response. Please try again.');
    }
  }
}

/**
 * Generate a response for lesson sandbox experimentation
 * Now uses backend API to keep API key secure
 * @param prompt User's input prompt
 * @returns AI-generated response
 */
export async function generateLessonResponse(prompt: string): Promise<string> {
  // Check cache first
  const cacheKey = `lesson:${prompt.slice(0, 100)}`;
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    console.log('📦 Using cached response');
    return cached;
  }

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
  
  // Retry logic with exponential backoff
  const maxRetries = 3;
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(`${backendUrl}/api/lesson-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      const result = data.response || 'No response generated.';
      
      // Cache successful response
      setCachedResponse(cacheKey, result);
      return result;
      
    } catch (error: unknown) {
      lastError = error as Error;
      
      // Don't retry on client errors (400s)
      const errorMessage = (error as Error)?.message || '';
      if (errorMessage.includes('blocked') || errorMessage.includes('too long')) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  // All retries failed
  throw lastError || new Error('Failed to generate response after multiple attempts.');
}

/**
 * Evaluate a prompt for the Arena challenges
 * @param prompt User's prompt to evaluate
 * @param challenge The challenge description
 * @returns Scoring breakdown
 */
export async function evaluatePromptWithAI(prompt: string, challenge: string) {
  // Token-optimized evaluation prompt
  const evaluationPrompt = `Rate this prompt for "${challenge}":
"${prompt.slice(0, 400)}"

Score 0-100: clarity, specificity, creativity, structure.
Brief feedback.

JSON: {"clarity":N,"specificity":N,"creativity":N,"structure":N,"feedback":"..."}`;

  try {
    const response = await generateResponse({
      prompt: evaluationPrompt,
      systemMessage: '',
      temperature: 0.2,
      maxTokens: 150,
      model: 'gemini-2.0-flash'
    });

    // Remove markdown code blocks if present
    const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Parse the JSON response
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback if parsing fails
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Evaluation error:', error);
    // Return default scores if AI evaluation fails
    return {
      clarity: 70,
      specificity: 65,
      creativity: 75,
      structure: 68,
      feedback: 'Unable to generate detailed feedback. Try being more specific in your prompt.'
    };
  }
}

/**
 * Check if API key is configured
 */
export function isApiKeyConfigured(): boolean {
  return !!import.meta.env.VITE_GEMINI_API_KEY && 
         import.meta.env.VITE_GEMINI_API_KEY !== 'your_gemini_api_key_here';
}
