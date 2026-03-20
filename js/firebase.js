import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
  getAuth, GoogleAuthProvider, signInWithPopup,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, updateProfile
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {
  getFirestore, doc, getDoc, setDoc, updateDoc,
  collection, addDoc, getDocs, deleteDoc, query,
  where, orderBy, limit, onSnapshot, writeBatch,
  increment, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const app = initializeApp({
  apiKey: "AIzaSyAvFr1gNhM7aIB2t3UD3PL7jUX78yXU9Gw",
  authDomain: "kicen-xensai.firebaseapp.com",
  projectId: "kicen-xensai",
  storageBucket: "kicen-xensai.firebasestorage.app",
  messagingSenderId: "293669399912",
  appId: "1:293669399912:web:3543e2666a1f1ef502badd",
});

const auth = getAuth(app);
const db   = getFirestore(app);
const gp   = new GoogleAuthProvider();

const ADMIN_EMAIL = 'kikiadmin_kx@kicenxensai.internal';
const ADMIN_PASS  = 'KXadmin_2008!secure';

// ─── AUTH ─────────────────────────────────────────────────────────────────────
const Auth = {
  current: null,

  // Called once from index.html. cb fires every auth state change.
  init(cb) {
    onAuthStateChanged(auth, async firebaseUser => {
      if (firebaseUser) {
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
          this.current = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            ...(snap.exists() ? snap.data() : {}),
          };
        } catch {
          this.current = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          };
        }
      } else {
        this.current = null;
      }
      window._user = this.current;
      cb(this.current);
      // Notify any one-time auth state listener (used by login/register flow)
      if (typeof window._onNextAuthState === 'function') {
        const fn = window._onNextAuthState;
        window._onNextAuthState = null;
        fn();
      }
    });
  },

  // Login with Google popup
  async google() {
    const r = await signInWithPopup(auth, gp);
    await this._ensureDoc(r.user);
    // onAuthStateChanged will fire and update window._user automatically
    return r.user;
  },

  // Login with email/password (or admin shortcut)
  async login(email, pass) {
    const trimmed = email.trim();
    if (trimmed.toUpperCase() === 'KIKI ADMIN' && pass === 'KIKI2008') {
      return this._adminLogin();
    }
    const r = await signInWithEmailAndPassword(auth, trimmed, pass);
    return r.user;
  },

  // Register new user
  async register(email, pass, name) {
    const r = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    await updateProfile(r.user, { displayName: name });
    await this._ensureDoc(r.user, name);
    return r.user;
  },

  async logout() {
    await signOut(auth);
    this.current = null;
    window._user = null;
  },

  isAdmin() { return this.current?.role === 'admin'; },
  isBanned() { return this.current?.banned === true; },

  // ── Private helpers ──────────────────────────────────────────────────────
  async _ensureDoc(firebaseUser, name = null) {
    const ref = doc(db, 'users', firebaseUser.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid:     firebaseUser.uid,
        name:    name || firebaseUser.displayName || 'User',
        email:   firebaseUser.email,
        photo:   firebaseUser.photoURL || null,
        role:    'user',
        banned:  false,
        createdAt: serverTimestamp(),
      });
    }
  },

  async _adminLogin() {
    try {
      const r = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASS);
      await setDoc(doc(db, 'users', r.user.uid), {
        uid: r.user.uid, name: 'KIKI ADMIN',
        email: ADMIN_EMAIL, photo: null,
        role: 'admin', banned: false,
      }, { merge: true });
      return r.user;
    } catch {
      // First time: create admin account
      const r = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASS);
      await updateProfile(r.user, { displayName: 'KIKI ADMIN' });
      await setDoc(doc(db, 'users', r.user.uid), {
        uid: r.user.uid, name: 'KIKI ADMIN',
        email: ADMIN_EMAIL, photo: null,
        role: 'admin', banned: false,
        createdAt: serverTimestamp(),
      });
      return r.user;
    }
  },
};

// ─── DATABASE ──────────────────────────────────────────────────────────────
const DB = {
  // Comments
  async addComment(contentId, text) {
    if (!Auth.current) throw new Error('login');
    if (Auth.isBanned()) throw new Error('banned');
    return addDoc(collection(db, 'comments'), {
      contentId,
      uid:   Auth.current.uid,
      name:  Auth.current.name || Auth.current.displayName || 'User',
      photo: Auth.current.photo || Auth.current.photoURL || null,
      text,
      likes: 0, dislikes: 0, replies: [],
      createdAt: serverTimestamp(),
    });
  },

  listenComments(contentId, cb) {
    const q = query(
      collection(db, 'comments'),
      where('contentId', '==', contentId),
      orderBy('createdAt', 'desc'),
      limit(60)
    );
    return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  },

  async deleteComment(id) {
    await deleteDoc(doc(db, 'comments', id));
  },

  async reactComment(id, type) {
    if (!Auth.current) throw new Error('login');
    const rRef = doc(db, `comments/${id}/reactions`, Auth.current.uid);
    const prev  = await getDoc(rRef);
    const ref   = doc(db, 'comments', id);
    const field = type === 'like' ? 'likes' : 'dislikes';
    const other = type === 'like' ? 'dislikes' : 'likes';
    if (prev.exists() && prev.data().type === type) {
      await deleteDoc(rRef);
      await updateDoc(ref, { [field]: increment(-1) });
    } else {
      if (prev.exists()) await updateDoc(ref, { [other]: increment(-1) });
      await setDoc(rRef, { type });
      await updateDoc(ref, { [field]: increment(1) });
    }
  },

  async addReply(commentId, text) {
    if (!Auth.current) throw new Error('login');
    if (Auth.isBanned()) throw new Error('banned');
    const ref  = doc(db, 'comments', commentId);
    const snap = await getDoc(ref);
    const replies = [...(snap.data().replies || []), {
      uid:   Auth.current.uid,
      name:  Auth.current.name || Auth.current.displayName || 'User',
      photo: Auth.current.photo || Auth.current.photoURL || null,
      text,
      at: new Date().toISOString(),
    }];
    await updateDoc(ref, { replies });
  },

  // Watchlist
  async watchlistToggle(item) {
    if (!Auth.current) throw new Error('login');
    const id  = `${Auth.current.uid}_${item.id}_${item.category}`;
    const ref = doc(db, 'watchlist', id);
    const snap = await getDoc(ref);
    if (snap.exists()) { await deleteDoc(ref); return false; }
    await setDoc(ref, { ...item, uid: Auth.current.uid, at: serverTimestamp() });
    return true;
  },

  async inWatchlist(contentId, cat) {
    if (!Auth.current) return false;
    const snap = await getDoc(doc(db, 'watchlist', `${Auth.current.uid}_${contentId}_${cat}`));
    return snap.exists();
  },

  async getWatchlist() {
    if (!Auth.current) return [];
    const q = query(
      collection(db, 'watchlist'),
      where('uid', '==', Auth.current.uid),
      orderBy('at', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
  },

  // Admin
  async getUsers() {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  async banUser(uid, v) { await updateDoc(doc(db, 'users', uid), { banned: v }); },
  async setRole(uid, role) { await updateDoc(doc(db, 'users', uid), { role }); },
  async nukeComments(uid) {
    const q = query(collection(db, 'comments'), where('uid', '==', uid));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
  },
  async stats() {
    const [u, c] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'comments')),
    ]);
    return { users: u.size, comments: c.size };
  },
  async recentComments() {
    const q = query(collection(db, 'comments'), orderBy('createdAt', 'desc'), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
};

export { Auth, DB };
