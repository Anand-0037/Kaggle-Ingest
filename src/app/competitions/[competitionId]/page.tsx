
'use client';

import React, { useEffect, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getCompetitionAnalysis, Competition } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NotebookDeconstructor } from '@/components/NotebookDeconstructor';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Bot, ArrowLeft } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { mentorChat } from '@/ai/flows/mentor-chat';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';

interface PageProps {
  params: { competitionId: string } | Promise<{ competitionId: string }>;
}

export default function CompetitionDetailsPage({ params }: PageProps) {
  const { user, loading: authLoading } = useAuth();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [competitionId, setCompetitionId] = useState<string | undefined>(undefined);

  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Handle both sync and async params for Next.js compatibility
  useEffect(() => {
    const getCompetitionId = async () => {
      const resolvedParams = await Promise.resolve(params);
      setCompetitionId(resolvedParams.competitionId);
    };

    getCompetitionId();
  }, [params]);

  useEffect(() => {
    if (authLoading || !competitionId) return;
    if (!user) {
      router.replace('/auth/sign-in');
      return;
    }

    async function fetchData() {
      setLoading(true);
      try {
        const analysis = await getCompetitionAnalysis(competitionId!);

        if (!analysis) {
          setCompetition(null);
        } else {
          setCompetition(analysis);
        }

      } catch (e: any) {
        setError(e.message || 'Failed to fetch competition details.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [competitionId, user, authLoading, router]);

  useEffect(() => {
    if (competition?.ingestionData?.summary) {
      setChatHistory([{
        role: 'model',
        content: `Hello! I'm your AI mentor for this competition. Feel free to ask me anything about the rules, data, or strategy. How can I help you get started?`
      }]);
    }
  }, [competition?.ingestionData]);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading || !competition?.ingestionData?.deconstructedNotebooks) return;

    const newHumanMessage = { role: 'user' as const, content: chatInput };
    setChatHistory(prev => [...prev, newHumanMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const notebookContext = competition.ingestionData.deconstructedNotebooks
        .map(nb => {
          const contentString = nb.cells.map(cell => `## ${cell.type.toUpperCase()} CELL\n\n${cell.content}`).join('\n\n');
          return `--- NOTEBOOK: ${nb.title} ---\nURL: ${nb.url}\n\n${contentString}`;
        }).join('\n\n');

      const fullContext = `Competition Summary:\n${competition.ingestionData.summary}\n\nNotebooks Context:\n${notebookContext}`;

      const response = await mentorChat({ question: chatInput, competitionContext: fullContext });

      const newAiMessage = { role: 'model' as const, content: response.answer };
      setChatHistory(prev => [...prev, newAiMessage]);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Mentor Chat Error",
        description: "The AI mentor is currently unavailable. Please try again later."
      });
      setChatHistory(prev => prev.slice(0, -1));
    } finally {
      setChatLoading(false);
    }
  }


  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        <div className="grid md:grid-cols-3 gap-8 pt-6">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="md:col-span-1">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!competition) {
    notFound();
  }

  if (!competition.ingestionData || competition.ingestionData.status !== 'complete') {
    return (
      <div className="container mx-auto py-8 text-center">
        <Alert className="max-w-xl mx-auto">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Analysis Not Ready</AlertTitle>
          <AlertDescription>
            This competition has not been successfully analyzed yet. Please go back to the competitions page to check the status.
          </AlertDescription>
          <Button asChild className="mt-4">
            <Link href="/competitions">
              <ArrowLeft className="mr-2" /> Go to Competitions
            </Link>
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">{competition.title || competitionId?.replace(/-/g, ' ') || 'Competition'}</h1>
        <p className="text-lg text-muted-foreground mt-2">
          {competition.ingestionData.summary}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left/Main column */}
        <div className="md:col-span-2 space-y-8">
          {competition.ingestionData.deconstructedNotebooks && (
            <NotebookDeconstructor
              deconstructedNotebooks={competition.ingestionData.deconstructedNotebooks}
            />
          )}
        </div>

        {/* Right column (Mentor Chat) */}
        <div className="md:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bot /> AI Mentor</CardTitle>
              <CardDescription>Ask questions about this competition.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="flex flex-col gap-4">
                  {chatHistory.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                      {msg.role === 'model' && <Bot className="w-6 h-6 flex-shrink-0 text-primary" />}
                      <div className={`rounded-lg px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <p>{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex items-start gap-3">
                      <Bot className="w-6 h-6 flex-shrink-0 text-primary" />
                      <div className="rounded-lg px-4 py-2 text-sm bg-muted flex items-center space-x-2">
                        <span>Thinking</span>
                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse delay-0"></div>
                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse delay-200"></div>
                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse delay-400"></div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <form onSubmit={handleChatSubmit} className="mt-4 flex gap-2">
                <Textarea
                  placeholder="Ask a follow-up question..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleChatSubmit(e);
                    }
                  }}
                  className="h-auto resize-none"
                  rows={1}
                />
                <Button type="submit" disabled={chatLoading || !chatInput.trim()}>Send</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
