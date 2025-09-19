
'use server';
/**
 * @fileOverview A flow for ingesting a Kaggle competition and analyzing its top notebooks.
 *
 * - ingestCompetition: The main flow function.
 * - IngestCompetitionInput: Input schema for the flow.
 * - IngestCompetitionOutput: Output schema for the flow.
 */

import { ai, proModel } from '@/ai/genkit';
import { z } from 'zod';
import { listTopNotebooks, pullNotebook } from '../tools/kaggle';
import { DeconstructedNotebookSchema } from '../schemas/profile-dataset-schemas';
import { tagNotebookCells } from './tag-notebook-cells';

const IngestCompetitionInputSchema = z.object({
  competitionUrl: z.string().url().describe('The URL of the Kaggle competition page.'),
  creds: z.object({
    kaggleUsername: z.string(),
    kaggleKey: z.string(),
  }).optional().describe('Kaggle API credentials. If not provided, will use environment variables.'),
});
export type IngestCompetitionInput = z.infer<typeof IngestCompetitionInputSchema>;


const IngestCompetitionOutputSchema = z.object({
  summary: z.string().describe("A one-paragraph summary of the competition's goal."),
  deconstructedNotebooks: z.array(DeconstructedNotebookSchema).describe("An array of the top 10 deconstructed notebooks."),
});
export type IngestCompetitionOutput = z.infer<typeof IngestCompetitionOutputSchema>;

export async function ingestCompetition(input: IngestCompetitionInput): Promise<IngestCompetitionOutput> {
  return ingestCompetitionFlow(input);
}


const summaryPrompt = ai.definePrompt({
  name: 'competitionSummaryPrompt',
  model: proModel,
  input: { schema: z.object({ competitionContext: z.string() }) },
  output: { schema: z.object({ summary: z.string() }) },
  prompt: `Based on the content from the top notebooks of a Kaggle competition provided below, generate a concise, one-paragraph summary of the competition's main goal. Focus on what problem is being solved (e.g., "predicting house prices," "classifying images of dogs").

Competition Context:
---
{{{competitionContext}}}
---
`,
});


const ingestCompetitionFlow = ai.defineFlow(
  {
    name: 'ingestCompetitionFlow',
    inputSchema: IngestCompetitionInputSchema,
    outputSchema: IngestCompetitionOutputSchema,
  },
  async (input) => {
    console.log(`Starting analysis for ${input.competitionUrl}`);

    const competitionSlug = input.competitionUrl.split('/').pop();
    if (!competitionSlug) {
      throw new Error('Could not extract competition slug from URL.');
    }

    try {
      // 1. Get top notebooks using REST API
      console.log(`Getting top notebooks for ${competitionSlug} using REST API...`);
      const topNotebookSlugs = await listTopNotebooks({
        competitionSlug,
        creds: input.creds
      });

      if (!topNotebookSlugs || topNotebookSlugs.length === 0) {
        console.log(`No notebooks found for ${competitionSlug}`);
        return {
          summary: 'No public notebooks were found for this competition, so a summary could not be generated.',
          deconstructedNotebooks: [],
        };
      }

      console.log(`Found ${topNotebookSlugs.length} notebooks for ${competitionSlug}`);

      // 2. Download and process each notebook
      const notebookPromises = topNotebookSlugs.slice(0, 10).map(async (notebookInfo) => {
        try {
          console.log(`Processing notebook: ${notebookInfo.slug}`);

          // Download the notebook content via REST API
          const { content: notebookContent } = await pullNotebook({
            notebookSlug: notebookInfo.slug,
            downloadPath: '/tmp', // Not used for REST API, but required by schema
            creds: input.creds
          });

          // Parse the notebook content
          const notebookJson = JSON.parse(notebookContent);

          // Extract cells
          const cells: { type: 'code' | 'markdown'; content: string }[] = notebookJson.cells?.map((cell: any) => ({
            type: cell.cell_type === 'code' ? 'code' : 'markdown',
            content: Array.isArray(cell.source) ? cell.source.join('') : String(cell.source || ''),
          })) || [];

          // Extract title and author from slug
          const [author, title] = notebookInfo.slug.split('/');
          const url = `https://www.kaggle.com/code/${notebookInfo.slug}`;

          // Tag the cells
          const taggedCells = await tagNotebookCells({
            title: title?.replace(/-/g, ' ') || 'Untitled Notebook',
            author: author || 'Unknown Author',
            url: url,
            content: cells,
          });

          return {
            title: title?.replace(/-/g, ' ') || 'Untitled Notebook',
            author: author || 'Unknown Author',
            url: url,
            rawContent: cells,
            cells: taggedCells
          };

        } catch (error) {
          console.warn(`Failed to process notebook ${notebookInfo.slug}:`, error);
          return null;
        }
      });

      const results = await Promise.allSettled(notebookPromises);
      const deconstructedNotebooks = results
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
        .map(result => result.value)
        .filter(nb => nb !== null);

      if (deconstructedNotebooks.length === 0) {
        return {
          summary: 'No notebooks could be successfully processed for this competition.',
          deconstructedNotebooks: [],
        };
      }

      // 3. Generate a summary based on the notebooks
      const summaryContext = deconstructedNotebooks
        .map(nb => `Notebook: ${nb.title}\n` + nb.cells.map((c: any) => c.content).join('\n'))
        .join('\n\n');

      const { output: summaryOutput } = await summaryPrompt({ competitionContext: summaryContext });
      const summary = summaryOutput?.summary || "Could not generate a summary for this competition.";

      console.log(`Successfully processed ${deconstructedNotebooks.length} notebooks for ${competitionSlug}`);
      return {
        summary,
        deconstructedNotebooks,
      };

    } catch (error) {
      console.error(`Error in ingestCompetitionFlow for ${competitionSlug}:`, error);

      // Provide helpful error messages based on the error type
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          throw new Error('Invalid Kaggle credentials. Please check your username and API key in Settings.');
        }
      }

      throw error;
    }
  }
);
