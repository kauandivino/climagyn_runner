import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp, getDocFromServer, doc } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

/**
 * Validates connection to Firestore
 */
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
        // No auth in this app yet, but keeping structure
        userId: null
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface LeaderboardEntry {
    playerName: string;
    score: number;
    level: number;
    distance: number;
    createdAt: any;
}

export const submitScore = async (entry: Omit<LeaderboardEntry, 'createdAt'>) => {
    const path = 'leaderboard';
    try {
        await addDoc(collection(db, path), {
            ...entry,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
    }
};

export const getTopScores = async (count: number = 10) => {
    const path = 'leaderboard';
    try {
        const q = query(
            collection(db, path), 
            orderBy('level', 'desc'), 
            orderBy('score', 'desc'), 
            limit(count)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as (LeaderboardEntry & { id: string })[];
    } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
        return [];
    }
};
