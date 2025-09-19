
'use server';
/**
 * @fileOverview A flow for tagging individual notebook cells with ML concepts and a quality signal.
 */

import { ai, proModel } from '@/ai/genkit';
import { z } from 'zod';
import { RawCellSchema, TaggedCellSchema, TagNotebookCellsOutputSchema } from '@/ai/schemas/profile-dataset-schemas';


const TagNotebookCellsInputSchema = z.object({
  title: z.string(),
  author: z.string(),
  url: z.string().url(),
  content: z.array(RawCellSchema),
});

export type TagNotebookCellsInput = z.infer<typeof TagNotebookCellsInputSchema>;
export type TagNotebookCellsOutput = z.infer<typeof TagNotebookCellsOutputSchema>;


export async function tagNotebookCells(
  input: TagNotebookCellsInput
): Promise<TagNotebookCellsOutput> {
  return tagNotebookCellsFlow(input);
}


const cellTaggingPrompt = ai.definePrompt({
  name: 'cellTaggingPrompt',
  model: proModel,
  input: { schema: z.object({ notebookContext: z.string() }) },
  output: { schema: TagNotebookCellsOutputSchema },
  prompt: `You are an expert Data Science Analyst responsible for deconstructing Kaggle notebooks. You will be given the full content of a notebook, cell by cell.

Your task is to analyze EACH cell individually and assign it metadata. For each cell, you must determine:

1.  **Tags**: A list of granular, specific machine learning concepts present in the cell. Examples:
    *   Good tags: 'EDA', 'XGBoost', 'feature-engineering', 'data-cleaning', 'visualization', 'model-training', 'submission'.
    *   Bad tags: 'code', 'important', 'cell-5'.

2.  **Signal**: A quality score assessing the cell's importance and uniqueness. Assign one of the following:
    *   'high': Contains a critical, unique insight, a core modeling step, or a clever technique.
    *   'medium': A standard but important step, like loading data or a common visualization.
    *   'low': Minor utility, setup, or a very simple, common operation.
    *   'boilerplate': Standard library imports, environment setup, or highly generic helper functions that appear in many notebooks.

Here is the notebook content:
---
{{{notebookContext}}}
---

Analyze every single cell and return a valid JSON array where each object represents a cell and its assigned metadata. The output must match the provided schema exactly for every cell.
`,
});


const tagNotebookCellsFlow = ai.defineFlow(
  {
    name: 'tagNotebookCellsFlow',
    inputSchema: TagNotebookCellsInputSchema,
    outputSchema: TagNotebookCellsOutputSchema,
  },
  async (input) => {
    const notebookContext = input.content
      .map((cell, index) => `## CELL ${index} (TYPE: ${cell.type.toUpperCase()})\n${cell.content}`)
      .join('\n\n---\n');

    try {
      const { output } = await cellTaggingPrompt({ notebookContext });
      if (!output) {
        throw new Error('AI cell tagging returned no output.');
      }

      // The AI might miss a cell, so we ensure the output has the same length as the input
      if (output.length !== input.content.length) {
        console.warn(`Cell count mismatch. Input: ${input.content.length}, Output: ${output.length}. Returning raw cells with warning tag.`);
        // As a fallback, return the original content with default tags/signal and a warning tag
        return input.content.map(cell => ({
          ...cell,
          tags: ['untagged', 'tagging-mismatch'],
          signal: 'low' as const
        }));
      }

      return output;

    } catch (e: any) {
      console.error("Cell tagging flow failed:", e);
      throw new Error(`Failed to tag notebook cells. Details: ${e.message}`);
    }
  }
);
