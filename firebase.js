// ConfFlow — Firebase Configuration & Services
// ────────────────────────────────────────────
// Replace the firebaseConfig object with your credentials from:
// https://console.firebase.google.com → Project Settings → Your Apps

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  limit
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js";

// ── Firebase Config ───────────────────────────────────────────────────────────
// ⚠️  REPLACE these placeholder values with your actual Firebase project config.
const firebaseConfig = {
  apiKey:            "__FIREBASE_API_KEY__",
  authDomain:        "__FIREBASE_AUTH_DOMAIN__",
  projectId:         "__FIREBASE_PROJECT_ID__",
  storageBucket:     "__FIREBASE_STORAGE_BUCKET__",
  messagingSenderId: "__FIREBASE_MESSAGING_SENDER_ID__",
  appId:             "__FIREBASE_APP_ID__",
  measurementId:     "__FIREBASE_MEASUREMENT_ID__"
};

// ── Initialize ────────────────────────────────────────────────────────────────
let app, auth, db, storage;
let firebaseReady = false;

try {
  if (firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith('__')) {
    app     = initializeApp(firebaseConfig);
    auth    = getAuth(app);
    db      = getFirestore(app);
    storage = getStorage(app);
    firebaseReady = true;
    console.log('%c✅ ConfFlow: Firebase connected', 'color:#10b981;font-weight:bold');
  } else {
    console.warn('%c⚠️  ConfFlow: Demo mode — add Firebase credentials in js/firebase.js', 'color:#f59e0b;font-weight:bold');
  }
} catch (err) {
  console.error('Firebase init error:', err);
}

const googleProvider = firebaseReady ? new GoogleAuthProvider() : null;

function requireFirebase(name) {
  if (!firebaseReady) throw new Error(`Firebase not configured. Cannot call ${name}(). See js/firebase.js.`);
}

// ── Auth Services ─────────────────────────────────────────────────────────────
export const AuthService = {

  async register(email, password, displayName, role, institution) {
    requireFirebase('register');
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid, displayName, email,
      role, institution: institution || '',
      createdAt: serverTimestamp(), avatar: null
    });
    return cred.user;
  },

  async login(email, password) {
    requireFirebase('login');
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  },

  async loginWithGoogle() {
    requireFirebase('loginWithGoogle');
    const result = await signInWithPopup(auth, googleProvider);
    const userRef = doc(db, 'users', result.user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: result.user.uid,
        displayName: result.user.displayName || 'Researcher',
        email: result.user.email, role: 'author', institution: '',
        createdAt: serverTimestamp(), avatar: result.user.photoURL || null
      });
    }
    return result.user;
  },

  async logout() {
    if (!firebaseReady) return;
    await signOut(auth);
  },

  onAuthChange(callback) {
    if (!firebaseReady) { callback(null); return () => {}; }
    return onAuthStateChanged(auth, callback);
  },

  getCurrentUser() {
    return firebaseReady ? auth.currentUser : null;
  }
};

// ── User Services ─────────────────────────────────────────────────────────────
export const UserService = {
  async getProfile(uid) {
    requireFirebase('getProfile');
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? snap.data() : null;
  },

  async updateProfile(uid, data) {
    requireFirebase('updateProfile');
    await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() });
  },

  async getByRole(role) {
    requireFirebase('getByRole');
    const q = query(collection(db, 'users'), where('role', '==', role));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
};

