
'use server';

import { db } from '@/lib/firebase-admin';
import { getCompetitions as getCompetitionsFlow } from '@/ai/flows/get-competitions';
import { generateContextFile, GenerateContextFileOutput } from '@/ai/flows/generate-context-file';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { getStorage } from 'firebase-admin/storage';
import { GetCompetitionsOutput } from '@/ai/flows/get-competitions';
import { IngestCompetitionOutput, ingestCompetition } from '@/ai/flows/ingest-competition';

if (!db) {
    console.warn('Firestore is not initialized. Check your server environment configuration.');
}

// This type can be defined here or in a shared types file.
export type Competition = {
    id: any;
    title: string;
    url: string;
    prize: string;
    status: string;
    lastUpdated?: any;
    tags?: string[];
    ingestionData?: Partial<IngestCompetitionOutput> & {
        contextFileUrl?: string;
        jsonFileUrl?: string;
        status?: 'pending' | 'processing' | 'complete' | 'failed';
        error?: string;
    };
};

async function updateCompetitionInStore(competitionId: string, data: Partial<Competition>) {
    if (!db) return;
    const docRef = db.collection('competitions').doc(competitionId.toString());
    await docRef.set({
        ...data,
        lastUpdated: FieldValue.serverTimestamp(),
    }, { merge: true });
}

export async function triggerGlobalCompetitionRefresh(uid: string) {
    console.log('Starting global competition refresh...');
    if (!db) throw new Error('Database not initialized');

    try {
        const creds = await getUserKaggleCreds(uid);
        if (!creds) throw new Error('Cannot refresh competitions without Kaggle credentials.');
        if (!db) throw new Error('Database is not available.');

        console.log('Fetching competitions using CLI...');
        const competitions = await getCompetitionsFlow(uid);

        if (!competitions || competitions.length === 0) {
            console.warn('No competitions returned from CLI');
            throw new Error('No competitions found. This might be due to Kaggle CLI issues or credential problems.');
        }

        console.log(`Found ${competitions.length} competitions, updating database...`);
        const batch = db.batch();
        competitions.forEach(c => {
            const docRef = db!.collection('competitions').doc(c.id.toString());
            batch.set(docRef, {
                ...c,
                lastUpdated: FieldValue.serverTimestamp(),
            }, { merge: true }); // Merge to not overwrite existing analysis data
        });

        await batch.commit();
        console.log('Successfully updated competition database');

        revalidatePath('/competitions');
        return competitions as Competition[];

    } catch (error: any) {
        console.error('Global competition refresh failed:', error);

        // Provide more specific error messages for common issues
        if (error.message?.includes('not installed') || error.message?.includes('not in PATH')) {
            throw new Error('Kaggle CLI is not installed or not accessible. Please ensure it is installed with: pip install kaggle');
        } else if (error.message?.includes('401') || error.message?.includes('Unauthorized') || error.message?.includes('Invalid Kaggle credentials')) {
            throw new Error('Invalid Kaggle credentials. Please check your username and API key in Settings.');
        } else if (error.message?.includes('timeout')) {
            throw new Error('Kaggle CLI command timed out. Please check your internet connection and try again.');
        } else if (error.message?.includes('No competitions found')) {
            throw new Error('No competitions could be retrieved from Kaggle. This might be a temporary API issue or credential problem.');
        } else {
            throw new Error(`Competition refresh failed: ${error.message || 'Unknown error'}`);
        }
    }
}


export async function generateContextFileAction(competition: Pick<Competition, 'id' | 'title' | 'url'>): Promise<GenerateContextFileOutput> {
    console.log(`Starting real-time analysis for: ${competition.id}`);

    const analysisResult = await generateContextFile({
        competitionUrl: competition.url,
        useBackend: true,
    });

    return analysisResult;
}


export async function getCachedCompetitions(): Promise<Competition[]> {
    if (!db) throw new Error('Database not initialized');

    try {
        // Reset stuck competitions before returning the list
        await resetStuckCompetitions();

        const doc = await db.collection('cachedCompetitions').doc('global').get();
        if (!doc.exists) {
            console.log('No cached competitions found');
            return [];
        }
        const data = doc.data();

        // Check if cache is older than 1 week
        const lastRefresh = data?.lastRefresh?.toDate();
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        if (!lastRefresh || lastRefresh < oneWeekAgo) {
            console.log('Cached competitions are stale');
            return [];
        }

        return data?.competitions || [];
    } catch (error) {
        console.error('Error fetching cached competitions:', error);
        return [];
    }
}

