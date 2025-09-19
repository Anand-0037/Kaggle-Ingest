
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const resources = [
    {
        title: 'TensorFlow',
        description: 'An end-to-end open source platform for machine learning. It has a comprehensive, flexible ecosystem of tools, libraries, and community resources.',
        url: 'https://www.tensorflow.org/',
        tags: ['Deep Learning', 'Framework', 'Google'],
    },
    {
        title: 'PyTorch',
        description: 'An open source machine learning framework that accelerates the path from research prototyping to production deployment.',
        url: 'https://pytorch.org/',
        tags: ['Deep Learning', 'Framework', 'Facebook'],
    },
    {
        title: 'Scikit-learn',
        description: 'Simple and efficient tools for predictive data analysis, accessible to everybody, and reusable in various contexts.',
        url: 'https://scikit-learn.org/',
        tags: ['Machine Learning', 'Python', 'Classic ML'],
    },
    {
        title: 'Keras',
        description: 'A deep learning API written in Python, running on top of the machine learning platform TensorFlow.',
        url: 'https://keras.io/',
        tags: ['Deep Learning', 'API', 'Python'],
    },
];

const genAIResources = [
    {
        title: 'Ollama',
        description: 'Run large language models, like Llama 2, locally on your own machine.',
        url: 'https://github.com/ollama/ollama',
        tags: ['LLM', 'Local', 'Open Source'],
    },
    {
        title: 'Hugging Face Transformers',
        description: 'The leading open-source library for state-of-the-art machine learning models, including LLMs.',
        url: 'https://huggingface.co/docs/transformers/index',
        tags: ['Transformers', 'Library', 'Python'],
    },
    {
        title: 'LangChain',
        description: 'A framework for developing applications powered by language models.',
        url: 'https://python.langchain.com/docs/introduction/',
        tags: ['LLM', 'Framework', 'Agents'],
    },
    {
        title: 'Google AI Studio',
        description: 'A browser-based IDE for prototyping with generative models using the Gemini API.',
        url: 'https://aistudio.google.com/app/prompts/new_chat',
        tags: ['Gemini', 'Prototyping', 'Google'],
    },
    {
        title: 'OpenAI Platform',
        description: 'Access GPT models for various applications through the OpenAI API.',
        url: 'https://platform.openai.com/docs/quickstart',
        tags: ['GPT', 'API', 'OpenAI'],
    },
    {
        title: 'Unsloth AI',
        description: 'Fine-tune LLMs 2-5x faster and use 60-80% less memory with Unsloth.',
        url: 'https://docs.unsloth.ai/',
        tags: ['Fine-tuning', 'Optimization', 'LLM'],
    },
    {
        title: 'Mistral AI',
        description: 'A European company creating open and portable generative AI models.',
        url: 'https://mistral.ai/',
        tags: ['Models', 'Open Source', 'Europe'],
    },
    {
        title: 'Cohere',
        description: 'An enterprise AI platform focused on building NLP applications.',
        url: 'https://dashboard.cohere.com/',
        tags: ['Enterprise', 'NLP', 'API'],
    }
];

const learningResources = [
    {
        title: 'roadmap.sh',
        description: 'Community-driven roadmaps, guides, and other educational content for developers.',
        url: 'https://roadmap.sh/ai-data-scientist',
        tags: ['Roadmap', 'Career', 'Data Science'],
    },
    {
        title: 'DeepLearning.AI',
        description: 'Offers courses and specializations in AI, founded by Andrew Ng.',
        url: 'https://www.deeplearning.ai/',
        tags: ['Courses', 'Deep Learning', 'Andrew Ng'],
    },
    {
        title: 'Machine Learning Mastery',
        description: 'A comprehensive blog and resource hub for mastering machine learning.',
        url: 'https://machinelearningmastery.com/',
        tags: ['Tutorials', 'Blog', 'Education'],
    },
    {
        title: 'freeCodeCamp',
        description: 'A non-profit organization that consists of an interactive learning web platform, an online community forum, chat rooms, online publications and local organizations that intend to make learning web development accessible to anyone.',
        url: 'https://www.freecodecamp.org/news',
        tags: ['Free', 'Courses', 'Community'],
    },
    {
        title: 'NPTEL',
        description: 'A project of seven Indian Institutes of Technology (IITs) and Indian Institute of Science (IISc) for creating video and web course contents in engineering and science.',
        url: 'https://nptel.ac.in/courses/106106158',
        tags: ['Courses', 'University', 'India'],
    },
    {
        title: 'Papers with Code',
        description: 'The free and open resource for machine learning papers, code, datasets, methods and evaluation tables.',
        url: 'https://paperswithcode.com/',
        tags: ['Research', 'Papers', 'Community'],
    },
];

