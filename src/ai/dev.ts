import { config } from 'dotenv';
config();

import '@/ai/flows/provide-feedback-on-generated-quiz.ts';
import '@/ai/flows/generate-quiz-from-topic.ts';
import '@/ai/flows/summarize-quiz-results.ts';