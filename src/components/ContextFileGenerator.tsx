"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, AlertCircle, CheckCircle, Server } from 'lucide-react';
import { useContextFileGenerator } from '@/hooks/use-context-file-generator';
import { BACKEND_CONFIG } from '@/lib/fastapi-backend';

interface ContextFileGeneratorProps {
    className?: string;
}

export function ContextFileGenerator({ className }: ContextFileGeneratorProps) {
    const [competitionUrl, setCompetitionUrl] = useState('');
    const {
        isLoading,
        isGenerating,
        error,
        isBackendAvailable,
        lastGenerated,
        generateContextFile,
        checkBackend,
        clearError,
    } = useContextFileGenerator();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!competitionUrl.trim()) return;

        await generateContextFile(competitionUrl.trim());
    };

    const handleCheckBackend = async () => {
        await checkBackend();
    };

    const getBackendStatus = () => {
        if (isBackendAvailable === null) {
            return { text: 'Unknown', variant: 'secondary' as const, icon: Server };
        }
        if (isBackendAvailable) {
            return { text: 'Available', variant: 'default' as const, icon: CheckCircle };
        }
        return { text: 'Unavailable', variant: 'destructive' as const, icon: AlertCircle };
    };

    const backendStatus = getBackendStatus();
    const StatusIcon = backendStatus.icon;

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Context File Generator
                </CardTitle>
                <CardDescription>
                    Generate and download context files for Kaggle competitions using our FastAPI backend
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Backend Status */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                        <StatusIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">Backend Status:</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={backendStatus.variant}>
                            {backendStatus.text}
                        </Badge>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCheckBackend}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                'Check'
                            )}
                        </Button>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between">
                            <span>{error}</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearError}
                                className="h-auto p-1"
                            >
                                ×
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Success Message */}
                {lastGenerated && !error && (
                    <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                            Context file successfully generated and downloaded for: {lastGenerated}
                        </AlertDescription>
                    </Alert>
                )}

                {/* URL Input Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <Input
                            type="url"
                            placeholder="https://www.kaggle.com/competitions/titanic"
                            value={competitionUrl}
                            onChange={(e) => setCompetitionUrl(e.target.value)}
                            disabled={isGenerating}
                            className="w-full"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Enter a Kaggle competition URL to generate its context file
                        </p>
                    </div>

                    <Button
                        type="submit"
                        disabled={isGenerating || !competitionUrl.trim() || isBackendAvailable === false}
                        className="w-full"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating Context File...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" />
                                Generate & Download Context File
                            </>
                        )}
                    </Button>
                </form>

                {/* Instructions */}
                <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted rounded-lg">
                    <p className="font-medium">Instructions:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Ensure the FastAPI backend is running on {BACKEND_CONFIG.baseUrl}</li>
                        <li>Backend must have Kaggle CLI configured with valid credentials</li>
                        <li>Enter a valid Kaggle competition URL</li>
                        <li>Click generate to download the merged notebook context file</li>
                    </ul>
                </div>

                {/* Example URLs */}
                <div className="text-xs text-muted-foreground">
                    <p className="font-medium mb-1">Example URLs:</p>
                    <div className="space-y-1">
                        <button
                            type="button"
                            className="text-blue-600 hover:underline block"
                            onClick={() => setCompetitionUrl('https://www.kaggle.com/competitions/titanic')}
                        >
                            https://www.kaggle.com/competitions/titanic
                        </button>
                        <button
                            type="button"
                            className="text-blue-600 hover:underline block"
                            onClick={() => setCompetitionUrl('https://www.kaggle.com/competitions/house-prices-advanced-regression-techniques')}
                        >
                            https://www.kaggle.com/competitions/house-prices-advanced-regression-techniques
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}