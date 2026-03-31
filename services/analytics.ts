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
import { getFirestore } from 'firebase/firestore';
import { getApp } from 'firebase/app';

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

// End a visit by updating with endTime and calculated duration
export async function endVisitWithBeacon(websiteId: string, visitId: string, startTime: Date): Promise<void> {
  const endTime = new Date();
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
  const projectId = db.app.options.projectId;
  const apiKey = db.app.options.apiKey;
  if (!apiKey) {
    console.error('API key not found, cannot record visit duration');
    return;
  }
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/websites/${websiteId}/visits/${visitId}`;
  const body = {
    fields: {
      endTime: { timestampValue: { seconds: Math.floor(endTime.getTime() / 1000), nanos: (endTime.getTime() % 1000) * 1000000 } },
      duration: { integerValue: duration },
    },
  };
  try {
    await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
      },
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch (err) {
    console.error('Failed to update visit via beacon:', err);
  }
}

// Get aggregated stats for a website
export async function getWebsiteStats(websiteId: string) {
  const visitsRef = collection(db, 'websites', websiteId, 'visits');
  const q = query(visitsRef, orderBy('startTime', 'desc'), limit(100));
  const snapshot = await getDocs(q);

  let totalVisits = 0;
  let totalDuration = 0;
  const visits: VisitData[] = [];

  snapshot.forEach((doc: QueryDocumentSnapshot) => {
    const data = doc.data();
    totalVisits++;
    if (data.duration) totalDuration += data.duration;
    visits.push({
      id: doc.id,
      startTime: data.startTime.toDate(),
      endTime: data.endTime?.toDate(),
      duration: data.duration,
    });
  });

  const avgDuration = totalVisits > 0 ? Math.round(totalDuration / totalVisits) : 0;

  return {
    totalVisits,
    avgDuration,
    visits,
  };
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