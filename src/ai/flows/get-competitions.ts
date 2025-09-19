
'use server';
/**
 * @fileOverview A flow for fetching Kaggle competitions.
 *
 * - getCompetitions: Fetches a list of competitions from the Kaggle API.
 * - CompetitionSchema: The Zod schema for a single competition object.
 * - GetCompetitionsOutput: The output type for the getCompetitions flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { listCompetitions as getCompetitionsTool } from '@/ai/tools/kaggle';
import { getUserKaggleCreds } from '@/app/actions';

const CompetitionSchema = z.object({
  id: z.any(),
  title: z.string(),
  url: z.string(),
  prize: z.string(),
  status: z.string(),
  lastUpdated: z.string().optional(),
  tags: z.array(z.string()).optional(),
});


const GetCompetitionsOutputSchema = z.array(CompetitionSchema);

export type GetCompetitionsOutput = z.infer<typeof GetCompetitionsOutputSchema>;

// This is the exported function that the UI will call.
export async function getCompetitions(uid: string): Promise<GetCompetitionsOutput> {
  // Directly call the flow and return its output.
  const competitions = await getCompetitionsFlow(uid);
  return competitions;
}

// This is the Genkit flow definition.
const getCompetitionsFlow = ai.defineFlow(
  {
    name: 'getCompetitionsFlow',
    inputSchema: z.string(), // UID
    outputSchema: GetCompetitionsOutputSchema,
  },
  async (uid) => {
    const creds = await getUserKaggleCreds(uid);

    if (!creds || !creds.kaggleUsername || !creds.kaggleKey) {
      throw new Error('Kaggle API credentials not found. Please add them in Settings or set KAGGLE_USERNAME and KAGGLE_KEY in your environment variables.');
    }

    const competitions = await getCompetitionsTool({ creds });
    return competitions;
  }
);
