
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { auth, isValidConfig } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/logo";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function SignInPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);

        // Check if Firebase is properly configured
        if (!isValidConfig || !auth) {
            toast({
                variant: "destructive",
                title: "Configuration Error",
                description: "Firebase is not properly configured. Please check your environment variables.",
            });
            setLoading(false);
            return;
        }

        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/competitions');
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Sign In Failed",
                description: "Invalid email or password. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
            <div className="absolute top-8 left-8">
                <Link href="/" className="flex items-center space-x-2 text-primary">
                    <Logo className="w-8 h-8" />
                    <span className="font-bold text-lg">Kaggle Ingest</span>
                </Link>
            </div>
            <Card className="w-full max-w-md shadow-2xl border-border">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-2xl font-bold">Welcome Back!</CardTitle>
                    <CardDescription>Sign in to continue your ML journey.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        <Button type="submit" className="w-full !mt-6" disabled={loading}>
                            {loading ? <><Loader2 className="animate-spin mr-2" /> Signing In...</> : 'Sign In'}
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        Don't have an account?{' '}
                        <Link href="/auth/sign-up" className="underline font-medium text-primary hover:text-primary/80">
                            Sign up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
