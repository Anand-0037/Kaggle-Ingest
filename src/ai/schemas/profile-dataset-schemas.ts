
import { z } from 'zod';

// Schemas for Notebook Tagging
export const RawCellSchema = z.object({
    type: z.enum(['code', 'markdown']),
    content: z.string(),
});

export const TaggedCellSchema = RawCellSchema.extend({
  tags: z.array(z.string()).describe("An array of auto-generated tags identifying ML concepts (e.g., 'EDA', 'XGBoost', 'feature-engineering')."),
  signal: z.enum(['high', 'medium', 'low', 'boilerplate']).describe("A quality score to distinguish unique insights from generic code."),
});

export const DeconstructedNotebookSchema = z.object({
  title: z.string().describe("The title of the notebook."),
  author: z.string().describe("The author of the notebook."),
  url: z.string().url().describe("The direct URL to the notebook."),
  cells: z.array(TaggedCellSchema).describe("An array of ordered, tagged cells representing the notebook's content."),
});

export const TagNotebookCellsOutputSchema = z.array(TaggedCellSchema);
