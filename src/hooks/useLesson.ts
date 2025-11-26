import { useState, useCallback } from 'react';
import { LESSON_CONFIG } from '@/constants';

export function useLesson(lessonId: string) {
  const [prompt, setPrompt] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Check if lesson is completed
  const checkCompletion = useCallback(() => {
    const completed = localStorage.getItem(LESSON_CONFIG.COMPLETED_LESSONS_KEY);
    if (completed) {
      const completedLessons: string[] = JSON.parse(completed);
      setIsCompleted(completedLessons.includes(lessonId));
    }
  }, [lessonId]);

  // Mark lesson as completed
  const markCompleted = useCallback(() => {
    const completed = localStorage.getItem(LESSON_CONFIG.COMPLETED_LESSONS_KEY);
    const completedLessons: string[] = completed ? JSON.parse(completed) : [];
    
    if (!completedLessons.includes(lessonId)) {
      completedLessons.push(lessonId);
      localStorage.setItem(
        LESSON_CONFIG.COMPLETED_LESSONS_KEY,
        JSON.stringify(completedLessons)
      );
      setIsCompleted(true);
    }
  }, [lessonId]);

  // Generate response
  const generateResponse = useCallback(
    async (generateFunction: (prompt: string) => Promise<string>) => {
      if (prompt.length < LESSON_CONFIG.MIN_PROMPT_LENGTH) {
        setError('Prompt is too short. Please write at least 10 characters.');
        return;
      }

      setLoading(true);
      setError(null);
      setResponse('');

      try {
        const result = await generateFunction(prompt);
        setResponse(result);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to generate response. Please try again.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [prompt]
  );

  const clearResponse = useCallback(() => {
    setResponse('');
    setError(null);
  }, []);

  const resetLesson = useCallback(() => {
    setPrompt('');
    setResponse('');
    setError(null);
  }, []);

  return {
    prompt,
    setPrompt,
    response,
    loading,
    error,
    isCompleted,
    checkCompletion,
    markCompleted,
    generateResponse,
    clearResponse,
    resetLesson,
  };
}
