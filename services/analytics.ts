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

// End a visit by updating with endTime and calculated duration
export async function endVisit(websiteId: string, visitId: string): Promise<void> {
  const visitRef = doc(db, 'websites', websiteId, 'visits', visitId);
  const startSnap = await getDoc(visitRef);
  if (!startSnap.exists()) return;
  const startData = startSnap.data();
  if (!startData.startTime) return;

  const endTime = Timestamp.now();
  const startMillis = startData.startTime.toMillis();
  const endMillis = endTime.toMillis();
  const duration = Math.round((endMillis - startMillis) / 1000);

  await updateDoc(visitRef, {
    endTime,
    duration,
  });
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