const devToolsPlatforms = [
    {
        title: 'Google Vertex AI',
        description: 'A unified AI platform that helps you build, deploy, and scale ML models faster.',
        url: 'https://cloud.google.com/vertex-ai',
        tags: ['GCP', 'MLOps', 'Platform'],
    },
    {
        title: 'Amazon SageMaker',
        description: 'A fully managed service to build, train, and deploy machine learning models at scale.',
        url: 'https://aws.amazon.com/machine-learning/sagemaker/',
        tags: ['AWS', 'Cloud', 'MLOps'],
    },
    {
        title: 'Azure Machine Learning',
        description: 'A cloud-based environment you can use to train, deploy, automate, and manage machine learning models.',
        url: 'https://azure.microsoft.com/en-us/products/machine-learning/',
        tags: ['Azure', 'Cloud', 'MLOps'],
    },
    {
        title: 'Weights & Biases',
        description: 'The AI developer platform for building better models faster.',
        url: 'https://wandb.ai/site/',
        tags: ['MLOps', 'Tracking', 'Visualization'],
    },
    {
        title: 'Sagentic',
        description: 'Deploy, manage, and scale your AI models with ease.',
        url: 'https://sagentic.ai/',
        tags: ['Deployment', 'MLOps', 'Startup'],
    },
    {
        title: 'Google Colab',
        description: 'Free, browser-based Jupyter notebook environment that runs in the cloud and provides access to GPUs.',
        url: 'https://colab.research.google.com/',
        tags: ['Notebook', 'Cloud', 'Free GPU'],
    },
    {
        title: 'AutoGPT',
        description: 'An experimental open-source attempt to make GPT-4 fully autonomous.',
        url: 'https://github.com/Significant-Gravitas/AutoGPT',
        tags: ['Autonomous Agents', 'GPT-4', 'Open Source'],
    },
    {
        title: 'IBM Watson',
        description: 'IBM\'s suite of enterprise-ready AI services, applications, and tooling.',
        url: 'https://www.ibm.com/watson',
        tags: ['Enterprise', 'IBM', 'Services'],
    }
];

const communityNews = [
    {
        title: 'Towards Data Science',
        description: 'A Medium publication sharing concepts, ideas, and codes in data science.',
        url: 'https://towardsdatascience.com/',
        tags: ['Blog', 'Medium', 'Data Science'],
    },
    {
        title: 'Hugging Face Blog',
        description: 'Stay up-to-date with the latest from the Hugging Face team and community.',
        url: 'https://huggingface.co/blog',
        tags: ['Blog', 'NLP', 'Community'],
    },
    {
        title: 'Kaggle',
        description: 'The world\'s largest data science community with powerful tools and resources to help you achieve your data science goals.',
        url: 'https://www.kaggle.com/',
        tags: ['Competitions', 'Community', 'Data Science'],
    },
    {
        title: 'r/MachineLearning',
        description: 'A large and active subreddit for machine learning news and discussions.',
        url: 'https://www.reddit.com/r/MachineLearning/',
        tags: ['Community', 'Forum', 'News'],
    }
];

const ResourceCard = ({ title, description, url, tags }: { title: string, description: string, url: string, tags: string[] }) => (
    <Card className="flex flex-col hover:shadow-lg transition-shadow">
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription className="flex-grow pt-2">{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col justify-between flex-grow">
            <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
            </div>
            <Link href={url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline">
                Visit Website &rarr;
            </Link>
        </CardContent>
    </Card>
);

export default function ResourcesPage() {
    return (
        <div className="container mx-auto py-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight">Helpful Resources</h1>
                <p className="text-lg text-muted-foreground mt-2">
                    A curated list of essential tools, libraries, and websites for ML practitioners.
                </p>
            </div>

            <div className="space-y-16">
                <div>
                    <h2 className="text-2xl font-bold mb-6">Popular Libraries & Frameworks</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {resources.map((resource) => (
                            <ResourceCard key={resource.title} {...resource} />
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-6">Generative AI & LLMs</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {genAIResources.map((resource) => (
                            <ResourceCard key={resource.title} {...resource} />
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-6">AI/ML Learning & Roadmaps</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {learningResources.map((resource) => (
                            <ResourceCard key={resource.title} {...resource} />
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-6">AI Development Tools & Platforms</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {devToolsPlatforms.map((resource) => (
                            <ResourceCard key={resource.title} {...resource} />
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-6">Community, News & Blogs</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {communityNews.map((resource) => (
                            <ResourceCard key={resource.title} {...resource} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
