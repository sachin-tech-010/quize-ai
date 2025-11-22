'use server';

/**
 * @fileOverview Allows users to provide feedback on generated quizzes to improve future quiz generation.
 *
 * @exported
 * - provideFeedbackOnGeneratedQuiz -  a function that takes quiz feedback from the user and stores it.
 * @exported
 * - ProvideFeedbackOnGeneratedQuizInput - The input type for the provideFeedbackOnGeneratedQuiz function.
 * @exported
 * - ProvideFeedbackOnGeneratedQuizOutput - The return type for the provideFeedbackOnGeneratedQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideFeedbackOnGeneratedQuizInputSchema = z.object({
  quizId: z.string().describe('The ID of the generated quiz.'),
  feedback: z.string().describe('The feedback provided by the user.'),
});

export type ProvideFeedbackOnGeneratedQuizInput = z.infer<typeof ProvideFeedbackOnGeneratedQuizInputSchema>;

const ProvideFeedbackOnGeneratedQuizOutputSchema = z.object({
  success: z.boolean().describe('Indicates whether the feedback was successfully recorded.'),
});

export type ProvideFeedbackOnGeneratedQuizOutput = z.infer<typeof ProvideFeedbackOnGeneratedQuizOutputSchema>;

export async function provideFeedbackOnGeneratedQuiz(input: ProvideFeedbackOnGeneratedQuizInput): Promise<ProvideFeedbackOnGeneratedQuizOutput> {
  return provideFeedbackOnGeneratedQuizFlow(input);
}

const provideFeedbackOnGeneratedQuizFlow = ai.defineFlow({
  name: 'provideFeedbackOnGeneratedQuizFlow',
  inputSchema: ProvideFeedbackOnGeneratedQuizInputSchema,
  outputSchema: ProvideFeedbackOnGeneratedQuizOutputSchema,
}, async (input) => {
  // For now, just log the feedback.  In a real application, this would
  // save the feedback to a database or other storage mechanism.
  console.log(`Quiz ID: ${input.quizId}, Feedback: ${input.feedback}`);

  // Simulate successful feedback recording.
  return {success: true};
});
