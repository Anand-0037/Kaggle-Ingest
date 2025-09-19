
'use client';

import { IngestCompetitionOutput } from '@/ai/flows/ingest-competition';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { FileText, Lightbulb, User, ExternalLink, Code2, NotebookText, Star } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Badge } from './ui/badge';

interface NotebookDeconstructorProps {
  deconstructedNotebooks: IngestCompetitionOutput['deconstructedNotebooks'];
}

const SignalIndicator = ({ signal }: { signal: string }) => {
    const signalStyles = {
        high: 'bg-green-500',
        medium: 'bg-yellow-500',
        low: 'bg-gray-500',
        boilerplate: 'bg-blue-500',
    };
    const color = signalStyles[signal as keyof typeof signalStyles] || 'bg-gray-400';
    return (
        <div className="flex items-center gap-1.5" title={`Signal: ${signal}`}>
            <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
            <span className="text-xs font-medium capitalize">{signal}</span>
        </div>
    );
};


export function NotebookDeconstructor({ deconstructedNotebooks }: NotebookDeconstructorProps) {
  if (!Array.isArray(deconstructedNotebooks) || deconstructedNotebooks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Notebook Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Notebooks Found</AlertTitle>
            <AlertDescription>
                The AI was unable to find or deconstruct any public notebooks for this competition. This can sometimes happen with newer or more niche competitions. Please try re-analyzing later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const defaultTab = deconstructedNotebooks?.[0]?.title || 'none';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Learn from the Best: Top Notebook Analysis</CardTitle>
        <CardDescription>
          AI-generated insights and full code from the top-voted public notebooks for this competition.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 h-auto">
                {deconstructedNotebooks.map((notebook, index) => (
                    <TabsTrigger value={notebook.title} key={index} className="truncate" title={notebook.title}>
                        {notebook.title}
                    </TabsTrigger>
                ))}
            </TabsList>

            {deconstructedNotebooks.map((notebook, index) => (
                 <TabsContent value={notebook.title} key={index} className="mt-4">
                    <div className="p-4 border rounded-lg bg-muted/30">
                         <div className="flex justify-between items-center mb-4">
                             <div className="text-sm text-muted-foreground flex items-center gap-2">
                                <User size={14} /> by {notebook.author}
                             </div>
                             <Button asChild variant="outline" size="sm">
                                <Link href={notebook.url} target="_blank">
                                    View on Kaggle <ExternalLink className="ml-2" size={16} />
                                </Link>
                             </Button>
                         </div>
                         
                         <Accordion type="multiple" defaultValue={['cell-0', 'cell-1']} className="w-full space-y-2">
                             {notebook.cells.map((cell, cellIndex) => (
                                 <AccordionItem value={`cell-${cellIndex}`} key={cellIndex} className="border rounded-md bg-background transition-colors">
                                     <AccordionTrigger className="px-4 text-left hover:no-underline text-sm font-medium">
                                        <div className="flex justify-between items-center w-full">
                                            <div className="flex items-center gap-2">
                                                {cell.type === 'code' ? <Code2 className="text-primary"/> : <NotebookText className="text-blue-500" />}
                                                <span>{cell.type === 'code' ? 'Code Cell' : 'Markdown Cell'} #{cellIndex + 1}</span>
                                            </div>
                                             <SignalIndicator signal={cell.signal} />
                                        </div>
                                     </AccordionTrigger>
                                     <AccordionContent className="px-4 pt-0">
                                        <div className="border-t mt-2 pt-4">
                                             <div className="flex flex-wrap gap-2 mb-4">
                                                {cell.tags.map(tag => (
                                                    <Badge key={tag} variant="secondary">{tag}</Badge>
                                                ))}
                                             </div>
                                            {cell.type === 'code' ? (
                                                <SyntaxHighlighter language="python" style={atomDark} customStyle={{ margin: 0, borderRadius: '0.5rem' }}>
                                                    {cell.content}
                                                </SyntaxHighlighter>
                                            ) : (
                                                <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: cell.content.replace(/\n/g, '<br/>') }} />
                                            )}
                                        </div>
                                     </AccordionContent>
                                 </AccordionItem>
                             ))}
                         </Accordion>
                    </div>
                 </TabsContent>
            ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
