import dotenv from 'dotenv';

dotenv.config();

export class ImageGenerator {
  constructor() {
    this.stabilityApiKey = process.env.STABILITY_API_KEY;
    this.engineId = 'stable-diffusion-xl-1024-v1-0';
    this.maxRetries = 2;
    this.timeout = 30000;
    
    // Cache for generated images (prompt -> base64 image)
    this.imageCache = new Map();
    this.maxCacheSize = 100; // Store up to 100 images
    this.cacheHits = 0;
    this.cacheMisses = 0;
    
    // Clean cache every 30 minutes
    setInterval(() => this.cleanCache(), 1800000);
    
    console.log('🔑 Stability API Key configured:', this.stabilityApiKey ? `${this.stabilityApiKey.substring(0, 10)}...` : 'NOT FOUND');
  }

  cleanCache() {
    if (this.imageCache.size > this.maxCacheSize) {
      // Remove oldest 20% of entries
      const entriesToRemove = Math.floor(this.maxCacheSize * 0.2);
      const iterator = this.imageCache.keys();
      for (let i = 0; i < entriesToRemove; i++) {
        this.imageCache.delete(iterator.next().value);
      }
      console.log(`🧹 Cleaned image cache: ${entriesToRemove} entries removed`);
    }
  }

  getCacheKey(prompt) {
    // Normalize prompt for caching
    return prompt.toLowerCase().trim();
  }

  async generateImage(word, userPrompt, retryCount = 0) {
    try {
      const finalPrompt = (userPrompt && userPrompt.trim()) ? userPrompt.trim() : word;
      const cacheKey = this.getCacheKey(finalPrompt);
      
      // Check cache first
      if (this.imageCache.has(cacheKey)) {
        this.cacheHits++;
        console.log(`✨ Cache hit for: "${finalPrompt}" (${this.cacheHits} hits, ${this.cacheMisses} misses)`);
        return this.imageCache.get(cacheKey);
      }
      
      this.cacheMisses++;
      console.log(`Generating: "${finalPrompt}"`);
      
      if (!this.stabilityApiKey || this.stabilityApiKey === 'your_stability_api_key_here') {
        console.warn('No valid Stability API key configured');
        return this.getFallbackImage(word);
      }

      const imageUrl = await this.generateWithStability(finalPrompt, word, retryCount);
      
      // Cache the result (only if it's not a fallback)
      if (imageUrl && !imageUrl.includes('placeholder')) {
        this.imageCache.set(cacheKey, imageUrl);
        console.log(`💾 Cached image for: "${finalPrompt}" (cache size: ${this.imageCache.size})`);
      }
      
      return imageUrl;
      
    } catch (error) {
      console.error('Generation failed:', error.message);
      return this.getFallbackImage(word);
    }
  }

  async generateWithStability(finalPrompt, word, retryCount) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(
        `https://api.stability.ai/v1/generation/${this.engineId}/text-to-image`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${this.stabilityApiKey}`,
          },
          body: JSON.stringify({
            text_prompts: [
              { text: finalPrompt, weight: 1.0 },
              { text: 'blurry, low quality, distorted', weight: -1 }
            ],
            cfg_scale: 7, // Reduced from 7.5 for faster generation
            height: 768, // Reduced from 1024 for faster generation
            width: 768,  // Reduced from 1024 for faster generation
            samples: 1,
            steps: 30 // Reduced from 40 for 25% faster generation
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ Stability API error ${response.status}:`, errorData);
        
        if (response.status >= 500 && retryCount < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return this.generateWithStability(finalPrompt, word, retryCount + 1);
        }
        
        console.log('⚠️ Using fallback image due to API error');
        return this.getFallbackImage(word);
      }

      const data = await response.json();
      console.log('✅ Stability API response received');
      
      if (data.artifacts?.[0]?.base64) {
        console.log('✅ Image generated successfully with Stability AI');
        return `data:image/png;base64,${data.artifacts[0].base64}`;
      }
      
      console.warn('⚠️ No image data in response, using fallback');
      return this.getFallbackImage(word);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('❌ Fetch error:', fetchError.message);
      
      if (retryCount < this.maxRetries) {
        console.log(`⚠️ Retry ${retryCount + 1}/${this.maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.generateWithStability(finalPrompt, word, retryCount + 1);
      }
      
      throw fetchError;
    }
  }

  getFallbackImage(word) {
    const colors = ['FF6B6B', '4ECDC4', '45B7D1', 'FFA07A', '98D8C8', 'F7DC6F'];
    const colorIndex = Math.abs(word.charCodeAt(0)) % colors.length;
    const fallbackUrl = `https://via.placeholder.com/512/${colors[colorIndex]}/ffffff?text=${encodeURIComponent(word)}`;
    console.log(`📦 Fallback image URL: ${fallbackUrl}`);
    return fallbackUrl;
  }
}
