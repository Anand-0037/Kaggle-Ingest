
'use server';
/**
 * @fileOverview An AI-powered chat flow for mentoring users on Kaggle competitions.
 *
 * - mentorChat: Answers questions about a competition based on provided context.
 * - MentorChatInput: The input type for the mentorChat flow.
 * - MentorChatOutput: The return type for the mentorChat flow.
 */

import { ai, proModel } from '@/ai/genkit';
import { z } from 'zod';

const MentorChatInputSchema = z.object({
  question: z.string().describe('The user\'s question about the competition.'),
  competitionContext: z.string().describe('The detailed context and summary of the competition.'),
});
export type MentorChatInput = z.infer<typeof MentorChatInputSchema>;

const MentorChatOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the user\'s question.'),
});
export type MentorChatOutput = z.infer<typeof MentorChatOutputSchema>;

export async function mentorChat(input: MentorChatInput): Promise<MentorChatOutput> {
  return mentorChatFlow(input);
}

const mentorPrompt = ai.definePrompt({
  name: 'mentorPrompt',
  model: proModel,
  input: { schema: MentorChatInputSchema },
  output: { schema: MentorChatOutputSchema },
  prompt: `You are an expert Data Science mentor. A user is asking a question about a specific Kaggle competition. Your task is to provide a clear, helpful, and insightful answer based *only* on the provided context.

Do not use any external knowledge. If the answer is not in the context, state that the information is not available in the provided materials.

Here is the competition context:
---
{{{competitionContext}}}
---

Here is the user's question:
"{{{question}}}"

Provide your answer below.
`,
});

const mentorChatFlow = ai.defineFlow(
  {
    name: 'mentorChatFlow',
    inputSchema: MentorChatInputSchema,
    outputSchema: MentorChatOutputSchema,
  },
  async (input) => {
    const { output } = await mentorPrompt(input);
    if (!output) {
      throw new Error('The AI failed to generate an answer.');
    }
    return output;
  }
);
