
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getUserData } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, GraduationCap, User, Volume2, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { tutorChat } from '@/ai/flows/tutor-chat';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';


export default function LearnPage() {
    const { user, loading: authLoading } = useAuth();
    const [userData, setUserData] = useState<{ interests?: string[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', content: string }[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);

    const [speakingMessageIndex, setSpeakingMessageIndex] = useState<number | null>(null);

    const { toast } = useToast();
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (authLoading) return;
        if (!user) return;

        async function fetchData() {
            setLoading(true);
            try {
                const data = await getUserData(user!.uid);
                setUserData(data || null);

                const interestsString = data?.interests?.join(', ') || 'general machine learning';
                setChatHistory([{
                    role: 'model',
                    content: `Hello! I'm KaggleBot, your personal AI tutor. I see you're interested in ${interestsString}. I'm here to help you learn about machine learning. What's on your mind today? Ask me about a concept, a library, or for a project idea!`
                }]);

            } catch (e: any) {
                setError(e.message || 'Failed to fetch user data.');
                console.error(e);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [user, authLoading]);

    useEffect(() => {
        // Auto-scroll to bottom of chat
        const viewport = scrollAreaRef.current?.querySelector('div');
        if (viewport) {
            viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
        }
    }, [chatHistory]);

    const handleListen = (text: string, index: number) => {
        if (!('speechSynthesis' in window)) {
            toast({ variant: 'destructive', title: 'Your browser does not support Text-to-Speech.' });
            return;
        }

        // If this message is already speaking, stop it
        if (speakingMessageIndex === index) {
            window.speechSynthesis.cancel();
            setSpeakingMessageIndex(null);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => setSpeakingMessageIndex(index);
        utterance.onend = () => setSpeakingMessageIndex(null);
        utterance.onerror = () => setSpeakingMessageIndex(null);

        window.speechSynthesis.cancel(); // Stop any currently playing speech
        window.speechSynthesis.speak(utterance);
    };

    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || chatLoading) return;

        const newHumanMessage = { role: 'user' as const, content: chatInput };
        const currentChatHistory = [...chatHistory, newHumanMessage];
        setChatHistory(currentChatHistory);
        const question = chatInput;
        setChatInput('');
        setChatLoading(true);

        try {
            const response = await tutorChat({
                question: question,
                userInterests: userData?.interests || [],
                // Pass the history *before* the user's latest question
                chatHistory: chatHistory
            });

            const newAiMessage = { role: 'model' as const, content: response.answer };
            setChatHistory(prev => [...prev, newAiMessage]);

        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Tutor Chat Error",
                description: "The AI tutor is currently unavailable. Please try again later."
            });
            // Remove the user's message if the bot fails
            setChatHistory(prev => prev.slice(0, -1));
        } finally {
            setChatLoading(false);
        }
    }


    if (authLoading || loading) {
        return (
            <div className="container mx-auto py-8">
                <div className="h-full w-full max-w-2xl mx-auto space-y-4">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-96 w-full" />
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

    return (
        <div className="container mx-auto h-[calc(100vh-8rem)] flex flex-col">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold tracking-tight">Your AI Tutor</h1>
                <p className="text-lg text-muted-foreground mt-2">
                    Ask questions, explore concepts, and get personalized guidance on your ML journey.
                </p>
            </div>

            <Card className="flex-1 flex flex-col w-full max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><GraduationCap /> Chat with KaggleBot</CardTitle>
                    <CardDescription>Your conversation is not yet saved, but we're working on it!</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
                    <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
                        <div className="flex flex-col gap-4">
                            {chatHistory.map((msg, index) => (
                                <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                    {msg.role === 'model' && <GraduationCap className="w-8 h-8 flex-shrink-0 text-primary" />}
                                    <div className={`relative group rounded-lg px-4 py-2 text-sm max-w-[85%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                        {msg.role === 'model' && (
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="absolute -right-12 top-0 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleListen(msg.content, index)}
                                            >
                                                {speakingMessageIndex === index ? <Loader2 className="animate-spin" /> : <Volume2 />}
                                            </Button>
                                        )}
                                    </div>
                                    {msg.role === 'user' && <User className="w-8 h-8 flex-shrink-0 rounded-full border p-1" />}
                                </div>
                            ))}
                            {chatLoading && (
                                <div className="flex items-start gap-3">
                                    <GraduationCap className="w-8 h-8 flex-shrink-0 text-primary" />
                                    <div className="rounded-lg px-4 py-2 text-sm bg-muted flex items-center space-x-2">
                                        <span>KaggleBot is thinking</span>
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
                            placeholder="Ask something like 'What is a neural network?'"
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
    );
}
