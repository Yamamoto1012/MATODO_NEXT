import { vi } from 'vitest';

export const mockFirestore = {
  collection: vi.fn(() => ({
    doc: vi.fn(() => ({
      get: vi.fn(() =>
        Promise.resolve({
          exists: true,
          data: () => ({
            id: 'mock-id',
            title: 'Mock Task',
            completed: false,
          }),
        })
      ),
      set: vi.fn(() => Promise.resolve()),
      update: vi.fn(() => Promise.resolve()),
      delete: vi.fn(() => Promise.resolve()),
    })),
    add: vi.fn(() => Promise.resolve({ id: 'mock-new-id' })),
    where: vi.fn(() => ({
      get: vi.fn(() =>
        Promise.resolve({
          docs: [
            {
              id: 'mock-id-1',
              data: () => ({ title: 'Task 1', completed: false }),
            },
            {
              id: 'mock-id-2',
              data: () => ({ title: 'Task 2', completed: true }),
            },
          ],
        })
      ),
    })),
  })),
};

export const mockAuth = {
  currentUser: {
    uid: 'mock-user-id',
    email: 'test@example.com',
    displayName: 'Test User',
  },
  signInWithEmailAndPassword: vi.fn(() =>
    Promise.resolve({
      user: {
        uid: 'mock-user-id',
        email: 'test@example.com',
      },
    })
  ),
  signOut: vi.fn(() => Promise.resolve()),
  onAuthStateChanged: vi.fn((callback) => {
    callback(mockAuth.currentUser);
    return vi.fn();
  }),
};

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => mockFirestore),
  collection: vi.fn((_db, _path) => mockFirestore.collection()),
  doc: vi.fn((collection, id) => collection.doc(id)),
  addDoc: vi.fn((collection, data) => collection.add(data)),
  getDocs: vi.fn((query) => query.get()),
  getDoc: vi.fn((docRef) => docRef.get()),
  setDoc: vi.fn((docRef, data) => docRef.set(data)),
  updateDoc: vi.fn((docRef, data) => docRef.update(data)),
  deleteDoc: vi.fn((docRef) => docRef.delete()),
  where: vi.fn((_field, _operator, _value) => ({ where: vi.fn() })),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => mockAuth),
  signInWithEmailAndPassword: vi.fn(mockAuth.signInWithEmailAndPassword),
  signOut: vi.fn(mockAuth.signOut),
  onAuthStateChanged: vi.fn(mockAuth.onAuthStateChanged),
}));

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: vi.fn(() => []),
  getApp: vi.fn(() => ({})),
}));
