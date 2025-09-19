
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Download, RefreshCw, Loader2, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { IngestCompetitionOutput, ingestCompetition } from '@/ai/flows/ingest-competition';
import { getDemoCompetition, saveDemoCompetition } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const competitions = [
  {
    id: 'titanic',
    level: 'Beginner',
    title: 'Titanic: Machine Learning from Disaster',
    why: 'Perfect for ML starters—predict passenger survival!',
    description: 'Start here! Predict survival on the Titanic and get familiar with ML basics.',
    tags: ['classification', 'beginner', 'tabular'],
    url: 'https://www.kaggle.com/c/titanic',
  },
  {
    id: 'house-prices-advanced-regression-techniques',
    level: 'Intermediate',
    title: 'House Prices: Advanced Regression',
    why: 'Sharpen your feature engineering on real estate data!',
    description: 'Predict sales prices and practice feature engineering, RFs, and gradient boosting.',
    tags: ['regression', 'feature engineering'],
    url: 'https://www.kaggle.com/c/house-prices-advanced-regression-techniques',
  },
  {
    id: 'digit-recognizer',
    level: 'Beginner',
    title: 'Digit Recognizer',
    why: 'The "Hello, World!" of computer vision.',
    description: 'Learn computer vision fundamentals with the famous MNIST data',
    tags: ['computer vision', 'classification'],
    url: 'https://www.kaggle.com/c/digit-recognizer',
  },
];

type DemoState = 'idle' | 'loading' | 'complete' | 'error';

interface DemoStatus {
    state: DemoState;
    result: IngestCompetitionOutput | null;
}

// A server action to handle demo generation
async function generateDemoAction(competitionUrl: string): Promise<IngestCompetitionOutput> {
    const result = await ingestCompetition({
        competitionUrl: competitionUrl,
        // No creds needed, will use env vars on server
    });
    return result;
}

export function DemoSection() {
    const [demoStates, setDemoStates] = useState<Record<string, DemoStatus>>(
        competitions.reduce((acc, comp) => {
          acc[comp.id] = { state: 'idle', result: null };
          return acc;
        }, {} as Record<string, DemoStatus>)
    );
    const { toast } = useToast();

    // This component no longer caches results in Firestore, as it's a demo.
    
    const handleGenerateDemo = async (competitionId: string, competitionUrl: string) => {
        if (demoStates[competitionId]?.state === 'loading') return;

        setDemoStates(prev => ({
            ...prev,
            [competitionId]: { state: 'loading', result: null }
        }));

        try {
            const result = await generateDemoAction(competitionUrl);
            
            if (result) {
                setDemoStates(prev => ({
                    ...prev,
                    [competitionId]: { state: 'complete', result: result }
                }));
                toast({
                    title: 'Analysis Ready!',
                    description: `Context for ${competitionId} is ready for download.`,
                });
            } else {
                 setDemoStates(prev => ({
                    ...prev,
                    [competitionId]: { state: 'error', result: null }
                }));
            }
        } catch (error: any) {
            console.error("Demo generation error:", error);
            setDemoStates(prev => ({
                ...prev,
                [competitionId]: { state: 'error', result: null }
            }));
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not generate demo analysis. The Kaggle API might be rate-limiting requests. Please try again later.'
            })
        }
    };

    const handleDownloadContext = (result: IngestCompetitionOutput, filename: string) => {
        const content = `Competition Summary:\n${result.summary}\n\n====================\n\n` +
            result.deconstructedNotebooks.map(nb => {
                const cellContent = nb.cells.map(cell => `## ${cell.type.toUpperCase()} CELL (Signal: ${cell.signal})\nTags: [${cell.tags.join(', ')}]\n\n${cell.content}`).join('\n\n---\n\n');
                return `--- NOTEBOOK: ${nb.title} ---\nAuthor: ${nb.author}\nURL: ${nb.url}\n\n${cellContent}`;
            }).join('\n\n====================\n\n');
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}_context.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <section id="quick-demo" className="mb-20 scroll-mt-20 bg-muted py-20">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-10 font-headline">Try the Quick Demo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {competitions.map((comp) => {
                const demoStatus = demoStates[comp.id];
                return (
                  <Card key={comp.id} className="flex flex-col bg-card hover:shadow-xl transition-all duration-300 rounded-lg overflow-hidden hover:-translate-y-1 border">
                    <CardHeader className="pb-4">
                      <Badge variant="secondary" className="font-medium w-fit mb-2">{comp.level}</Badge>
                      <CardTitle className="text-lg font-bold">{comp.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-between">
                      {demoStatus.state === 'complete' && demoStatus.result ? (
                           <div className="text-sm text-muted-foreground mb-4">
                              <p className="font-semibold text-foreground mb-2">Analysis Complete:</p>
                              <p className="line-clamp-3">{demoStatus.result.summary}</p>
                           </div>
                      ) : demoStatus.state === 'loading' ? (
                          <div className="space-y-2 mb-4">
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-2/3" />
                          </div>
                      ) : demoStatus.state === 'error' ? (
                          <Alert variant="destructive" className="mb-4">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertTitle>Analysis Failed</AlertTitle>
                              <AlertDescription className="text-xs">
                                 The analysis could not be generated. Please try again later.
                              </AlertDescription>
                          </Alert>
                      ) : (
                          <>
                              <p className="text-muted-foreground mb-4 text-sm">"{comp.why}"</p>
                              <div className="flex flex-wrap gap-2">
                              {comp.tags.map((tag) => (
                                  <Badge key={tag} variant="outline">{tag}</Badge>
                              ))}
                              </div>
                          </>
                      )}
                    </CardContent>
                    <CardFooter className="bg-muted/50 p-4 mt-auto">
                    {demoStatus.state === 'complete' && demoStatus.result ? (
                          <Button
                              className="w-full"
                              onClick={() => handleDownloadContext(demoStatus.result!, comp.id)}
                          >
                              <Download className="mr-2" />
                              Download context.txt
                          </Button>
                      ) : (
                          <Button 
                              className="w-full"
                              onClick={() => handleGenerateDemo(comp.id, comp.url)}
                              disabled={demoStatus.state === 'loading' || demoStatus.state === 'error'}
                          >
                          {demoStatus.state === 'loading' ? (
                              <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Generating...
                              </>
                          ) : (
                              'Get Free Analysis'
                          )}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
    )
}
