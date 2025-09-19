
'use server';
/**
 * @fileOverview A flow for ingesting a Kaggle competition using FastAPI backend.
 *
 * - generateContextFile: Fetches context file from FastAPI backend.
 * - generateContextFileFromBackend: Alternative method using FastAPI.
 * - GenerateContextFileInput: Input schema for the flow.
 * - GenerateContextFileOutput: Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { fetchContextFileContent, checkBackendHealth, BACKEND_CONFIG } from '@/lib/fastapi-backend';
import { listTopNotebooks, pullNotebook } from '../tools/kaggle';

const GenerateContextFileInputSchema = z.object({
  competitionUrl: z.string().url().describe('The URL of the Kaggle competition page.'),
  useBackend: z.boolean().optional().default(true).describe('Whether to use FastAPI backend or fallback to CLI.'),
});
export type GenerateContextFileInput = z.infer<typeof GenerateContextFileInputSchema>;

const GenerateContextFileOutputSchema = z.object({
  contextFileContent: z.string().describe('The merged content of the top 10 notebooks.'),
  source: z.enum(['backend', 'cli']).describe('Source of the context file generation.'),
});
export type GenerateContextFileOutput = z.infer<typeof GenerateContextFileOutputSchema>;

/**
 * Main function to generate context file - tries backend first, falls back to CLI
 */
export async function generateContextFile(input: GenerateContextFileInput): Promise<GenerateContextFileOutput> {
  return generateContextFileFlow(input);
}

/**
 * Generate context file using FastAPI backend
 */
export async function generateContextFileFromBackend(competitionUrl: string): Promise<string> {
  try {
    const isBackendHealthy = await checkBackendHealth();
    if (!isBackendHealthy) {
      throw new Error('FastAPI backend is not available');
    }

    const contextContent = await fetchContextFileContent(competitionUrl);
    return contextContent;
  } catch (error) {
    console.error('FastAPI backend error:', error);
    throw error;
  }
}


const generateContextFileFlow = ai.defineFlow(
  {
    name: 'generateContextFileFlow',
    inputSchema: GenerateContextFileInputSchema,
    outputSchema: GenerateContextFileOutputSchema,
  },
  async (input) => {
    console.log(`Starting context file generation for ${input.competitionUrl}`);

    // Try FastAPI backend first if enabled
    if (input.useBackend) {
      try {
        console.log('Attempting to use FastAPI backend...');
        const isBackendHealthy = await checkBackendHealth();

        if (isBackendHealthy) {
          const contextContent = await fetchContextFileContent(input.competitionUrl);
          console.log('Successfully generated context file using FastAPI backend');
          return {
            contextFileContent: contextContent,
            source: 'backend' as const
          };
        } else {
          console.log('FastAPI backend is not healthy, falling back to CLI method');
        }
      } catch (backendError) {
        console.warn('FastAPI backend failed, falling back to CLI method:', backendError);
      }
    }

    // Fallback to original CLI-based method
    console.log('Using CLI-based method for context file generation');
    return await generateContextFileCLI(input.competitionUrl);
  }
);

/**
 * Original CLI-based context file generation (fallback method)
 */
async function generateContextFileCLI(competitionUrl: string): Promise<GenerateContextFileOutput> {
  const competitionSlug = competitionUrl.split('/').pop();
  if (!competitionSlug) {
    throw new Error('Could not extract competition slug from URL.');
  }

  try {
    // 1. List top notebooks
    const topNotebooks = await listTopNotebooks({ competitionSlug });

    if (!topNotebooks || topNotebooks.length === 0) {
      return {
        contextFileContent: 'No public notebooks were found for this competition.',
        source: 'cli' as const,
      };
    }

    // 2. "Download" each notebook (gets content in memory)
    const pullPromises = topNotebooks.map(nb => pullNotebook({
      notebookSlug: nb.slug,
      downloadPath: '/tmp', // This path is now irrelevant but required by the schema
    }));

    const pulledNotebooks = await Promise.all(pullPromises);

    // 3. Read and merge the content from memory
    let mergedContent = `CONTEXT FOR KAGGLE COMPETITION: ${competitionSlug}\n\n`;
    mergedContent += `====================\n\n`;

    for (const notebook of pulledNotebooks) {
      mergedContent += `--- NOTEBOOK: ${notebook.filePath} ---\n\n`;
      // Use the 'content' field directly instead of reading a file
      mergedContent += notebook.content;
      mergedContent += `\n\n--- END OF NOTEBOOK ---\n\n`;
    }

    return {
      contextFileContent: mergedContent,
      source: 'cli' as const,
    };
  } catch (e: any) {
    console.error("In-memory analysis flow failed:", e);
    throw new Error(`In-memory analysis failed. Details: ${e.message}`);
  }
}
