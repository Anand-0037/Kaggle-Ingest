

'use client';

import { useEffect, useState, useTransition, useCallback, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, Bot, Loader2, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import {
  triggerGlobalCompetitionRefresh,
  generateContextFileAction,
  getUserKaggleCreds,
  getCachedCompetitions,
  type Competition,
  handleCustomCompetitionAnalysis,
  resetStuckCompetitionsAction
} from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const ALL_TAGS = ["Classification", "Regression", "NLP", "Computer Vision", "Time Series", "Tabular", "Beginner", "Advanced"];

export default function CompetitionsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [isRefreshing, startGlobalRefresh] = useTransition();
  const [isResetting, startReset] = useTransition();
  const [allCompetitions, setAllCompetitions] = useState<Competition[]>([]);
  const [filteredCompetitions, setFilteredCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [credsExist, setCredsExist] = useState<boolean | undefined>(undefined);

  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // A map to track which specific competition is being analyzed
  const [analyzingMap, setAnalyzingMap] = useState<Record<string, boolean>>({});

  // Ref to track competitions without causing re-renders in useEffect
  const competitionsRef = useRef<Competition[]>([]);

  const fetchAndSetCompetitions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const comps = await getCachedCompetitions();
      if (comps && comps.length > 0) {
        setAllCompetitions(comps);
        competitionsRef.current = comps;
      } else {
        // If no cached competitions, trigger a fresh fetch
        try {
          const freshComps = await triggerGlobalCompetitionRefresh(user.uid);
          setAllCompetitions(freshComps);
          competitionsRef.current = freshComps;
        } catch (refreshError: any) {
          toast({ variant: "destructive", title: "Failed to fetch competitions", description: refreshError.message });
        }
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error fetching competitions", description: e.message });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const handleGlobalRefresh = useCallback((isInitial = false) => {
    if (!user) return;
    startGlobalRefresh(() => {
      if (!isInitial) {
        toast({ title: "Refreshing Competition List", description: "Fetching the latest from Kaggle..." });
      }
      triggerGlobalCompetitionRefresh(user.uid)
        .then((freshComps) => {
          setAllCompetitions(freshComps);
          competitionsRef.current = freshComps;
          if (!isInitial) {
            toast({ title: "Success", description: "Competition list has been updated." });
          }
        })
        .catch((error: any) => {
          toast({ variant: "destructive", title: "Refresh Failed", description: error.message });
        });
    });
  }, [user, toast]);

  // Main data fetching and subscription effect
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/auth/sign-in');
      return;
    }

    const initialize = async () => {
      setLoading(true);
      try {
        const creds = await getUserKaggleCreds(user.uid);
        setCredsExist(!!creds);

        if (creds) {
          await fetchAndSetCompetitions();
        }
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Failed to load data',
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [user, authLoading, router, toast, fetchAndSetCompetitions, credsExist]);

  // Separate effect for auto-refresh functionality
  useEffect(() => {
    if (!user || !credsExist) return;

    // Disabled auto-refresh for now to prevent continuous loops
    // TODO: Re-enable with proper debouncing if needed
    /*
    // Set up auto-refresh every 30 seconds for pending/processing competitions
    const intervalId = setInterval(() => {
      const hasActiveAnalyses = competitionsRef.current.some(comp =>
        comp.ingestionData?.status === 'processing' || comp.ingestionData?.status === 'pending'
      );

      if (hasActiveAnalyses) {
        fetchAndSetCompetitions();
      }
    }, 30000);

    return () => clearInterval(intervalId);
    */
  }, [user, credsExist, fetchAndSetCompetitions]);


  // Effect to filter competitions whenever the source or filter changes
  useEffect(() => {
    const sortedCompetitions = [...allCompetitions].sort((a, b) => {
      const aDate = new Date(a.lastUpdated || 0).getTime();
      const bDate = new Date(b.lastUpdated || 0).getTime();
      return bDate - aDate;
    });

    if (!activeFilter) {
      setFilteredCompetitions(sortedCompetitions);
    } else {
      setFilteredCompetitions(
        sortedCompetitions.filter(comp => Array.isArray(comp.tags) && comp.tags.includes(activeFilter))
      );
    }
  }, [allCompetitions, activeFilter]);

  const handleGenerateAndDownload = (competitionToAnalyze: Competition) => {
    if (!user) return;

    setAnalyzingMap(prev => ({ ...prev, [competitionToAnalyze.id]: true }));

    toast({ title: "Analysis Started", description: `Fetching notebooks for "${competitionToAnalyze.title}". This may take a few minutes.` });

    generateContextFileAction(competitionToAnalyze).then((analysisResult) => {
      const blob = new Blob([analysisResult.contextFileContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${competitionToAnalyze.id}_context.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({ title: "Download Ready", description: `Context file for "${competitionToAnalyze.title}" has been generated.` });

    }).catch((err) => {
      toast({ variant: 'destructive', title: 'Analysis Failed', description: err.message });
    }).finally(() => {
      setAnalyzingMap(prev => ({ ...prev, [competitionToAnalyze.id]: false }));
    });
  };

  const handleStartAnalysis = (competitionId: string, competitionUrl: string) => {
    if (!user) return;
    setAnalyzingMap(prev => ({ ...prev, [competitionId]: true }));
    toast({ title: "Analysis Queued", description: "The AI is starting its work. Check the details page for progress." });
    handleCustomCompetitionAnalysis(user.uid, competitionUrl)
      .then(() => {
        // Refresh the competitions list to get updated status
        setTimeout(() => {
          fetchAndSetCompetitions();
        }, 2000);
      })
      .catch(err => {
        toast({ variant: 'destructive', title: 'Failed to start analysis', description: err.message });
        setAnalyzingMap(prev => ({ ...prev, [competitionId]: false }));
      });
  };

  const handleRetryAnalysis = (competitionId: string, competitionUrl: string) => {
    if (!user) return;
    toast({ title: "Retrying Analysis", description: "Starting fresh analysis for this competition." });
    handleStartAnalysis(competitionId, competitionUrl);
  };

  const handleResetStuckCompetitions = () => {
    if (!user) return;
    startReset(() => {
      resetStuckCompetitionsAction(user.uid)
        .then((resetCount) => {
          if (resetCount > 0) {
            toast({ title: "Reset Complete", description: `Reset ${resetCount} stuck competitions. They can now be retried.` });
            fetchAndSetCompetitions(); // Refresh the list
          } else {
            toast({ title: "No Stuck Competitions", description: "No competitions were found that needed resetting." });
          }
        })
        .catch((error: any) => {
          toast({ variant: "destructive", title: "Reset Failed", description: error.message });
        });
    });
  };


  if (authLoading || credsExist === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="flex flex-wrap gap-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-24" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
        </div>
      </div>
    );
  }

  if (!credsExist) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <Alert className="max-w-xl">
          <AlertTriangle />
          <AlertTitle>Kaggle API Credentials Required</AlertTitle>
          <AlertDescription>
            Please set your Kaggle username and API key in settings to view and analyze competitions. You can get your key from your Kaggle account page.
            <Button asChild className="mt-4 w-full">
              <Link href="/settings">Go to Settings</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Kaggle Competitions</h1>
        <div className="flex gap-2">
          <Button onClick={() => handleGlobalRefresh(false)} disabled={isRefreshing} variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh List'}
          </Button>
          <Button onClick={handleResetStuckCompetitions} disabled={isResetting} variant="outline">
            <AlertTriangle className={`mr-2 h-4 w-4 ${isResetting ? 'animate-spin' : ''}`} />
            {isResetting ? 'Resetting...' : 'Reset Stuck'}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant={activeFilter === null ? 'default' : 'outline'} onClick={() => setActiveFilter(null)}>All</Button>
        {ALL_TAGS.map(tag => (
          <Button key={tag} variant={activeFilter === tag ? 'default' : 'outline'} onClick={() => setActiveFilter(tag)}>
            {tag}
          </Button>
        ))}
      </div>

      {loading && !allCompetitions.length && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-72 w-full" />)}
        </div>
      )}

      {!loading && filteredCompetitions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No competitions found for this filter.</p>
          <p className="text-sm text-muted-foreground mt-2">Try selecting another filter or refreshing the list.</p>
        </div>
      )}

      {!loading && filteredCompetitions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompetitions.map((comp) => {
            const isAnalyzing = analyzingMap[comp.id];
            const ingestionStatus = comp.ingestionData?.status;

            return (
              <Card key={comp.id} className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="font-bold text-base h-10" title={comp.title}>{comp.title}</CardTitle>
                    <a href={comp.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"><ExternalLink size={18} /></a>
                  </div>
                  <CardDescription>{comp.prize ? `${comp.prize}` : 'Knowledge Prize'}</CardDescription>
                  <div className="flex flex-wrap gap-1 pt-2">
                    {Array.isArray(comp.tags) && comp.tags.slice(0, 5).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  {ingestionStatus === 'complete' ? (
                    <p className="text-sm text-green-600">Analysis complete. View details.</p>
                  ) : ingestionStatus === 'processing' ? (
                    <p className="text-sm text-blue-600">AI analysis is in progress...</p>
                  ) : ingestionStatus === 'pending' ? (
                    <p className="text-sm text-yellow-600">Analysis is pending...</p>
                  ) : ingestionStatus === 'failed' ? (
                    <p className="text-sm text-red-600">Analysis failed. Please try again.</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">No analysis found for this competition.</p>
                  )}
                </CardContent>
                <CardFooter className="bg-muted/50 p-4 mt-auto">
                  {ingestionStatus === 'complete' ? (
                    <Button asChild className="w-full">
                      <Link href={`/competitions/${comp.id}`}>View Details</Link>
                    </Button>
                  ) : ingestionStatus === 'failed' ? (
                    <Button onClick={() => handleRetryAnalysis(comp.id.toString(), comp.url)} disabled={isAnalyzing} className="w-full" variant="outline">
                      {isAnalyzing ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Retrying...</>
                      ) : (
                        <><Bot className="mr-2 h-4 w-4" /> Start AI Analysis</>
                      )}
                    </Button>
                  ) : (
                    <Button onClick={() => handleStartAnalysis(comp.id.toString(), comp.url)} disabled={isAnalyzing || ingestionStatus === 'processing' || ingestionStatus === 'pending'} className="w-full">
                      {isAnalyzing || ingestionStatus === 'processing' || ingestionStatus === 'pending' ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                      ) : (
                        <><Bot className="mr-2 h-4 w-4" /> Start AI Analysis</>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  );
}
