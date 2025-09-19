
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition, ChangeEvent } from 'react';
import { getUserData, saveUserKaggleCreds, updateUserInterests } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileUp } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';

const kaggleFormSchema = z.object({
  kaggleUsername: z.string().min(1, 'Kaggle username is required.'),
  kaggleKey: z.string().min(1, 'Kaggle API key is required.'),
});

const interestCategories = {
    "Problem Types": ["Classification", "Regression", "NLP", "Computer Vision", "Time Series", "Tabular"],
    "Domains": ["Healthcare", "Finance", "E-commerce", "Social Media", "Cybersecurity"],
    "Special Topics": ["Fairness/Ethics", "Data Visualization", "Model Interpretability"],
};

const allInterests = Object.values(interestCategories).flat();


type UserData = {
  interests?: string[];
  kaggleUsername?: string;
};

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, startTransition] = useTransition();

  const kaggleForm = useForm<z.infer<typeof kaggleFormSchema>>({
    resolver: zodResolver(kaggleFormSchema),
    defaultValues: {
      kaggleUsername: '',
      kaggleKey: '',
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/sign-in');
      return;
    }
    if (user) {
      setLoading(true);
      getUserData(user.uid)
        .then((data) => {
          const castedData = data as UserData | null;
          setUserData(castedData);
          kaggleForm.reset({
              kaggleUsername: castedData?.kaggleUsername || '',
              kaggleKey: '', // Always clear key field for security
          })
        })
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router, kaggleForm]);

  const handleInterestToggle = async (interest: string) => {
    if (!user) return;
    
    const originalInterests = userData?.interests || [];
    const isAdding = !originalInterests.includes(interest);
    const action = isAdding ? 'add' : 'remove';
    
    // Optimistic UI update
    const newInterests = isAdding
        ? [...originalInterests, interest]
        : originalInterests.filter(i => i !== interest);
    setUserData(prev => ({ ...prev, interests: newInterests } as UserData));

    try {
        await updateUserInterests(user.uid, interest, action);
        toast({ title: `Interest ${isAdding ? 'added' : 'removed'}!` });
    } catch (error: any) {
        // Revert UI on error
        setUserData(prev => ({ ...prev, interests: originalInterests } as UserData));
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleKaggleSave = (values: z.infer<typeof kaggleFormSchema>) => {
      if (!user) return;
      startTransition(async () => {
          try {
              await saveUserKaggleCreds({ uid: user.uid, ...values });
              setUserData(prev => ({...prev, kaggleUsername: values.kaggleUsername}) as UserData);
              kaggleForm.reset({ kaggleUsername: values.kaggleUsername, kaggleKey: '' });
              toast({ title: 'Success!', description: 'Kaggle credentials saved securely.' });
              router.refresh(); // This will re-fetch data on other pages
          } catch(error: any) {
              toast({ variant: 'destructive', title: 'Error saving credentials', description: error.message });
          }
      });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const credentials = JSON.parse(content);

        if (credentials.username && credentials.key) {
          handleKaggleSave({
            kaggleUsername: credentials.username,
            kaggleKey: credentials.key,
          });
        } else {
          throw new Error('Invalid kaggle.json format.');
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Invalid File',
          description: 'The selected file is not a valid kaggle.json file.',
        });
      }
    };
    reader.readAsText(file);
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <Skeleton className="h-12 w-1/3" />
        <Card>
            <CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader>
            <CardContent><Skeleton className="h-24 w-full" /></CardContent>
        </Card>
        <Card>
            <CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader>
            <CardContent><Skeleton className="h-48 w-full" /></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Interests</CardTitle>
          <CardDescription>
            Select your interests to personalize your recommendations and learning experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(interestCategories).map(([category, tags]) => (
            <div key={category}>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">{category}</h4>
                <div className="flex flex-wrap gap-2">
                    {tags.map(interest => (
                        <Badge
                            key={interest}
                            variant={userData?.interests?.includes(interest) ? "default" : "secondary"}
                            className="cursor-pointer text-sm hover:bg-primary/20 transition-colors"
                            onClick={() => handleInterestToggle(interest)}
                        >
                            {interest}
                        </Badge>
                    ))}
                </div>
            </div>
            ))}
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>Kaggle API Credentials</CardTitle>
          <CardDescription>
            The easiest way is to upload your `kaggle.json` file. You can download this from your Kaggle account page under the "API" section.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
              <Button asChild className="w-full sm:w-auto" variant="outline">
                <label htmlFor="kaggle-json-upload" className="cursor-pointer">
                  <FileUp className="mr-2" /> Upload kaggle.json
                </label>
              </Button>
              <Input
                id="kaggle-json-upload"
                type="file"
                className="hidden"
                accept=".json"
                onChange={handleFileChange}
                disabled={isSaving}
              />
            </div>
            
            <div className="flex items-center">
              <Separator className="flex-1" />
              <span className="px-4 text-sm text-muted-foreground">Or enter manually</span>
              <Separator className="flex-1" />
            </div>

            <Form {...kaggleForm}>
                <form onSubmit={kaggleForm.handleSubmit(handleKaggleSave)} className="space-y-4">
                     <FormField
                        control={kaggleForm.control}
                        name="kaggleUsername"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Kaggle Username</FormLabel>
                            <FormControl>
                                <Input placeholder="your_kaggle_username" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={kaggleForm.control}
                        name="kaggleKey"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Kaggle API Key</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="******************" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 size={16} className="animate-spin mr-2"/>}
                        {isSaving ? 'Saving...' : 'Save Credentials'}
                    </Button>
                </form>
            </Form>
        </CardContent>
      </Card>
    </div>
  );
}
