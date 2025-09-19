
import { Button } from '@/components/ui/button';
import { Bot, BarChart, Code, FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { DemoSection } from '@/app/components/DemoSection';


const features = [
  {
    icon: BarChart,
    title: 'Instant Dataset Analysis',
    description: 'Get automated quality checks, outlier detection, and feature engineering ideas.',
  },
  {
    icon: Code,
    title: 'Learn from Top Notebooks',
    description: 'Deconstruct winning strategies and code from Kaggle masters.',
  },
  {
    icon: FileText,
    title: 'Guided Learning Paths',
    description: 'Follow curated roadmaps to build skills, one competition at a time.',
  },
  {
    icon: Bot,
    title: 'AI Mentor Chat',
    description: 'Ask questions and get strategic advice about any competition.',
  },
];


export default function LandingPage() {
  return (
    <div className="bg-background text-foreground font-body">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center space-x-2">
            <Logo className="w-8 h-8" />
            <span className="font-bold text-lg">Kaggle Ingest</span>
          </Link>
          <div className="flex items-center space-x-4">
             <Button asChild>
                <Link href="/auth/sign-up">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 md:px-6 py-20 md:py-32 text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 font-headline">
            Stop Guessing. Start Winning.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Turn any Kaggle competition into a personalized learning path. Generate code insights, dataset analyses, and strategic guides with AI.
          </p>
           <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-transform hover:scale-105">
                  <Link href="/auth/sign-up">
                    Get Started Free <ChevronRight className="ml-2"/>
                  </Link>
               </Button>
               <Button asChild size="lg" variant="outline" className="shadow-md transition-transform hover:scale-105">
                  <Link href="#quick-demo">
                    Try the Live Demo
                  </Link>
               </Button>
           </div>
        </section>

        <section className="bg-muted py-20">
            <div className="container mx-auto px-4 md:px-6">
                <h2 className="text-3xl font-bold text-center mb-12 font-headline">A Smarter Way to Learn Machine Learning</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="flex flex-col items-start text-left p-4 rounded-lg border hover:bg-background/50 transition-colors">
                            <div className="p-3 rounded-full bg-primary/10 mb-4">
                                <feature.icon className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
        
        <section id="how-it-works" className="py-20">
            <div className="container mx-auto px-4 md:px-6">
                <h2 className="text-3xl font-bold text-center mb-16 font-headline">How It Works in 3 Easy Steps</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="flex flex-col items-center z-10 bg-card p-6 rounded-lg border border-border/50 shadow-sm hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4 border-4 border-background ring-4 ring-primary/10">
                           <span className="font-bold text-2xl">1</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Paste a URL or Upload a File</h3>
                        <p className="text-muted-foreground">Provide a Kaggle URL or upload your own dataset.</p>
                    </div>
                    <div className="flex flex-col items-center z-10 bg-card p-6 rounded-lg border border-border/50 shadow-sm hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4 border-4 border-background ring-4 ring-primary/10">
                             <span className="font-bold text-2xl">2</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
                        <p className="text-muted-foreground">Our AI engine analyzes notebooks, datasets, and key strategies.</p>
                    </div>
                    <div className="flex flex-col items-center z-10 bg-card p-6 rounded-lg border border-border/50 shadow-sm hover:shadow-lg transition-shadow">
                         <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4 border-4 border-background ring-4 ring-primary/10">
                            <span className="font-bold text-2xl">3</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Get Your Guide</h3>
                        <p className="text-muted-foreground">Receive a complete context file and an AI mentor to guide you.</p>
                    </div>
                </div>
            </div>
        </section>

        <DemoSection />

      </main>

      <footer className="border-t bg-muted">
        <div className="container mx-auto py-8 px-4 md:px-6 text-center text-muted-foreground text-sm">
            Kaggle Ingest - An AI-Powered Learning Assistant
        </div>
      </footer>
    </div>
  );
}
