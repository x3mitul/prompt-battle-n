import { useState, useEffect } from 'react';
import { ARENA_CONFIG } from '@/constants';

export interface ArenaScore {
  clarity: number;
  specificity: number;
  creativity: number;
  structure: number;
  feedback: string;
}

export function useArena() {
  const [level, setLevel] = useState<number>(1);
  const [xp, setXp] = useState<number>(0);
  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ArenaScore | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load XP from localStorage
  useEffect(() => {
    const savedXp = localStorage.getItem(ARENA_CONFIG.XP_STORAGE_KEY);
    if (savedXp) {
      setXp(Number(savedXp));
    }
  }, []);

  // Calculate level from XP
  useEffect(() => {
    const newLevel = Math.min(
      ARENA_CONFIG.TOTAL_LEVELS,
      Math.floor(xp / 100) + 1
    );
    setLevel(newLevel);
  }, [xp]);

  // Save XP to localStorage
  const updateXp = (newXp: number) => {
    setXp(newXp);
    localStorage.setItem(ARENA_CONFIG.XP_STORAGE_KEY, newXp.toString());
  };

  const resetPrompt = () => {
    setPrompt('');
    setResult(null);
    setError(null);
  };

  const submitPrompt = async (evaluateFunction: (prompt: string, challenge: string) => Promise<ArenaScore>, challenge: string) => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const score = await evaluateFunction(prompt, challenge);
      setResult(score);

      // Calculate XP gain
      const totalScore = 
        score.clarity + 
        score.specificity + 
        score.creativity + 
        score.structure;
      const xpGain = Math.floor(totalScore / 4);
      updateXp(xp + xpGain);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to evaluate prompt';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    level,
    xp,
    prompt,
    setPrompt,
    loading,
    result,
    error,
    resetPrompt,
    submitPrompt,
  };
}
