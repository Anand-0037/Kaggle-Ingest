// Type declarations for Firebase modules
declare module 'firebase-admin/app' {
    export interface App {
        name: string;
    }

    export interface AppOptions {
        credential?: any;
        storageBucket?: string;
    }

    export function initializeApp(options: AppOptions): App;
    export function getApps(): App[];
    export function cert(serviceAccount: any): any;
}

declare module 'firebase-admin/auth' {
    export interface Auth {
        // Add auth methods as needed
    }

    export function getAuth(app?: any): Auth;
}

declare module 'firebase-admin/firestore' {
    export interface Timestamp {
        toDate(): Date;
    }

    export interface FieldValue {
        serverTimestamp(): any;
        arrayUnion(...elements: any[]): any;
        arrayRemove(...elements: any[]): any;
    }

    export const FieldValue: {
        serverTimestamp(): any;
        arrayUnion(...elements: any[]): any;
        arrayRemove(...elements: any[]): any;
    };

    export class Timestamp {
        toDate(): Date;
    }

    export interface Firestore {
        collection(path: string): any;
        batch(): any;
    }

    export function getFirestore(): Firestore;
} declare module 'firebase-admin/storage' {
    export function getStorage(): any;
}