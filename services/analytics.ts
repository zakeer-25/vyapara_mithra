import { db } from '../firebase';
import {
  collection,
  addDoc,
  updateDoc,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  getDoc,
  Timestamp,
  QueryDocumentSnapshot,
} from 'firebase/firestore';

export interface VisitData {
  id?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
}

// Generate a unique token for the website owner
export function generateOwnerToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Start a new visit and return its document ID
export async function startVisit(websiteId: string): Promise<string> {
  const visitsRef = collection(db, 'websites', websiteId, 'visits');
  const visitDoc = await addDoc(visitsRef, {
    startTime: Timestamp.now(),
    endTime: null,
    duration: null,
  });
  console.log(`[Analytics] Visit started: ${visitDoc.id}`);
  return visitDoc.id;
}

/**
 * End a visit — tries Firebase SDK first, then falls back to sendBeacon.
 */
export async function endVisit(
  websiteId: string,
  visitId: string,
  startTime: Date,
): Promise<void> {
  const endTime = new Date();
  const duration = Math.max(1, Math.round((endTime.getTime() - startTime.getTime()) / 1000));

  console.log(`[Analytics] Ending visit ${visitId} with duration ${duration}s`);

  try {
    const visitRef = doc(db, 'websites', websiteId, 'visits', visitId);
    await updateDoc(visitRef, {
      endTime: Timestamp.fromDate(endTime),
      duration,
    });
    console.log(`[Analytics] Visit ${visitId} updated via SDK`);
  } catch (error) {
    console.warn('[Analytics] SDK update failed, falling back to beacon:', error);
    // Fall back to beacon (does not return a promise rejection)
    endVisitWithBeacon(websiteId, visitId, startTime).catch(console.error);
  }
}

/**
 * Beacon-based fallback for beforeunload / pagehide.
 */
export function endVisitWithBeacon(
  websiteId: string,
  visitId: string,
  startTime: Date,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const endTime = new Date();
    const duration = Math.max(1, Math.round((endTime.getTime() - startTime.getTime()) / 1000));

    const projectId = db.app.options.projectId;
    const apiKey = db.app.options.apiKey;

    if (!projectId || !apiKey) {
      console.error('[Analytics] Missing Firebase config for beacon');
      reject(new Error('Firebase config not available'));
      return;
    }

    const url =
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents` +
      `/websites/${websiteId}/visits/${visitId}` +
      `?key=${apiKey}` +
      `&updateMask.fieldPaths=endTime` +
      `&updateMask.fieldPaths=duration`;

    const body = {
      fields: {
        endTime: {
          timestampValue: {
            seconds: Math.floor(endTime.getTime() / 1000),
            nanos: (endTime.getTime() % 1000) * 1_000_000,
          },
        },
        duration: { integerValue: String(duration) },
      },
    };

    const blob = new Blob([JSON.stringify(body)], { type: 'application/json' });
    const sent = navigator.sendBeacon(url, blob);

    if (sent) {
      console.log(`[Analytics] Beacon sent for visit ${visitId} (duration: ${duration}s)`);
      resolve();
    } else {
      console.error('[Analytics] Beacon failed to send');
      reject(new Error('sendBeacon failed'));
    }
  });
}

export async function getWebsiteStats(websiteId: string) {
  const visitsRef = collection(db, 'websites', websiteId, 'visits');
  const q = query(visitsRef, orderBy('startTime', 'desc'), limit(100));
  const snapshot = await getDocs(q);

  let totalVisits = 0;
  let totalDuration = 0;
  const visits: VisitData[] = [];

  snapshot.forEach((document: QueryDocumentSnapshot) => {
    const data = document.data();
    totalVisits++;

    // Ensure duration is treated as a number
    const durationValue = data.duration ? Number(data.duration) : 0;
    if (durationValue > 0) {
      totalDuration += durationValue;
    }

    visits.push({
      id: document.id,
      startTime: data.startTime?.toDate?.() ?? new Date(),
      endTime: data.endTime?.toDate?.(),
      duration: durationValue > 0 ? durationValue : undefined,
    });
  });

  const avgDuration = totalVisits > 0 ? Math.round(totalDuration / totalVisits) : 0;

  console.log(`[Analytics] Stats for ${websiteId}: ${totalVisits} visits, avg ${avgDuration}s`);

  return { totalVisits, avgDuration, visits };
}

// Get the owner token stored with the website
export async function getWebsiteOwnerToken(websiteId: string): Promise<string | null> {
  const docRef = doc(db, 'websites', websiteId);
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data().ownerToken || null : null;
}

// Validate that the provided token matches the one stored for the website
export async function validateOwnerToken(websiteId: string, token: string): Promise<boolean> {
  const stored = await getWebsiteOwnerToken(websiteId);
  return stored === token;
}