// Helper function to reset competitions that are stuck in processing/pending states
async function resetStuckCompetitions() {
    if (!db) return;

    try {
        const cutoffTime = new Date(Date.now() - 15 * 60 * 1000); // 15 minutes ago

        const stuckQuery = await db.collection('competitions')
            .where('ingestionData.status', 'in', ['processing', 'pending'])
            .get();

        const batch = db.batch();
        let resetCount = 0;

        stuckQuery.forEach((doc: any) => {
            const data = doc.data();
            const lastUpdated = data.lastUpdated?.toDate();

            // If lastUpdated is more than 15 minutes ago, reset the status
            if (!lastUpdated || lastUpdated < cutoffTime) {
                batch.update(doc.ref, {
                    'ingestionData.status': 'failed',
                    'ingestionData.error': 'Analysis timed out - please retry',
                    'lastUpdated': FieldValue.serverTimestamp(),
                });
                resetCount++;
            }
        });

        if (resetCount > 0) {
            await batch.commit();
            console.log(`Reset ${resetCount} stuck competitions`);
        }
    } catch (error) {
        console.error('Error resetting stuck competitions:', error);
    }
}

export async function getCompetitionAnalysis(competitionId: string): Promise<Competition | null> {
    if (!db) return null;
    const docRef = db.collection('competitions').doc(competitionId.toString());
    const docSnap = await docRef.get();

    if (docSnap.exists) {
        const data = docSnap.data();
        if (data) {
            if (data.lastUpdated && data.lastUpdated instanceof Timestamp) {
                data.lastUpdated = data.lastUpdated.toDate().toISOString();
            }
            // De-serialize the notebooks if they are stored as a string
            if (data.ingestionData?.deconstructedNotebooks && typeof data.ingestionData.deconstructedNotebooks === 'string') {
                try {
                    data.ingestionData.deconstructedNotebooks = JSON.parse(data.ingestionData.deconstructedNotebooks);
                } catch (e) {
                    console.error("Failed to parse deconstructedNotebooks JSON:", e);
                    // Handle the error, maybe by setting notebooks to an empty array or an error state
                    data.ingestionData.deconstructedNotebooks = [];
                }
            }
        }
        return data as Competition;
    }
    return null;
}

export async function handleCustomCompetitionAnalysis(uid: string, competitionUrl: string) {
    if (!db) throw new Error('Database not initialized');
    if (!uid) throw new Error('User not authenticated');

    const competitionId = competitionUrl.split('/').filter(Boolean).pop()!;
    const newCompetitionRef = db.collection('competitions').doc(competitionId);

    await newCompetitionRef.set({
        id: competitionId,
        title: `Custom: ${competitionId}`,
        url: competitionUrl,
        prize: 'N/A',
        status: 'Custom',
        lastUpdated: FieldValue.serverTimestamp(),
        ingestionData: {
            status: 'pending',
        }
    }, { merge: true });

    revalidatePath('/competitions');

    // Trigger analysis without waiting for it to complete
    triggerSingleCompetitionAnalysis(uid, competitionId).catch(console.error);

    // Revalidate paths after triggering the analysis
    revalidatePath(`/competitions/${competitionId}`);
}

// A helper function to trigger analysis for a single competition
async function triggerSingleCompetitionAnalysis(uid: string, competitionId: string) {
    console.log(`Background analysis triggered for ${competitionId}`);
    if (!db) return;

    const competitionRef = db.collection('competitions').doc(competitionId);
    const competitionSnap = await competitionRef.get();
    if (!competitionSnap.exists) {
        console.error(`Competition ${competitionId} not found for analysis.`);
        return;
    }

    const competition = competitionSnap.data() as Competition;

    await competitionRef.update({ 'ingestionData.status': 'processing' });

    try {
        const creds = await getUserKaggleCreds(uid);

        // Add timeout for the analysis (10 minutes max)
        const analysisPromise = ingestCompetition({
            competitionUrl: competition.url,
            creds: creds || undefined,
        });

        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Analysis timeout after 10 minutes')), 10 * 60 * 1000);
        });

        const analysisResult = await Promise.race([analysisPromise, timeoutPromise]) as IngestCompetitionOutput;

        await competitionRef.update({
            'ingestionData.summary': analysisResult.summary,
            'ingestionData.deconstructedNotebooks': JSON.stringify(analysisResult.deconstructedNotebooks),
            'ingestionData.status': 'complete',
            'ingestionData.error': null, // Clear any previous errors
            'lastUpdated': FieldValue.serverTimestamp(),
        });
        console.log(`Analysis complete for ${competitionId}`);

    } catch (error: any) {
        console.error(`Analysis failed for ${competitionId}:`, error);
        await competitionRef.update({
            'ingestionData.status': 'failed',
            'ingestionData.error': error.message || 'Analysis failed due to unknown error',
            'lastUpdated': FieldValue.serverTimestamp(),
        });
    }
}


