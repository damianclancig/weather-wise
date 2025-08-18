
'use server';

/**
 * @fileOverview A Genkit flow that generates a background image for the weather app.
 * 
 * - generateBackground: A function that takes a city and weather description and returns a background image.
 */

import { ai } from '@/ai/genkit';
import { 
    GenerateBackgroundInputSchema, 
    type GenerateBackgroundInput, 
    GenerateBackgroundOutputSchema, 
    type GenerateBackgroundOutput 
} from './schemas';


// This is the exported function that will be called from server actions.
export async function generateBackground(input: GenerateBackgroundInput): Promise<GenerateBackgroundOutput> {
    return generateBackgroundFlow(input);
}


const generateBackgroundFlow = ai.defineFlow(
  {
    name: 'generateBackgroundFlow',
    inputSchema: GenerateBackgroundInputSchema,
    outputSchema: GenerateBackgroundOutputSchema,
  },
  async ({ city, weather }) => {
    
    const { media } = await ai.generate({
        // IMPORTANT: ONLY the googleai/gemini-2.0-flash-preview-image-generation model is able to generate images. You MUST use exactly this model to generate images.
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: `A beautiful, photorealistic, panoramic landscape photo of ${city} with ${weather}. Cinematic lighting, high resolution, dramatic angle.`,
        config: {
          responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
          safetySettings: [
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          ],
        },
    });

    if (!media?.url) {
      throw new Error('Image generation failed to return an image.');
    }
    
    return {
      image: media.url,
    };
  }
);
