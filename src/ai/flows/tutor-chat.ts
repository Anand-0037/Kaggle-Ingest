
'use server';
/**
 * @fileOverview An AI-powered chat flow for tutoring users on machine learning concepts.
 *
 * - tutorChat: Answers questions and guides users based on their interests.
 * - TutorChatInput: The input type for the tutorChat flow.
 * - TutorChatOutput: The return type for the tutorChat flow.
 */

import { ai, proModel } from '@/ai/genkit';
import { z } from 'zod';

const TutorChatInputSchema = z.object({
  question: z.string().describe('The user\'s question or message.'),
  userInterests: z.array(z.string()).optional().describe('A list of the user\'s stated interests (e.g., "Finance", "Healthcare").'),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional().describe('The history of the conversation so far.'),
});
export type TutorChatInput = z.infer<typeof TutorChatInputSchema>;

const TutorChatOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the user\'s question.'),
});
export type TutorChatOutput = z.infer<typeof TutorChatOutputSchema>;

export async function tutorChat(input: TutorChatInput): Promise<TutorChatOutput> {
  const result = await tutorChatFlow(input);
  return result;
}

const tutorPrompt = ai.definePrompt({
  name: 'tutorPrompt',
  model: proModel,
  input: { schema: TutorChatInputSchema },
  output: { schema: TutorChatOutputSchema },
  prompt: `You are "KaggleBot", an expert and friendly AI Tutor for beginners exploring machine learning. Your goal is to guide, teach, and encourage users on their learning journey.

{{#if userInterests}}
The user has expressed interest in the following fields: {{#each userInterests}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}.
{{else}}
The user is interested in general machine learning.
{{/if}}

- Your tone should be encouraging, patient, and clear.
- Break down complex topics into simple, easy-to-understand steps.
- Use analogies related to the user's interests to explain concepts where possible.
- When a user asks a question, provide a direct answer but also suggest a logical next question or topic to explore.
- If you provide code examples, use Python and keep them short and simple.
- Always recommend real-world Kaggle competitions or datasets that are suitable for a beginner's level for the topic being discussed.

{{#if chatHistory}}
Previous conversation context:
{{#each chatHistory}}
{{role}}: {{content}}
{{/each}}
{{/if}}

User's question: "{{{question}}}"

Provide your answer below.`,
});

const tutorChatFlow = ai.defineFlow(
  {
    name: 'tutorChatFlow',
    inputSchema: TutorChatInputSchema,
    outputSchema: TutorChatOutputSchema,
  },
  async (input) => {
    const { output } = await tutorPrompt(input);
    if (!output) {
      throw new Error('The AI tutor failed to generate an answer.');
    }
    return output;
  }
);