export async function saveUserKaggleCreds(creds: {
    uid: string;
    kaggleUsername: string;
    kaggleKey: string;
}) {
    if (!creds.uid) throw new Error('User is not authenticated.');
    if (!db) throw new Error("Database is not available.");

    try {
        await db.collection('users').doc(creds.uid).set(
            { kaggleUsername: creds.kaggleUsername, kaggleKey: creds.kaggleKey },
            { merge: true }
        );
        return { success: true };
    } catch (error: any) {
        console.error('Failed to save Kaggle credentials:', error);
        throw new Error(`Could not save credentials: ${error.message}`);
    }
}

export async function getUserData(uid: string) {
    if (!uid || !db) return null;
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) return null;
    return userDoc.data();
}

export async function getUserKaggleCreds(uid: string): Promise<{ kaggleUsername: string; kaggleKey: string; } | null> {
    const envUsername = process.env.KAGGLE_USERNAME;
    const envKey = process.env.KAGGLE_KEY;

    if (envUsername && envKey) {
        console.log("Using Kaggle credentials from environment variables.");
        return { kaggleUsername: envUsername, kaggleKey: envKey };
    }

    if (!uid || !db || uid === 'system') {
        return null;
    }

    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) return null;

    const userData = userDoc.data();
    if (!userData || !userData.kaggleUsername || !userData.kaggleKey) return null;

    return { kaggleUsername: userData.kaggleUsername, kaggleKey: userData.kaggleKey };
}

export async function saveUserXP(uid: string, xp: number, level: number, competitionsAnalysed: number) {
    if (!uid || !db) return;
    await db.collection('users').doc(uid).set({ xp, level, competitionsAnalysed }, { merge: true });
}

export async function updateUserInterests(uid: string, interest: string, action: 'add' | 'remove') {
    if (!uid || !db) throw new Error('User or database not available.');
    const userRef = db.collection('users').doc(uid);

    try {
        const update = action === 'add'
            ? { interests: FieldValue.arrayUnion(interest) }
            : { interests: FieldValue.arrayRemove(interest) };
        await userRef.update(update);
        return { success: true };
    } catch (error: any) {
        console.error(`Failed to ${action} interest:`, error);
        throw new Error(`Could not update interests.`);
    }
}

export async function resetStuckCompetitionsAction(uid: string) {
    if (!db) throw new Error('Database not initialized');
    if (!uid) throw new Error('User not authenticated');

    try {
        const cutoffTime = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago

        const stuckQuery = await db.collection('competitions')
            .where('ingestionData.status', 'in', ['processing', 'pending'])
            .get();

        const batch = db.batch();
        let resetCount = 0;

        stuckQuery.forEach((doc: any) => {
            const data = doc.data();
            const lastUpdated = data.lastUpdated?.toDate();

            // If lastUpdated is more than 10 minutes ago, reset the status
            if (!lastUpdated || lastUpdated < cutoffTime) {
                batch.update(doc.ref, {
                    'ingestionData.status': 'failed',
                    'ingestionData.error': 'Analysis timed out - please retry',
                    'lastUpdated': FieldValue.serverTimestamp(),
                });
                resetCount++;
            }
        });

        if (resetCount > 0) {
            await batch.commit();
            console.log(`Manually reset ${resetCount} stuck competitions`);
        }

        return resetCount;
    } catch (error) {
        console.error('Error resetting stuck competitions:', error);
        throw error;
    }
}

// Action for demo section on the landing page
export async function getDemoCompetition(competitionId: string) {
    if (!db) return null;
    const docRef = db.collection('demoCompetitions').doc(competitionId);
    const docSnap = docRef.get();
    return (await docSnap).exists ? (await docSnap).data() as IngestCompetitionOutput : null;
}

export async function saveDemoCompetition(competitionId: string, analysisData: IngestCompetitionOutput) {
    if (!db) return;
    const docRef = db.collection('demoCompetitions').doc(competitionId);
    await docRef.set({
        ...analysisData,
        lastAnalyzed: FieldValue.serverTimestamp(),
    }, { merge: true });
}
