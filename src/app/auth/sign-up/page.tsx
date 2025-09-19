
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveUserInterestsAction } from "../actions";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/logo";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Separator } from "@/components/ui/separator";

const interestCategories = {
    "Problem Types": ["Classification", "Regression", "NLP", "Computer Vision", "Time Series", "Tabular"],
    "Domains": ["Healthcare", "Finance", "E-commerce", "Social Media", "Cybersecurity"],
    "Special Topics": ["Fairness/Ethics", "Data Visualization", "Model Interpretability"],
};


export default function SignUpPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    
    const toggleInterest = (interest: string) => {
        setSelectedInterests(prev =>
            prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
        );
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        
        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const serverFormData = new FormData();
            serverFormData.append('uid', user.uid);
            serverFormData.append('interests', JSON.stringify(selectedInterests));

            const result = await saveUserInterestsAction(serverFormData);

            if (result.success) {
                toast({
                    title: "Success!",
                    description: "Your account has been created. Welcome aboard!",
                });
                router.push('/competitions');
            } else {
                 toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: result.error,
                });
            }

        } catch (error: any) {
             toast({
                variant: "destructive",
                title: "Sign Up Failed",
                description: error.message || "An unexpected error occurred.",
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
            <Card className="w-full max-w-2xl shadow-2xl border-border">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
                    <CardDescription>Join the community and accelerate your ML skills.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password (min. 6 characters)</Label>
                                <Input id="password" name="password" type="password" required minLength={6} />
                            </div>
                        </div>
                        
                        <Separator />

                        <div className="space-y-4">
                            <Label className="text-center md:text-left block">Tell us what you're interested in (optional):</Label>
                             {Object.entries(interestCategories).map(([category, tags]) => (
                                <div key={category}>
                                    <h4 className="text-sm font-medium mb-2 text-muted-foreground">{category}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map(interest => (
                                            <Badge
                                                key={interest}
                                                variant={selectedInterests.includes(interest) ? "default" : "secondary"}
                                                className="cursor-pointer text-sm hover:bg-primary/20 transition-colors"
                                                onClick={() => toggleInterest(interest)}
                                            >
                                                {interest}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                             ))}
                        </div>
                        
                        <Button type="submit" className="w-full !mt-8" disabled={loading}>
                            {loading ? <><Loader2 className="animate-spin mr-2" />Creating Account...</> : 'Sign Up and Start Learning'}
                        </Button>
                    </form>
                     <div className="mt-4 text-center text-sm">
                        Already have an account?{' '}
                        <Link href="/auth/sign-in" className="underline font-medium text-primary hover:text-primary/80">
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
