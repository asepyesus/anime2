import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore, collection, doc, addDoc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp, increment } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyAvFr1gNhM7aIB2t3UD3PL7jUX78yXU9Gw",
  authDomain: "kicen-xensai.firebaseapp.com",
  projectId: "kicen-xensai",
  storageBucket: "kicen-xensai.firebasestorage.app",
  messagingSenderId: "293669399912",
  appId: "1:293669399912:web:3543e2666a1f1ef502badd",
  measurementId: "G-4C85BBLKV5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// ─── AUTH ───
const Auth = {
  current: null,

  init(callback) {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        this.current = { ...user, ...snap.data(), uid: user.uid };
      } else {
        this.current = null;
      }
      callback(this.current);
    });
  },

  async loginGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    await this._ensureUserDoc(result.user);
    return result.user;
  },

  async loginEmail(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  },

  async registerEmail(email, password, name) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    await this._ensureUserDoc(result.user, name);
    return result.user;
  },

  async logout() {
    await signOut(auth);
    this.current = null;
  },

  async _ensureUserDoc(user, name = null) {
    const ref = doc(db, 'users', user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid: user.uid,
        name: name || user.displayName || 'User',
        email: user.email,
        photo: user.photoURL || null,
        role: 'user',
        banned: false,
        createdAt: serverTimestamp(),
      });
    }
  },

  isAdmin() {
    return this.current?.role === 'admin';
  },

  isBanned() {
    return this.current?.banned === true;
  },
};

// ─── FIRESTORE HELPERS ───
const DB = {
  // Comments
  async addComment(contentId, text) {
    if (!Auth.current) throw new Error('Harus login dulu');
    if (Auth.isBanned()) throw new Error('Akun kamu dibanned');
    return addDoc(collection(db, 'comments'), {
      contentId,
      uid: Auth.current.uid,
      name: Auth.current.name || Auth.current.displayName,
      photo: Auth.current.photo || Auth.current.photoURL || null,
      text,
      likes: 0,
      dislikes: 0,
      replies: [],
      createdAt: serverTimestamp(),
    });
  },

  listenComments(contentId, callback) {
    const q = query(
      collection(db, 'comments'),
      where('contentId', '==', contentId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  },

  async deleteComment(id) {
    await deleteDoc(doc(db, 'comments', id));
  },

  async reactComment(id, type) {
    if (!Auth.current) throw new Error('Harus login dulu');
    const ref = doc(db, 'comments', id);
    const reactRef = doc(db, `comments/${id}/reactions`, Auth.current.uid);
    const prev = await getDoc(reactRef);

    if (prev.exists() && prev.data().type === type) {
      await deleteDoc(reactRef);
      await updateDoc(ref, { [type === 'like' ? 'likes' : 'dislikes']: increment(-1) });
    } else {
      if (prev.exists()) {
        const old = prev.data().type;
        await updateDoc(ref, { [old === 'like' ? 'likes' : 'dislikes']: increment(-1) });
      }
      await setDoc(reactRef, { type });
      await updateDoc(ref, { [type === 'like' ? 'likes' : 'dislikes']: increment(1) });
    }
  },

  async addReply(commentId, text) {
    if (!Auth.current) throw new Error('Harus login dulu');
    if (Auth.isBanned()) throw new Error('Akun kamu dibanned');
    const ref = doc(db, 'comments', commentId);
    const snap = await getDoc(ref);
    const replies = snap.data().replies || [];
    replies.push({
      uid: Auth.current.uid,
      name: Auth.current.name || Auth.current.displayName,
      photo: Auth.current.photo || Auth.current.photoURL || null,
      text,
      createdAt: new Date().toISOString(),
    });
    await updateDoc(ref, { replies });
  },

  // Watchlist
  async toggleWatchlist(item) {
    if (!Auth.current) throw new Error('Harus login dulu');
    const id = `${Auth.current.uid}_${item.id}_${item.category}`;
    const ref = doc(db, 'watchlist', id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await deleteDoc(ref);
      return false;
    } else {
      await setDoc(ref, { ...item, uid: Auth.current.uid, addedAt: serverTimestamp() });
      return true;
    }
  },

  async getWatchlist() {
    if (!Auth.current) return [];
    const q = query(collection(db, 'watchlist'), where('uid', '==', Auth.current.uid), orderBy('addedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
  },

  async isInWatchlist(contentId, category) {
    if (!Auth.current) return false;
    const id = `${Auth.current.uid}_${contentId}_${category}`;
    const snap = await getDoc(doc(db, 'watchlist', id));
    return snap.exists();
  },

  // Admin
  async getAllUsers() {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async banUser(uid, banned) {
    await updateDoc(doc(db, 'users', uid), { banned });
  },

  async setRole(uid, role) {
    await updateDoc(doc(db, 'users', uid), { role });
  },

  async deleteUserComments(uid) {
    const q = query(collection(db, 'comments'), where('uid', '==', uid));
    const snap = await getDocs(q);
    await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
  },

  async getStats() {
    const [users, comments] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'comments')),
    ]);
    return {
      users: users.size,
      comments: comments.size,
    };
  },
};

export { Auth, DB };
