import { generateLessonResponse } from '../gemini';
import { API_CONFIG } from '@/constants';

// Mock fetch
global.fetch = jest.fn();

describe('gemini', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateLessonResponse', () => {
    it('should return response on successful API call', async () => {
      const mockResponse = { response: 'Great prompt!' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await generateLessonResponse('Test prompt');
      
      expect(result).toEqual('Great prompt!');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/lesson-response'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should retry on failure', async () => {
      const mockResponse = { response: 'Success after retry' };
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

      const result = await generateLessonResponse('Test prompt');
      
      expect(result).toEqual('Success after retry');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should throw error after max retries', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(
        generateLessonResponse('Test prompt')
      ).rejects.toThrow();

      expect(global.fetch).toHaveBeenCalledTimes(API_CONFIG.RETRY_ATTEMPTS);
    });

    it('should handle non-ok responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      });

      await expect(
        generateLessonResponse('Test prompt')
      ).rejects.toThrow();
    });
  });
});
