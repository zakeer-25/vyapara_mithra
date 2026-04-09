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
  duration?: number;
}

export function generateOwnerToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

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
    console.warn('[Analytics] SDK update failed, falling back to fetch keepalive:', error);
    return endVisitWithFetchKeepalive(websiteId, visitId, startTime);
  }
}

function endVisitWithFetchKeepalive(
  websiteId: string,
  visitId: string,
  startTime: Date,
): Promise<void> {
  const endTime = new Date();
  const duration = Math.max(1, Math.round((endTime.getTime() - startTime.getTime()) / 1000));

  const projectId = db.app.options.projectId;
  const apiKey = db.app.options.apiKey;

  if (!projectId || !apiKey) {
    console.error('[Analytics] Missing Firebase config');
    return Promise.reject(new Error('Firebase config not available'));
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

  console.log(`[Analytics] Sending fetch keepalive for visit ${visitId} (duration: ${duration}s)`);

  return fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    keepalive: true,
  })
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => {
          console.error('[Analytics] Fetch keepalive failed:', response.status, text);
          throw new Error(`HTTP ${response.status}`);
        });
      }
      console.log(`[Analytics] Visit ${visitId} updated via fetch keepalive`);
    })
    .catch(error => {
      console.error('[Analytics] Fetch keepalive error:', error);
      throw error;
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
    const durationValue = data.duration ? Number(data.duration) : 0;
    if (durationValue > 0) totalDuration += durationValue;
    visits.push({
      id: document.id,
      startTime: data.startTime?.toDate?.() ?? new Date(),
      endTime: data.endTime?.toDate?.(),
      duration: durationValue > 0 ? durationValue : undefined,
    });
  });

  const avgDuration = totalVisits > 0 ? Math.round(totalDuration / totalVisits) : 0;
  return { totalVisits, avgDuration, visits };
}

export async function getWebsiteOwnerToken(websiteId: string): Promise<string | null> {
  const docRef = doc(db, 'websites', websiteId);
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data().ownerToken || null : null;
}

export async function validateOwnerToken(websiteId: string, token: string): Promise<boolean> {
  const stored = await getWebsiteOwnerToken(websiteId);
  return stored === token;
}