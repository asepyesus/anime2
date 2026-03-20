import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const app = initializeApp({
  apiKey: "AIzaSyAvFr1gNhM7aIB2t3UD3PL7jUX78yXU9Gw",
  authDomain: "kicen-xensai.firebaseapp.com",
  projectId: "kicen-xensai",
  storageBucket: "kicen-xensai.firebasestorage.app",
  messagingSenderId: "293669399912",
  appId: "1:293669399912:web:3543e2666a1f1ef502badd",
});

const auth = getAuth(app);
const db = getFirestore(app);
const gp = new GoogleAuthProvider();

const ADMIN_EMAIL = 'kikiadmin_internal@kicenxensai.app';
const ADMIN_PASS  = 'KX_kiki2008_ADMIN!';

const Auth = {
  current: null,

  init(cb) {
    onAuthStateChanged(auth, async user => {
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        this.current = { uid: user.uid, email: user.email, displayName: user.displayName, photoURL: user.photoURL, ...snap.data() };
      } else {
        this.current = null;
      }
      cb(this.current);
    });
  },

  async google() {
    const r = await signInWithPopup(auth, gp);
    await this._ensure(r.user);
    return r.user;
  },

  async login(email, pass) {
    // Admin shortcut
    if (email.trim().toUpperCase() === 'KIKI ADMIN' && pass === 'KIKI2008') {
      return this._adminLogin();
    }
    const r = await signInWithEmailAndPassword(auth, email, pass);
    return r.user;
  },

  async _adminLogin() {
    try {
      const r = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASS);
      await setDoc(doc(db,'users',r.user.uid), { uid:r.user.uid, name:'KIKI ADMIN', email:ADMIN_EMAIL, photo:null, role:'admin', banned:false }, {merge:true});
      return r.user;
    } catch {
      const r = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASS);
      await updateProfile(r.user, { displayName: 'KIKI ADMIN' });
      await setDoc(doc(db,'users',r.user.uid), { uid:r.user.uid, name:'KIKI ADMIN', email:ADMIN_EMAIL, photo:null, role:'admin', banned:false, createdAt:serverTimestamp() });
      return r.user;
    }
  },

  async register(email, pass, name) {
    const r = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(r.user, { displayName: name });
    await this._ensure(r.user, name);
    return r.user;
  },

  async logout() { await signOut(auth); this.current = null; },

  async _ensure(user, name=null) {
    const ref = doc(db, 'users', user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { uid:user.uid, name:name||user.displayName||'User', email:user.email, photo:user.photoURL||null, role:'user', banned:false, createdAt:serverTimestamp() });
    }
  },

  isAdmin() { return this.current?.role === 'admin'; },
  isBanned() { return this.current?.banned === true; },
};

import { collection, addDoc, getDocs, query, where, orderBy, limit, onSnapshot, deleteDoc, writeBatch, increment, getDoc as gd, setDoc as sd } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const DB = {
  // Comments
  async addComment(cid, text) {
    if (!Auth.current) throw new Error('login');
    if (Auth.isBanned()) throw new Error('banned');
    return addDoc(collection(db,'comments'), {
      contentId: cid, uid: Auth.current.uid,
      name: Auth.current.name||Auth.current.displayName,
      photo: Auth.current.photo||Auth.current.photoURL||null,
      text, likes:0, dislikes:0, replies:[],
      createdAt: serverTimestamp(),
    });
  },

  listenComments(cid, cb) {
    const q = query(collection(db,'comments'), where('contentId','==',cid), orderBy('createdAt','desc'), limit(60));
    return onSnapshot(q, snap => cb(snap.docs.map(d=>({id:d.id,...d.data()}))));
  },

  async deleteComment(id) { await deleteDoc(doc(db,'comments',id)); },

  async reactComment(id, type) {
    if (!Auth.current) throw new Error('login');
    const rRef = doc(db,`comments/${id}/reactions`,Auth.current.uid);
    const prev = await gd(rRef);
    const ref = doc(db,'comments',id);
    const field = type==='like'?'likes':'dislikes';
    const other = type==='like'?'dislikes':'likes';
    if (prev.exists() && prev.data().type===type) {
      await deleteDoc(rRef);
      await updateDoc(ref,{[field]:increment(-1)});
    } else {
      if (prev.exists()) await updateDoc(ref,{[other]:increment(-1)});
      await sd(rRef,{type});
      await updateDoc(ref,{[field]:increment(1)});
    }
  },

  async addReply(cid, text) {
    if (!Auth.current) throw new Error('login');
    if (Auth.isBanned()) throw new Error('banned');
    const ref = doc(db,'comments',cid);
    const snap = await gd(ref);
    const replies = [...(snap.data().replies||[]), {
      uid:Auth.current.uid, name:Auth.current.name||Auth.current.displayName,
      photo:Auth.current.photo||Auth.current.photoURL||null, text, at:new Date().toISOString()
    }];
    await updateDoc(ref,{replies});
  },

  // Watchlist
  async watchlistToggle(item) {
    if (!Auth.current) throw new Error('login');
    const id = `${Auth.current.uid}_${item.id}_${item.category}`;
    const ref = doc(db,'watchlist',id);
    const snap = await gd(ref);
    if (snap.exists()) { await deleteDoc(ref); return false; }
    await sd(ref, {...item, uid:Auth.current.uid, at:serverTimestamp()});
    return true;
  },
  async inWatchlist(id, cat) {
    if (!Auth.current) return false;
    const snap = await gd(doc(db,'watchlist',`${Auth.current.uid}_${id}_${cat}`));
    return snap.exists();
  },
  async getWatchlist() {
    if (!Auth.current) return [];
    const q = query(collection(db,'watchlist'), where('uid','==',Auth.current.uid), orderBy('at','desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d=>d.data());
  },

  // Admin
  async getUsers() {
    const snap = await getDocs(collection(db,'users'));
    return snap.docs.map(d=>({id:d.id,...d.data()}));
  },
  async banUser(uid, v) { await updateDoc(doc(db,'users',uid),{banned:v}); },
  async setRole(uid, role) { await updateDoc(doc(db,'users',uid),{role}); },
  async nukeComments(uid) {
    const q = query(collection(db,'comments'),where('uid','==',uid));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach(d=>batch.delete(d.ref));
    await batch.commit();
  },
  async stats() {
    const [u,c] = await Promise.all([getDocs(collection(db,'users')), getDocs(collection(db,'comments'))]);
    return { users:u.size, comments:c.size };
  },
  async recentComments() {
    const q = query(collection(db,'comments'), orderBy('createdAt','desc'), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map(d=>({id:d.id,...d.data()}));
  },
};

export { Auth, DB };
