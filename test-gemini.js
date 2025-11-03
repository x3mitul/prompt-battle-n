import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

const API_KEY = process.env.VITE_GEMINI_API_KEY;

console.log('API Key:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'NOT FOUND');

const genAI = new GoogleGenerativeAI(API_KEY);

async function testModel() {
  try {
    console.log('\nTesting gemini-2.5-flash model...');
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: 'You are a helpful assistant.',
    });
    
    const result = await model.generateContent('Say hello in one sentence');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Success! Response:', text);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testModel();
