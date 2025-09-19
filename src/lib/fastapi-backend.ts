/**
 * @fileOverview Utility functions for integrating with FastAPI backend
 * Handles context file generation and downloading from Kaggle competitions
 */

/**
 * Fetches context file from FastAPI backend and triggers download
 * @param competitionUrl - The full URL of the Kaggle competition
 * @returns Promise that resolves when download is triggered
 */
export async function fetchContextFile(competitionUrl: string): Promise<void> {
    try {
        const response = await fetch(
            `${BACKEND_CONFIG.baseUrl}${BACKEND_CONFIG.endpoints.getContext}?url=${encodeURIComponent(competitionUrl)}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch context file: ${response.status} - ${errorText}`);
        }

        // Trigger browser download
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);

        // Extract competition name from URL for filename
        const competitionSlug = extractCompetitionSlug(competitionUrl);
        link.download = `${competitionSlug}-context.txt`;

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the object URL
        window.URL.revokeObjectURL(link.href);
    } catch (error) {
        console.error('Error fetching context file:', error);
        throw error;
    }
}

/**
 * Fetches context file content as text without triggering download
 * @param competitionUrl - The full URL of the Kaggle competition
 * @returns Promise that resolves to the context file content as string
 */
export async function fetchContextFileContent(competitionUrl: string): Promise<string> {
    try {
        const response = await fetch(
            `${BACKEND_CONFIG.baseUrl}${BACKEND_CONFIG.endpoints.getContext}?url=${encodeURIComponent(competitionUrl)}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch context file: ${response.status} - ${errorText}`);
        }

        return await response.text();
    } catch (error) {
        console.error('Error fetching context file content:', error);
        throw error;
    }
}

/**
 * Extracts competition slug from Kaggle URL
 * @param url - The full Kaggle competition URL
 * @returns The competition slug (e.g., "titanic")
 */
function extractCompetitionSlug(url: string): string {
    const match = url.match(/\/competitions\/([^\/]+)\/?/);
    if (!match) {
        throw new Error('Invalid Kaggle competition URL');
    }
    return match[1];
}

/**
 * Checks if the FastAPI backend is running
 * @returns Promise that resolves to true if backend is available
 */
export async function checkBackendHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${BACKEND_CONFIG.baseUrl}/`, {
            method: 'GET',
            timeout: 5000, // 5 second timeout
        } as RequestInit);

        return response.ok;
    } catch (error) {
        console.warn('FastAPI backend not available:', error);
        return false;
    }
}

/**
 * Configuration for the FastAPI backend
 */
export const BACKEND_CONFIG = {
    baseUrl: process.env.NEXT_PUBLIC_FASTAPI_BACKEND_URL || 'http://127.0.0.1:8000',
    endpoints: {
        getContext: '/get-context',
        health: '/health',
    },
    timeout: 30000, // 30 seconds for context generation
} as const;