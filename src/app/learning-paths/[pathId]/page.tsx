'use client';

import { learningPaths } from '@/lib/learning-paths-data';
import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, CheckCircle, ChevronRight, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';

// Define a type for the path for better type-safety
type LearningPath = typeof learningPaths[0];

interface PageProps {
  params: { pathId: string } | Promise<{ pathId: string }>;
}

export default function LearningPathDetailsPage({ params }: PageProps) {
  const [path, setPath] = useState<LearningPath | undefined>(undefined);
  const [pathId, setPathId] = useState<string | undefined>(undefined);

  // Handle both sync and async params for Next.js compatibility
  useEffect(() => {
    const getPathId = async () => {
      const resolvedParams = await Promise.resolve(params);
      setPathId(resolvedParams.pathId);
    };

    getPathId();
  }, [params]);

  // The params object can be unstable on initial render in some Next.js versions.
  // Using useEffect ensures we safely handle it after the component mounts.
  useEffect(() => {
    if (!pathId) return;

    const foundPath = learningPaths.find(p => p.id === pathId);
    if (foundPath) {
      setPath(foundPath);
    } else {
      notFound();
    }
  }, [pathId]);  // Render a loading state or null while the path is being determined.
  if (!path) {
    return null; // Or a loading skeleton
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight">{path.title}</h1>
        <p className="text-lg text-muted-foreground mt-2">{path.description}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {path.tags.map(tag => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Your Roadmap</h2>
        <div className="relative border-l-2 border-primary/20 pl-6 space-y-10">
          {path.roadmap.map((step, index) => (
            <div key={step.step} className="relative">
              <div className="absolute -left-[34px] top-1.5 h-4 w-4 rounded-full bg-primary" />
              <p className="text-sm font-semibold text-primary">Step {step.step}</p>
              <h3 className="text-xl font-bold mt-1">{step.title}</h3>

              <Card className="mt-4 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2"><Trophy size={20} /> Recommended Competition</CardTitle>
                    <CardDescription className="pt-2">{step.competitionName}</CardDescription>
                  </div>
                  <Button asChild variant="outline">
                    <Link href={`/competitions?id=${step.competitionId}`}>
                      Go to Competition <ChevronRight className="ml-2" />
                    </Link>
                  </Button>
                </CardHeader>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
