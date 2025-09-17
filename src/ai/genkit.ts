import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {groq} from 'genkit/providers/groq';

export const ai = genkit({
  plugins: [googleAI(), groq({apiKey: process.env.GROQ_API_KEY})],
  model: 'groq/llama3-8b-8192',
});
