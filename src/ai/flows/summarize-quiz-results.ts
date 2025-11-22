'use server';

/**
 * @fileOverview Summarizes quiz results, identifying strengths and weaknesses.
 *
 * - summarizeQuizResults - A function that summarizes quiz results.
 * - SummarizeQuizResultsInput - The input type for the summarizeQuizResults function.
 * - SummarizeQuizResultsOutput - The return type for the summarizeQuizResults function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeQuizResultsInputSchema = z.object({
  quizName: z.string().describe('The name of the quiz.'),
  userAnswers: z
    .array(z.string())
    .describe('An array of the user answers to the quiz questions.'),
  correctAnswers: z
    .array(z.string())
    .describe('An array of the correct answers to the quiz questions.'),
});
export type SummarizeQuizResultsInput = z.infer<typeof SummarizeQuizResultsInputSchema>;

const SummarizeQuizResultsOutputSchema = z.object({
  summary: z.string().describe('A summary of the user quiz results.'),
});
export type SummarizeQuizResultsOutput = z.infer<typeof SummarizeQuizResultsOutputSchema>;

export async function summarizeQuizResults(input: SummarizeQuizResultsInput): Promise<SummarizeQuizResultsOutput> {
  return summarizeQuizResultsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeQuizResultsPrompt',
  input: {schema: SummarizeQuizResultsInputSchema},
  output: {schema: SummarizeQuizResultsOutputSchema},
  prompt: `You are an AI that summarizes quiz results for users.

  Quiz Name: {{{quizName}}}
  User Answers: {{{userAnswers}}}
  Correct Answers: {{{correctAnswers}}}

  Analyze the user's answers compared to the correct answers and provide a summary of their performance, highlighting areas of strength and areas for improvement.
  Focus on providing actionable insights to help the user improve their understanding of the material.  If all answers are correct, congratulate them and encourage them to try a harder quiz.
  Do not mention the number of correct answers, only the areas where they did well and the areas where they can improve.
  The response should be limited to 200 words.
  `,
});

const summarizeQuizResultsFlow = ai.defineFlow(
  {
    name: 'summarizeQuizResultsFlow',
    inputSchema: SummarizeQuizResultsInputSchema,
    outputSchema: SummarizeQuizResultsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
