
import { Lucia } from 'lucia';
import { NodeNextRequest, NodeNextResponse } from 'next/dist/server/base-http/node';
import { cookies } from 'next/headers';

// This is a placeholder for a database adapter if you were using one.
// Since we are using Firebase Admin for session validation, we don't need a formal adapter.
const adapter = {
    // getSessionAndUser: ...
    // getUserSessions: ...
    // setSession: ...
    // updateSessionExpiration: ...
    // deleteSession: ...
    // deleteUserSessions: ...
};


export const lucia = new Lucia(adapter as any, {
	sessionCookie: {
		// this sets cookies with super long expiration
		// since Next.js doesn't allow Lucia to extend cookie expiration when rendering pages
		expires: false,
		attributes: {
			// set to `true` when using HTTPS
			secure: process.env.NODE_ENV === 'production'
		}
	},
    getUserAttributes: (attributes) => {
        return {
            email: attributes.email
        };
    }
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
        DatabaseUserAttributes: {
            email: string;
        }
	}
}

export const getPageSession = async () => {
	const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
	if (!sessionId) return null;
	const { session, user } = await lucia.validateSession(sessionId);
	try {
		if (session && session.fresh) {
			const sessionCookie = lucia.createSessionCookie(session.id);
			cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
		}
		if (!session) {
			const sessionCookie = lucia.createBlankSessionCookie();
			cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
		}
	} catch {}
	return session;
};

