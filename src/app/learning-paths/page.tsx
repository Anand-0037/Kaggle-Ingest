
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { learningPaths } from '@/lib/learning-paths-data';


export default function LearningPathsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Learning Paths</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Guided tracks to help you master machine learning, one competition at a time.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {learningPaths.map((path) => (
          <Card key={path.id} className="flex flex-col hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-bold">{path.title}</CardTitle>
              <CardDescription className="pt-2">{path.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col justify-between flex-grow">
              <div>
                <h4 className="font-semibold text-sm mb-2">Skills you'll learn:</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {path.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
              <Button asChild className="mt-6 w-full">
                <Link href={`/learning-paths/${path.id}`}>
                    Start Learning <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
