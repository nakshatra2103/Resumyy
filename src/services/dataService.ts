import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  doc,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const dataService = {
  async saveResume(userId: string, data: any) {
    const path = `users/${userId}/resumes`;
    try {
      return await addDoc(collection(db, path), {
        ...data,
        userId,
        uploadDate: serverTimestamp(),
        status: 'uploaded'
      });
    } catch (e) { handleFirestoreError(e, OperationType.CREATE, path); }
  },

  async getUserResumes(userId: string) {
    const path = `users/${userId}/resumes`;
    try {
      const q = query(collection(db, path));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) { handleFirestoreError(e, OperationType.LIST, path); }
  },

  async getResume(userId: string, resumeId: string) {
    const path = `users/${userId}/resumes/${resumeId}`;
    try {
      const docRef = doc(db, path);
      const snapshot = await getDoc(docRef);
      return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
    } catch (e) { handleFirestoreError(e, OperationType.GET, path); }
  },

  async saveScore(userId: string, data: any) {
    const path = `users/${userId}/scores`;
    try {
      return await addDoc(collection(db, path), {
        ...data,
        userId,
        createdAt: serverTimestamp()
      });
    } catch (e) { handleFirestoreError(e, OperationType.CREATE, path); }
  }
};
