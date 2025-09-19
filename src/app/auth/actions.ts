
'use server';

import { auth } from '@/lib/firebase-admin';
import { lucia } from '@/lib/lucia';
import { cookies } from 'next/headers';
import { db } from '@/lib/firebase-admin';

export const saveUserInterestsAction = async (formData: FormData) => {
    const uid = formData.get('uid') as string;
    const interests = JSON.parse(formData.get('interests') as string || '[]');

    if (!uid) {
        return { success: false, error: 'User not authenticated.' };
    }

    try {
        // Save interests to Firestore
        if (!db) {
            throw new Error('Firebase not initialized');
        }
        await db.collection('users').doc(uid).set({
            interests: interests,
            xp: 0,
            level: 1,
            competitionsAnalysed: 0,
        }, { merge: true });
    } catch (error: any) {
        return { success: false, error: `Firestore Error: ${error.message}` };
    }

    try {
        const session = await lucia.createSession(uid, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    } catch (error: any) {
        return { success: false, error: `Session Creation Error: ${error.message}` };
    }

    return { success: true };
};

export const signInAction = async (formData: FormData) => {
    // This action is a placeholder. Firebase client SDK handles sign-in.
    // We need a server action to satisfy the form, but the real logic
    // is in the component's onSubmit handler which calls Firebase auth directly.
    return { success: true };
};


export const signOutAction = async () => {
    const cookieStore = cookies();
    const sessionId = cookieStore.get('auth_session')?.value;

    if (sessionId) {
        try {
            await lucia.invalidateSession(sessionId);
            const sessionCookie = lucia.createBlankSessionCookie();
            cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        } catch (error) {
            console.error('Error invalidating session:', error);
        }
    }

    // Even if there's an error, clear the cookie from the browser
    cookies().delete('auth_session');
};
