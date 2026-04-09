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
  return visitDoc.id;
}

/**
 * End a visit — tries Firebase SDK first (works when page is still alive),
 * then falls back to navigator.sendBeacon for the beforeunload case.
 *
 * The Firestore REST PATCH URL must include updateMask so only endTime +
 * duration are written — otherwise the full document is replaced and
 * startTime is lost, which causes "In progress" forever in the stats page.
 */
export async function endVisit(
  websiteId: string,
  visitId: string,
  startTime: Date,
): Promise<void> {
  const endTime = new Date();
  const duration = Math.max(1, Math.round((endTime.getTime() - startTime.getTime()) / 1000));

  try {
    // Preferred path: Firebase SDK updateDoc (works when page is still active)
    const visitRef = doc(db, 'websites', websiteId, 'visits', visitId);
    await updateDoc(visitRef, {
      endTime: Timestamp.fromDate(endTime),
      duration,
    });
  } catch {
    // SDK path failed (e.g. page is unloading) — fall back to sendBeacon
    endVisitWithBeacon(websiteId, visitId, startTime);
  }
}

/**
 * Beacon-based fallback for beforeunload / pagehide.
 * Uses the Firestore REST PATCH endpoint with `updateMask.fieldPaths` so that
 * ONLY endTime and duration fields are updated — startTime is preserved.
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
      reject(new Error('Firebase config not available'));
      return;
    }

    // CRITICAL: include updateMask so only these two fields are written.
    // Without updateMask, the full document is replaced and startTime is erased.
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
      resolve();
    } else {
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
    if (data.duration) totalDuration += Number(data.duration);
    visits.push({
      id: document.id,
      startTime: data.startTime?.toDate?.() ?? new Date(),
      endTime: data.endTime?.toDate?.(),
      duration: data.duration ? Number(data.duration) : undefined,
    });
  });

  const avgDuration = totalVisits > 0 ? Math.round(totalDuration / totalVisits) : 0;

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