'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { handleCustomCompetitionAnalysis } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, PlusCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ContextFileGenerator } from '@/components/ContextFileGenerator';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const [isAnalyzingCustom, startCustomAnalysis] = useTransition();
  const [customUrl, setCustomUrl] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/sign-in');
      return;
    }

    if (user) {
      setLoading(false);
    }
  }, [user, authLoading, router]);

  const handleCustomIngest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !customUrl) return;

    const kaggleUrlRegex = /^https:\/\/www\.kaggle\.com\/(c|competitions)\/[a-zA-Z0-9-]+(\/.*)?$/;
    if (!kaggleUrlRegex.test(customUrl)) {
      toast({
        variant: "destructive",
        title: "Invalid URL",
        description: "Please enter a valid Kaggle competition URL, e.g., https://www.kaggle.com/c/titanic"
      });
      return;
    }

    startCustomAnalysis(() => {
      toast({ title: "Custom Analysis Submitted", description: "Your new competition will appear on the Competitions page and start analyzing." });
      handleCustomCompetitionAnalysis(user.uid, customUrl)
        .then(() => {
          setCustomUrl('');
          router.push('/competitions');
        })
        .catch((err: any) => {
          toast({ variant: "destructive", title: "Submission Failed", description: err.message });
        });
    });
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Your Dashboard</h1>

      {/* Context File Generator */}
      <ContextFileGenerator />

      <Card>
        <CardHeader>
          <CardTitle>Analyze a New Competition</CardTitle>
          <CardDescription>Paste any public Kaggle competition URL to analyze and add it to the list.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCustomIngest} className="flex flex-col sm:flex-row items-start gap-4">
            <Input
              placeholder="https://www.kaggle.com/competitions/your-competition-name"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              disabled={isAnalyzingCustom}
            />
            <Button type="submit" disabled={isAnalyzingCustom || !customUrl} className="w-full sm:w-auto">
              {isAnalyzingCustom ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : <><PlusCircle className="mr-2 h-4 w-4" /> Analyze URL</>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
