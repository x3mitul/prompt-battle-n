import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Simple cache to avoid duplicate API calls (saves tokens)
const cache = new Map();
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes
const MAX_CACHE = 100;

function getCache(key) {
  const item = cache.get(key);
  if (item && Date.now() - item.ts < CACHE_TTL) return item.data;
  cache.delete(key);
  return null;
}

function setCache(key, data) {
  if (cache.size >= MAX_CACHE) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(key, { data, ts: Date.now() });
}

export class PromptEvaluator {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        maxOutputTokens: 150,
        temperature: 0.3,
      }
    });
    // Fallback API client
    this.fallbackGenAI = process.env.GEMINI_API_KEY_FALLBACK 
      ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY_FALLBACK)
      : null;
    
    // Log token savings
    this.tokensSaved = 0;
  }

  async generateLessonResponse(userPrompt) {
    // Truncate user prompt to save input tokens
    const truncatedPrompt = userPrompt.slice(0, 500);
    
    // Check cache first
    const cacheKey = `lesson:${truncatedPrompt.slice(0, 50)}`;
    const cached = getCache(cacheKey);
    if (cached) {
      console.log('📦 Cache hit - saved ~200 tokens');
      return cached;
    }
    
    try {
      const model = this.genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
        systemInstruction: 'Be concise. Respond directly without meta-commentary.',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 120,
        }
      });

      const result = await model.generateContent(truncatedPrompt);
      const response = await result.response;
      const text = response.text();
      
      // Cache the result
      if (text) setCache(cacheKey, text);
      
      return text || 'No response generated.';
      
    } catch (error) {
      console.error('❌ Lesson response error:', error.message);
      throw error;
    }
  }

  async evaluatePrompt(userPrompt, challenge, levelId) {
    // Validate prompt length - penalize very short prompts
    const trimmedPrompt = userPrompt.trim();
    const wordCount = trimmedPrompt.split(/\s+/).filter(w => w.length > 0).length;
    
    // If prompt is too short, return low scores without calling API
    if (wordCount <= 3) {
      console.log(`⚠️ Prompt too short (${wordCount} words), returning low scores`);
      return {
        clarity: Math.min(40, wordCount * 15),
        specificity: Math.min(25, wordCount * 10),
        creativity: Math.min(30, wordCount * 12),
        structure: Math.min(35, wordCount * 15),
        feedback: "Your prompt is too short. Good prompts need more detail and context to guide the AI effectively.",
        tip: "Try adding: what you want, how you want it, who it's for, and any specific requirements or constraints."
      };
    }
    
    // If prompt is short (4-10 words), add penalty instructions
    const shortPromptPenalty = wordCount < 10 
      ? " Note: Short prompts with few details should score lower on specificity and creativity."
      : "";

    // Check cache for similar evaluations
    const cacheKey = `eval:${levelId}:${trimmedPrompt.slice(0, 50)}`;
    const cached = getCache(cacheKey);
    if (cached) {
      console.log('📦 Evaluation cache hit - saved ~300 tokens');
      return cached;
    }

    // Compressed evaluation prompt for token efficiency
    const evaluationPrompt = `Evaluate prompt for: "${challenge.slice(0, 100)}"
Prompt (${wordCount} words): "${trimmedPrompt.slice(0, 400)}"

Score 0-100: clarity, specificity, creativity, structure.${shortPromptPenalty}
Brief feedback + 1 tip.

JSON only: {"clarity":N,"specificity":N,"creativity":N,"structure":N,"feedback":"...","tip":"..."}`;

    // Try with retry and fallback
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const apiToUse = attempt === 0 ? this.genAI : (this.fallbackGenAI || this.genAI);
        const model = apiToUse.getGenerativeModel({ 
          model: 'gemini-2.0-flash',
          generationConfig: { maxOutputTokens: 180, temperature: 0.2 }
        });
        
        const result = await model.generateContent(evaluationPrompt);
        const response = await result.response;
        const text = response.text();
      
        // Clean up the response - remove markdown code blocks if present
        let cleanText = text.trim();
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/```\n?/g, '');
        }
        
        const evaluation = JSON.parse(cleanText);
        
        // Validate scores are within range
        evaluation.clarity = Math.max(0, Math.min(100, evaluation.clarity));
        evaluation.specificity = Math.max(0, Math.min(100, evaluation.specificity));
        evaluation.creativity = Math.max(0, Math.min(100, evaluation.creativity));
        evaluation.structure = Math.max(0, Math.min(100, evaluation.structure));
        
        console.log(`✅ Evaluated prompt for level ${levelId}:`, {
          avg: Math.round((evaluation.clarity + evaluation.specificity + evaluation.creativity + evaluation.structure) / 4)
        });
        
        // Cache successful evaluation
        setCache(cacheKey, evaluation);
        
        return evaluation;
        
      } catch (error) {
        console.error(`❌ Attempt ${attempt + 1} failed:`, error.message);
        if (attempt === 1) {
          // Both attempts failed, return fallback
          return {
            clarity: 70,
            specificity: 65,
            creativity: 75,
            structure: 70,
            feedback: "Unable to get AI evaluation. Your prompt looks good! Keep practicing.",
            tip: "Try to be more specific with your instructions."
          };
        }
        // Wait before retry
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }
}
