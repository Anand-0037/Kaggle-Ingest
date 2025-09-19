# Product Requirements Document: KaggleIngest

**Author:** KaggleIngest Team
**Version:** 1.0
**Status:** In Development

---

## 1. Introduction & Vision

**Product:** KaggleIngest - Your AI-Powered Machine Learning Co-Pilot.

**Vision:** To accelerate the machine learning journey from learning to application by transforming Kaggle competitions from raw sources of information into structured, actionable knowledge.

**Problem:** Kaggle competitions contain a wealth of information, but extracting key insights from top-performing notebooks and datasets is a time-consuming, manual process. Practitioners spend hours on redundant EDA and boilerplate code instead of focusing on unique strategies.

**Solution:** KaggleIngest automates the analysis of Kaggle competitions. It ingests the top notebooks, deconstructs them into granular code and markdown cells, and provides AI-driven insights, summaries, and structured data exports.

---

## 2. Target Audience

*   **Aspiring Data Scientists & ML Students:** Looking for a structured way to learn from real-world problems and best-practice solutions.
*   **Experienced ML Practitioners:** Seeking to quickly understand the meta-strategy of a competition without manually reviewing dozens of notebooks.
*   **Researchers & Academics:** Who need structured, machine-readable data from competition notebooks for meta-analysis.

---

## 3. Core Features (MVP)

### 3.1. AI-Powered Competition Ingestion
*   **Description:** Users can provide a Kaggle competition URL or select from a list of active competitions. The system fetches competition details and initiates an AI analysis pipeline.
*   **AI Analysis:** The core `ingestCompetition` flow uses a Genkit AI agent to:
    *   Generate a one-paragraph summary of the competition's goal.
    *   Identify and store the top 10 most-upvoted public notebooks by scraping the competition's "Code" page using Selenium.

### 3.2. Granular Notebook Deconstruction & Tagging
*   **Description:** For each of the top 10 notebooks, the AI agent uses a Selenium-based scraper to deconstruct its entire content into a structured format.
*   **Data Structure:** Each notebook is represented as an ordered array of cells. Each cell contains:
    *   `type`: 'code' or 'markdown'.
    *   `content`: The raw content of the cell.
    *   `tags`: An array of auto-generated tags identifying ML concepts (e.g., 'EDA', 'XGBoost', 'feature-engineering').
    *   `signal`: A quality score ('high', 'medium', 'low', 'boilerplate') to distinguish unique insights from generic code.
*   **Metadata:** The system captures the notebook's title, author, and URL.

### 3.3. Dataset Profiler
*   **Description:** A standalone tool to get instant AI analysis on any dataset.
*   **Functionality:** Users can either paste a Kaggle dataset URL or upload a CSV file. The AI returns a profile including:
    *   Basic stats (row/column count).
    *   Missing value analysis.
    *   Data quality issues.
    *   Feature engineering suggestions.

### 3.4. Export & Download
*   **Description:** All generated analysis is made available for download.
*   **Formats:**
    *   **Context File (`.txt`):** A human-readable text file containing the competition summary and the full deconstructed content of all top notebooks.
    *   **JSON Export (`.json`):** A machine-readable file containing the complete, structured analysis output, including all metadata, tags, and signal scores for every cell.

### 3.5. Centralized Dashboard
*   **Description:** A responsive web interface for authenticated users to manage their work.
*   **Components:**
    *   **Authentication:** Secure user sign-up and sign-in.
    *   **Settings:** Users securely store their Kaggle API credentials.
    *   **Competitions View:** A dashboard of live and ingested competitions, with filtering by tags and buttons for downloading analysis.

---

## 4. User Flow

1.  **Onboarding:** A new user signs up and is prompted to enter their Kaggle API credentials in the settings.
2.  **Ingestion:** The user browses a list of active Kaggle competitions or pastes a specific URL to ingest a new one.
3.  **Analysis:** The user views the dashboard where competition cards show the status of the AI analysis.
4.  **Consumption:** Once complete, the user can:
    *   Download the `.txt` context file for offline reading.
    *   Export the structured `.json` file for programmatic use.
    *   Click "View Details" to interact with an AI mentor for that competition.
5.  **Profiling:** At any time, the user can navigate to the "Profiler" tab to analyze a new dataset.

---

## 5. Future Roadmap (Post-MVP)

*   **Notebook Viewer UI:** A dedicated interface to render the deconstructed notebook cells with filters for `tags` and `signal` score.
*   **User Feedback System:** Allow users to "pin" or "flag" high-value cells to crowdsource the best insights.
*   **Advanced Search:** Implement a search function to find specific techniques or code snippets across all ingested notebooks.
*   **Automated Weekly Updates:** A scheduled job to refresh competition data and re-run analysis.
*   **Code Generation:** Offer one-click generation of boilerplate EDA or model training code based on the dataset profile.

---

## 6. Success Metrics

*   **Adoption:** Number of weekly active users.
*   **Engagement:**
    *   Number of competitions ingested per user.
    *   Number of context/JSON files downloaded.
    *   Daily usage of the Dataset Profiler.
*   **Retention:** Percentage of users who return after their first week.
