'use server';

/**
 * @fileOverview Generates a quiz from a given topic and parameters.
 *
 * - generateQuizFromTopic - A function that generates a quiz based on topic and parameters.
 * - GenerateQuizFromTopicInput - The input type for the generateQuizFromTopic function.
 * - GenerateQuizFromTopicOutput - The return type for the generateQuizFromTopic function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizFromTopicInputSchema = z.object({
  topic: z.string().describe('The topic of the quiz.'),
  numQuestions: z.number().int().positive().default(5).describe('The number of questions in the quiz.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium').describe('The difficulty level of the quiz.'),
});

export type GenerateQuizFromTopicInput = z.infer<typeof GenerateQuizFromTopicInputSchema>;

const QuizQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  answer: z.string(),
});

const GenerateQuizFromTopicOutputSchema = z.object({
  quiz: z.array(QuizQuestionSchema).describe('An array of quiz questions.'),
});

export type GenerateQuizFromTopicOutput = z.infer<typeof GenerateQuizFromTopicOutputSchema>;

export async function generateQuizFromTopic(input: GenerateQuizFromTopicInput): Promise<GenerateQuizFromTopicOutput> {
  return generateQuizFromTopicFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizFromTopicPrompt',
  input: {schema: GenerateQuizFromTopicInputSchema},
  output: {schema: GenerateQuizFromTopicOutputSchema},
  prompt: `You are a quiz generator. Generate a quiz on the topic of {{topic}} with {{numQuestions}} questions and a difficulty of {{difficulty}}.
You MUST return the quiz in a valid JSON object that adheres to the output schema.
Do not include any other text or formatting outside of the JSON object.`,
});

const generateQuizFromTopicFlow = ai.defineFlow(
  {
    name: 'generateQuizFromTopicFlow',
    inputSchema: GenerateQuizFromTopicInputSchema,
    outputSchema: GenerateQuizFromTopicOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
