# KaggleIngest

KaggleIngest is an AI-powered learning assistant that transforms Kaggle competitions into structured, summarized learning materials. It saves ML practitioners time by automating the analysis of datasets and top-performing notebooks.

## Features

*   **AI-Driven Context File Generation**: Automatic generation of `summary.txt` and `context.txt` files for each Kaggle competition, including dataset samples and analysis of top notebooks.
*   **Minimal and Modern UI**: A responsive competition browser with one-click downloads for the generated summary and context files.
*   **Live Public Demo**: Instantly try the "Quick Demo" for popular competitions like Titanic directly from the homepage, without needing to sign up.
*   **Persistent Kaggle Credentials**: Users enter their Kaggle API credentials once, and they are securely saved in Firestore for all future authenticated requests.
*   **Manual Refresh and Caching**: The main competition list is cached for one week to improve performance. All data can be manually regenerated on-demand to get the latest insights.

## Quick Start

### Try the Live Demo
1.  Visit the homepage.
2.  Click **“Generate Context File”** on one of the demo competition cards (e.g., Titanic) to see the full analysis pipeline in action.

### Local Setup
1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd kaggleingest
    ```
2.  **Configure Environment Variables**:
    Copy `.env.example` to a new file named `.env.local` and fill in your keys for Firebase, Gemini, and Kaggle.
3.  **Install Dependencies**:
    ```bash
    npm install
    ```
4.  **Ensure FastAPI Backend is Running** (Required for context file generation):
    The frontend expects a FastAPI backend running on `http://127.0.0.1:8000` with the following endpoints:
    - `GET /health` - Health check
    - `GET /get-context?url=COMPETITION_URL` - Generate and download context files
5.  **Start the Frontend Development Server**:
    ```bash
    npm run dev
    ```

## How It Works

### Architecture Overview
*   **Frontend**: Next.js / React
*   **Backend**:
    - **Primary**: External FastAPI server for Kaggle CLI integration and notebook processing
    - **Secondary**: Genkit AI flows running in a serverless Next.js environment
*   **Database**: Firestore (for user metadata, API keys, and competition info).
*   **Storage**: Firebase Storage (for storing generated `summary.txt` and `context.txt` files).
*   **AI**: Google's Gemini models accessed via Genkit for summarization and notebook analysis.## Usage Guide

1.  **Add Kaggle Keys (First-Time Use)**: After signing up, go to the **Competitions** page. You will be prompted to enter your Kaggle username and API key in the settings. These are stored securely and only need to be entered once.
2.  **Browse Competitions**: The main dashboard shows live competitions fetched from Kaggle.
3.  **Download Files**: Each competition card provides a direct download button for the detailed `context.txt` file.
4.  **Manual Update**: Use the **“Refresh List”** button to re-fetch the entire list of competitions. Use the **"Re-analyze"** button on any individual card to re-run the AI analysis for that specific competition.

## Security Notes

*   **Credentials**: Your Kaggle API credentials are not stored on the client. They are sent directly to the backend, stored securely in your user document in Firestore, and used only for server-to-server API calls.
*   **Public Files**: All generated summary and context files are stored in Firebase Storage and are accessible via public URLs.

## Tech Stack & APIs

*   **Kaggle API**: Official REST API used to fetch live competition data. Authentication is handled via user-provided API keys.
*   **Gemini API**: Used via Google's Genkit to perform the core AI analysis and summarization tasks.
*   **Firebase**: Provides the complete serverless backend, including authentication, Firestore database, and file storage.

## Extending and Customizing

*   **Add Demo Competitions**: Modify the array in `src/app/page.tsx` to add more competitions to the "Quick Demo" section.
*   **Swap AI Model**: The Genkit configuration in `src/ai/genkit.ts` can be modified to use a different Gemini model or another generative AI backend.
*   **Customize Context Output**: Modify the AI prompt in `src/ai/flows/ingest-competition.ts` to change the richness and structure of the generated summary and context files.
*   **Support for Datasets**: Extend the logic in the AI flows to support direct analysis of Kaggle datasets, not just competitions.
*   **Automated Weekly Updates**: The current implementation includes a 7-day cache on the main competition list. To implement a true automated weekly refresh, you could set up a scheduled serverless function (e.g., a Firebase Scheduled Function or a cron job) that periodically calls the `ingestCompetition` flow for all or a subset of competitions and updates the results in Firestore.

## Requirements

### Frontend
*   Node.js (version >= 18)
*   `npm` for package management
*   A valid Google AI (Gemini) API key
*   A Firebase project

### External FastAPI Backend
The frontend requires an external FastAPI backend running on `http://127.0.0.1:8000` with:
*   **Endpoints**:
    - `GET /health` - Health check endpoint
    - `GET /get-context?url=COMPETITION_URL` - Context file generation endpoint
*   **Dependencies**: Kaggle CLI properly configured with valid credentials
*   **CORS**: Configured to allow requests from `http://localhost:3000`

## Development & Contributing

### Scripts
*   `npm run dev`: Starts the Next.js frontend development server.
*   `npm run build`: Creates a production build of the application.
*   `npm start`: Starts the production server.

### Pull Requests
PRs are welcome! Please fork the repository, create a new branch for your feature or fix, and submit a pull request following the repository's coding style.

## Troubleshooting

*   **FastAPI Backend Issues**:
    *   Ensure the backend is running on `http://127.0.0.1:8000`
    *   Check that CORS is configured to allow requests from `http://localhost:3000`
    *   Verify the backend has the required endpoints: `/health` and `/get-context`
    *   Use the "Check Backend" button in the Context File Generator to test connectivity
*   **Kaggle API Errors**: If you encounter errors fetching data, ensure your Kaggle API key is valid and that you have accepted the rules for the specific competition on the Kaggle website. Also, double-check that your credentials are set correctly in the app's settings.
*   **Build/Run Errors**:
    *   **Missing Environment Variables**: Ensure your `.env.local` file is present and correctly filled out.
    *   **Firebase Admin Issues**: Make sure the `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable is correctly set for the backend to connect to Firestore.

## Future Roadmap

*   Add support for tagging and filtering competitions by skill level or domain.
*   Introduce basic data visualizations within the app based on the context file contents.
*   Implement user feedback mechanisms to suggest learning paths or per-user recommendations.
*   Improve accessibility and add multilingual support.
