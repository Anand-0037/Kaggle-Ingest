
'use client';

import { storage } from '@/lib/firebase';
import { ref, uploadString, getDownloadURL, uploadBytes } from 'firebase/storage';

/**
 * Uploads a file to Firebase Storage.
 * @param path The path where the file will be stored (e.g., 'users/uid/profile.png').
 * @param content The file content as a string or Blob.
 * @param contentType The MIME type of the file.
 * @returns A promise that resolves when the upload is complete.
 */
export async function uploadFile(path: string, content: string | Blob, contentType: string): Promise<void> {
  const storageRef = ref(storage, path);
  
  if (typeof content === 'string') {
    await uploadString(storageRef, content, 'raw', { contentType });
  } else {
    await uploadBytes(storageRef, content, { contentType });
  }
}

/**
 * Gets the public download URL for a file in Firebase Storage.
 * @param path The path of the file in Storage.
 * @returns A promise that resolves with the public URL of the file.
 */
export async function getFileUrl(path: string): Promise<string> {
  const storageRef = ref(storage, path);
  return await getDownloadURL(storageRef);
}
