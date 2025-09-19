
export const learningPaths = [
    {
      id: 'from-zero-to-hero-in-nlp',
      title: 'From Zero to Hero in NLP',
      description: 'A complete path from the basics of text processing to advanced Transformer models. Learn sentiment analysis, text generation, and more.',
      tags: ['NLP', 'Text Processing', 'Embeddings', 'Transformers', 'Beginner to Advanced'],
      roadmap: [
        { step: 1, title: 'Learn the Basics: Bag-of-Words', competitionId: 'titanic', competitionName: 'Sentiment Analysis on Movie Reviews', type: 'Competition' },
        { step: 2, title: 'Master Embeddings: Word2Vec & GloVe', competitionId: 'quora-insincere-questions-classification', competitionName: 'Quora Insincere Questions Classification', type: 'Competition' },
        { step: 3, title: 'Dive into Recurrent Neural Networks (RNNs)', competitionId: 'tweet-sentiment-extraction', competitionName: 'Tweet Sentiment Extraction', type: 'Competition' },
        { step: 4, title: 'Advanced: Attention & Transformers', competitionId: 'jigsaw-toxic-comment-classification-challenge', competitionName: 'Jigsaw Toxic Comment Classification Challenge', type: 'Competition' },
      ],
    },
    {
      id: 'computer-vision-fundamentals',
      title: 'Computer Vision Fundamentals',
      description: 'Master the essentials of computer vision, from image classification and object detection to image segmentation.',
      tags: ['Computer Vision', 'CNNs', 'Object Detection', 'Image Classification', 'Beginner'],
      roadmap: [
         { step: 1, title: 'Image Classification Basics: The "Hello World" of CV', competitionId: 'digit-recognizer', competitionName: 'Digit Recognizer (MNIST)', type: 'Competition' },
         { step: 2, title: 'Working with Real-World Images', competitionId: 'cifar-10', competitionName: 'CIFAR-10 Object Recognition in Images', type: 'Competition' },
         { step: 3, title: 'Advanced Classification & Architectures', competitionId: 'dog-breed-identification', competitionName: 'Dog Breed Identification', type: 'Competition' },
         { step: 4, title: 'Object Detection', competitionId: 'global-wheat-detection', competitionName: 'Global Wheat Detection', type: 'Competition' },
      ],
    },
    {
      id: 'mastering-tabular-data',
      title: 'Mastering Tabular Data',
      description: 'Deep dive into the most common type of data in machine learning. Master feature engineering, gradient boosting, and model ensembling.',
      tags: ['Tabular Data', 'Feature Engineering', 'XGBoost', 'LightGBM', 'Ensembling', 'Intermediate'],
      roadmap: [
          { step: 1, title: 'Core Concepts: Feature Engineering & Regression', competitionId: 'house-prices-advanced-regression-techniques', competitionName: 'House Prices: Advanced Regression Techniques', type: 'Competition' },
          { step: 2, title: 'Gradient Boosting with XGBoost/LightGBM', competitionId: 'porto-seguro-safe-driver-prediction', competitionName: 'Porto Seguro’s Safe Driver Prediction', type: 'Competition' },
          { step: 3, title: 'Handling Imbalanced Data', competitionId: 'credit-card-fraud-detection', competitionName: 'Credit Card Fraud Detection', type: 'Competition' },
          { step: 4, title: 'Advanced Ensembling & Stacking', competitionId: 'ieee-cis-fraud-detection', competitionName: 'IEEE-CIS Fraud Detection', type: 'Competition' },
      ],
    },
    {
      id: 'time-series-forecasting',
      title: 'Time Series Forecasting',
      description: 'Learn to predict the future. This path covers everything from classical methods like ARIMA to modern deep learning approaches like LSTMs.',
      tags: ['Time Series', 'Forecasting', 'ARIMA', 'LSTM', 'Statistics'],
      roadmap: [
        { step: 1, title: 'Fundamentals of Time Series Analysis', competitionId: 'store-sales-time-series-forecasting', competitionName: 'Store Sales - Time Series Forecasting', type: 'Competition' },
        { step: 2, title: 'Classical Models: ARIMA & Seasonality', competitionId: 'web-traffic-time-series-forecasting', competitionName: 'Web Traffic Time Series Forecasting', type: 'Competition' },
        { step: 3, title: 'Machine Learning for Time Series', competitionId: 'demand-forecasting-kernels-only', competitionName: 'Demand Forecasting Kernels Only', type: 'Competition' },
        { step: 4, title: 'Advanced: LSTMs for Forecasting', competitionId: 'm5-forecasting-accuracy', competitionName: 'M5 Forecasting - Accuracy', type: 'Competition' },
      ],
    },
    {
      id: 'ml-for-beginners-scikit-learn',
      title: 'ML for Beginners: Scikit-Learn Bootcamp',
      description: 'Build, validate, and deploy classic ML baselines for real datasets. The perfect starting point for your ML journey.',
      tags: ['Supervised Learning', 'Pipelines', 'Model Evaluation', 'Scikit-Learn', 'Beginner'],
      roadmap: [
        { step: 1, title: 'Your First Model: Predicting Survival', competitionId: 'titanic', competitionName: 'Titanic: Machine Learning from Disaster', type: 'Competition' },
        { step: 2, title: 'Data Preprocessing & Pipelines', competitionId: 'house-prices-advanced-regression-techniques', competitionName: 'House Prices: Advanced Regression', type: 'Competition' },
        { step: 3, title: 'Model Evaluation & Metrics', competitionId: 'spaceship-titanic', competitionName: 'Spaceship Titanic', type: 'Competition' },
      ],
    },
    {
      id: 'healthcare-biomedical-data-science',
      title: 'Healthcare & Biomedical Data Science',
      description: 'Build projects with real-world healthcare datasets, understand regulatory concerns, and apply ML to save lives.',
      tags: ['EHR Data', 'Disease Prediction', 'Medical Imaging', 'Data Privacy', 'Healthcare'],
      roadmap: [
        { step: 1, title: 'Introduction to Medical Data', competitionId: 'titanic', competitionName: 'Titanic Survival as a proxy for Patient Data', type: 'Competition' },
        { step: 2, title: 'Predicting Disease from Tabular Data', competitionId: 'porto-seguro-safe-driver-prediction', competitionName: 'Predicting Patient Outcomes (Proxy)', type: 'Competition' },
        { step: 3, title: 'Basic Medical Imaging', competitionId: 'digit-recognizer', competitionName: 'Digit Recognizer for Medical Image Intro', type: 'Competition' },
      ],
    },
    {
      id: 'fairness-ethics-explainability',
      title: 'Fairness, Ethics, and Model Explainability',
      description: 'Implement transparent ML, audit datasets and models for fairness, and learn to defend your model\'s decisions.',
      tags: ['Bias Mitigation', 'Fairness Audits', 'SHAP', 'LIME', 'Responsible AI', 'All Levels'],
      roadmap: [
        { step: 1, title: 'Understanding Bias in Data', competitionId: 'jigsaw-toxic-comment-classification-challenge', competitionName: 'Jigsaw Toxic Comment Classification', type: 'Competition' },
        { step: 2, title: 'Model Interpretability with LIME/SHAP', competitionId: 'house-prices-advanced-regression-techniques', competitionName: 'Explaining House Price Predictions', type: 'Competition' },
        { step: 3, title: 'Fairness Audits in Classification', competitionId: 'credit-card-fraud-detection', competitionName: 'Credit Card Fraud Detection', type: 'Competition' },
      ],
    },
    {
      id: 'large-language-models-in-practice',
      title: 'Large Language Models in Practice',
      description: 'Go beyond the hype and learn to build real applications with LLMs. Covers prompt engineering, RAG, and fine-tuning.',
      tags: ['LLM', 'Prompt Engineering', 'RAG', 'Fine-Tuning', 'Generative AI'],
      roadmap: [
        { step: 1, title: 'The Power of Prompts', competitionId: 'contradictory-my-dear-watson', competitionName: 'Contradictory, My Dear Watson', type: 'Competition' },
        { step: 2, title: 'Summarization and Q&A', competitionId: 'tweet-sentiment-extraction', competitionName: 'Tweet Sentiment Extraction', type: 'Competition' },
        { step: 3, title: 'Building a RAG System', competitionId: 'natural-language-processing-with-disaster-tweets', competitionName: 'NLP with Disaster Tweets', type: 'Competition' },
      ],
    },
];
