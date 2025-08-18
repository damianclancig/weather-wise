/**
 * @fileOverview Zod schemas and TypeScript types for AI flows.
 * This file does not contain 'use server' and can be safely imported
 * in both server and client components.
 */

import { z } from 'zod';

export const GenerateBackgroundInputSchema = z.object({
    city: z.string().describe('The name of the city for which to generate a background image.'),
    weather: z.string().describe('A brief description of the current weather (e.g., "Clear sky", "Light rain").'),
});
export type GenerateBackgroundInput = z.infer<typeof GenerateBackgroundInputSchema>;

export const GenerateBackgroundOutputSchema = z.object({
    image: z.string().describe("A data URI of the generated image. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type GenerateBackgroundOutput = z.infer<typeof GenerateBackgroundOutputSchema>;