// ── Conference Services ───────────────────────────────────────────────────────
export const ConferenceService = {
  async create(data) {
    requireFirebase('create');
    return await addDoc(collection(db, 'conferences'), {
      ...data, createdAt: serverTimestamp(), status: 'active', papersCount: 0
    });
  },

  async getAll() {
    requireFirebase('getAll');
    const q = query(collection(db, 'conferences'), where('status', '==', 'active'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async getById(id) {
    requireFirebase('getById');
    const snap = await getDoc(doc(db, 'conferences', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  async update(id, data) {
    requireFirebase('update');
    await updateDoc(doc(db, 'conferences', id), { ...data, updatedAt: serverTimestamp() });
  },

  onConfChange(id, callback) {
    if (!firebaseReady) return () => {};
    return onSnapshot(doc(db, 'conferences', id), snap => {
      if (snap.exists()) callback({ id: snap.id, ...snap.data() });
    });
  }
};

// ── Paper Services ────────────────────────────────────────────────────────────
export const PaperService = {

  async submit(data, pdfFile, onProgress) {
    requireFirebase('submit');
    let pdfUrl = null;

    if (pdfFile) {
      const storageRef = ref(storage, `papers/${Date.now()}_${pdfFile.name}`);
      const task = uploadBytesResumable(storageRef, pdfFile);
      pdfUrl = await new Promise((resolve, reject) => {
        task.on('state_changed',
          s => { if (onProgress) onProgress(Math.round((s.bytesTransferred / s.totalBytes) * 100)); },
          reject,
          async () => resolve(await getDownloadURL(task.ref))
        );
      });
    }

    const docRef = await addDoc(collection(db, 'papers'), {
      ...data, pdfUrl,
      status: 'submitted', aiScore: null, reviewers: [],
      submittedAt: serverTimestamp(), updatedAt: serverTimestamp()
    });

    // Async AI scoring — fire and forget
    AIService.score(data.abstract || '', data.title || '', data.track || '').then(scores => {
      updateDoc(docRef, { aiScore: scores }).catch(() => {});
    }).catch(() => {});

    return docRef;
  },

  async getByAuthor(authorId) {
    requireFirebase('getByAuthor');
    const q = query(collection(db, 'papers'), where('authorId', '==', authorId), orderBy('submittedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async getByConference(confId) {
    requireFirebase('getByConference');
    const q = query(collection(db, 'papers'), where('conferenceId', '==', confId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async getByReviewer(reviewerId) {
    requireFirebase('getByReviewer');
    const q = query(collection(db, 'papers'), where('reviewers', 'array-contains', reviewerId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async updateStatus(paperId, status, note = '') {
    requireFirebase('updateStatus');
    await updateDoc(doc(db, 'papers', paperId), { status, statusNote: note, updatedAt: serverTimestamp() });
  },

  async assignReviewer(paperId, reviewerId) {
    requireFirebase('assignReviewer');
    const snap = await getDoc(doc(db, 'papers', paperId));
    if (!snap.exists()) throw new Error('Paper not found');
    const reviewers = snap.data().reviewers || [];
    if (!reviewers.includes(reviewerId)) {
      await updateDoc(doc(db, 'papers', paperId), {
        reviewers: [...reviewers, reviewerId], updatedAt: serverTimestamp()
      });
    }
  },

  onPaperChange(paperId, callback) {
    if (!firebaseReady) return () => {};
    return onSnapshot(doc(db, 'papers', paperId), snap => {
      if (snap.exists()) callback({ id: snap.id, ...snap.data() });
    });
  }
};

// ── Review Services ───────────────────────────────────────────────────────────
export const ReviewService = {
  async submit(data) {
    requireFirebase('submitReview');
    return await addDoc(collection(db, 'reviews'), { ...data, submittedAt: serverTimestamp() });
  },

  async getByPaper(paperId) {
    requireFirebase('getByPaper reviews');
    const q = query(collection(db, 'reviews'), where('paperId', '==', paperId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async getByReviewer(reviewerId) {
    requireFirebase('getByReviewer reviews');
    const q = query(collection(db, 'reviews'), where('reviewerId', '==', reviewerId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
};

// ── Assignment Services ───────────────────────────────────────────────────────
export const AssignmentService = {
  async create(paperId, reviewerId, deadline) {
    requireFirebase('createAssignment');
    return await addDoc(collection(db, 'assignments'), {
      paperId, reviewerId, deadline: deadline || null,
      assignedAt: serverTimestamp(), status: 'pending'
    });
  },

  async getByReviewer(reviewerId) {
    requireFirebase('getAssignmentsByReviewer');
    const q = query(collection(db, 'assignments'), where('reviewerId', '==', reviewerId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async getByPaper(paperId) {
    requireFirebase('getAssignmentsByPaper');
    const q = query(collection(db, 'assignments'), where('paperId', '==', paperId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
};

// ── Notification Services ─────────────────────────────────────────────────────
export const NotificationService = {
  async send(uid, { title, message, type = 'info', link = null }) {
    requireFirebase('sendNotification');
    return await addDoc(collection(db, `users/${uid}/notifications`), {
      title, message, type, link, read: false, createdAt: serverTimestamp()
    });
  },

  async getForUser(uid, maxCount = 20) {
    requireFirebase('getNotifications');
    const q = query(
      collection(db, `users/${uid}/notifications`),
      orderBy('createdAt', 'desc'),
      limit(maxCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async markRead(uid, notifId) {
    requireFirebase('markRead');
    await updateDoc(doc(db, `users/${uid}/notifications`, notifId), { read: true });
  }
};

// ── Discussion Services ───────────────────────────────────────────────────────
export const DiscussionService = {
  async sendMessage(paperId, { authorId, authorName, role, message }) {
    requireFirebase('sendMessage');
    return await addDoc(collection(db, `papers/${paperId}/discussion`), {
      authorId, authorName, role, message, sentAt: serverTimestamp()
    });
  },

  onMessages(paperId, callback) {
    if (!firebaseReady) return () => {};
    const q = query(collection(db, `papers/${paperId}/discussion`), orderBy('sentAt', 'asc'));
    return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }
};

// ── Storage Service ───────────────────────────────────────────────────────────
export const StorageService = {
  uploadWithProgress(storagePath, file, onProgress) {
    requireFirebase('upload');
    const storageRef = ref(storage, storagePath);
    const task = uploadBytesResumable(storageRef, file);
    return new Promise((resolve, reject) => {
      task.on('state_changed',
        s => { if (onProgress) onProgress(Math.round((s.bytesTransferred / s.totalBytes) * 100)); },
        reject,
        async () => resolve(await getDownloadURL(task.ref))
      );
    });
  },

  async delete(filePath) {
    requireFirebase('deleteFile');
    await deleteObject(ref(storage, filePath));
  }
};

// ── AI Service (Pluggable stub) ───────────────────────────────────────────────
export const AIService = {
  /**
   * Score a paper. Replace with real API call to OpenAI / Gemini / custom NLP.
   * @returns {{ originality, quality, relevance, recommendation }}
   */
  async score(abstract, title, track) {
    // Demo: random scores. Replace this block with your NLP API call.
    // Example real implementation:
    // const res = await fetch('https://your-api.com/score', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer YOUR_KEY' },
    //   body: JSON.stringify({ abstract, title, track })
    // });
    // return await res.json();
    await new Promise(r => setTimeout(r, 600));
    const orig = 50 + Math.round(Math.random() * 45);
    const qual = 50 + Math.round(Math.random() * 45);
    const rel  = 50 + Math.round(Math.random() * 45);
    const avg  = (orig + qual + rel) / 3;
    return {
      originality:    orig,
      quality:        qual,
      relevance:      rel,
      recommendation: avg >= 72 ? 'accept' : avg >= 55 ? 'borderline' : 'reject'
    };
  }
};

// ── Exports ───────────────────────────────────────────────────────────────────
export { auth, db, storage, firebaseReady };
export default app;
