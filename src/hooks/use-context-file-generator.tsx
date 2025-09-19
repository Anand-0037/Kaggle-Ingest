"use client";

import { useState, useCallback } from 'react';
import { fetchContextFile, checkBackendHealth, BACKEND_CONFIG } from '@/lib/fastapi-backend';

interface UseContextFileGeneratorState {
    isLoading: boolean;
    isGenerating: boolean;
    error: string | null;
    isBackendAvailable: boolean | null;
    lastGenerated: string | null;
}

interface UseContextFileGeneratorReturn extends UseContextFileGeneratorState {
    generateContextFile: (competitionUrl: string) => Promise<void>;
    checkBackend: () => Promise<void>;
    clearError: () => void;
    reset: () => void;
}

/**
 * React hook for managing context file generation with FastAPI backend
 */
export function useContextFileGenerator(): UseContextFileGeneratorReturn {
    const [state, setState] = useState<UseContextFileGeneratorState>({
        isLoading: false,
        isGenerating: false,
        error: null,
        isBackendAvailable: null,
        lastGenerated: null,
    });

    const updateState = useCallback((updates: Partial<UseContextFileGeneratorState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    const checkBackend = useCallback(async () => {
        updateState({ isLoading: true, error: null });

        try {
            const isAvailable = await checkBackendHealth();
            updateState({
                isBackendAvailable: isAvailable,
                isLoading: false,
                error: isAvailable ? null : `FastAPI backend is not available. Please ensure the backend server is running on ${BACKEND_CONFIG.baseUrl}`
            });
        } catch (error) {
            updateState({
                isBackendAvailable: false,
                isLoading: false,
                error: `Failed to check backend health: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
        }
    }, [updateState]);

    const generateContextFile = useCallback(async (competitionUrl: string) => {
        if (!competitionUrl) {
            updateState({ error: 'Please provide a valid Kaggle competition URL' });
            return;
        }

        // Validate URL format
        const kaggleUrlPattern = /https?:\/\/(?:www\.)?kaggle\.com\/competitions\/[^\/]+\/?/;
        if (!kaggleUrlPattern.test(competitionUrl)) {
            updateState({ error: 'Please provide a valid Kaggle competition URL (e.g., https://www.kaggle.com/competitions/titanic)' });
            return;
        }

        updateState({
            isGenerating: true,
            isLoading: true,
            error: null
        });

        try {
            // First check if backend is available
            const isBackendHealthy = await checkBackendHealth();

            if (!isBackendHealthy) {
                throw new Error(`FastAPI backend is not available. Please ensure the backend server is running on ${BACKEND_CONFIG.baseUrl}`);
            }

            // Generate and download context file
            await fetchContextFile(competitionUrl);

            updateState({
                isGenerating: false,
                isLoading: false,
                isBackendAvailable: true,
                lastGenerated: competitionUrl,
                error: null
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

            updateState({
                isGenerating: false,
                isLoading: false,
                error: errorMessage,
                isBackendAvailable: false
            });

            // Log detailed error for debugging
            console.error('Context file generation failed:', error);
        }
    }, [updateState]);

    const clearError = useCallback(() => {
        updateState({ error: null });
    }, [updateState]);

    const reset = useCallback(() => {
        setState({
            isLoading: false,
            isGenerating: false,
            error: null,
            isBackendAvailable: null,
            lastGenerated: null,
        });
    }, []);

    return {
        ...state,
        generateContextFile,
        checkBackend,
        clearError,
        reset,
    };
}