import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, getDocs, deleteDoc, query, where, orderBy, limit, onSnapshot, writeBatch, increment, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

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

const Auth = {
  current: null,

  init(cb) {
    onAuthStateChanged(auth, async user => {
      if (user) {
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          this.current = { uid:user.uid, email:user.email, displayName:user.displayName, photoURL:user.photoURL, ...(snap.exists()?snap.data():{}) };
        } catch {
          this.current = { uid:user.uid, email:user.email, displayName:user.displayName, photoURL:user.photoURL };
        }
      } else {
        this.current = null;
      }
      window._user = this.current;
      // Notify one-time listener (used after login/register)
      if (typeof window._onNextAuth === 'function') {
        const fn = window._onNextAuth;
        window._onNextAuth = null;
        fn(this.current);
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
    if (email.trim().toUpperCase() === 'KIKI ADMIN' && pass === 'KIKI2008') return this._adminLogin();
    const r = await signInWithEmailAndPassword(auth, email.trim(), pass);
    return r.user;
  },

  async register(email, pass, name) {
    const r = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    await updateProfile(r.user, { displayName: name });
    await this._ensure(r.user, name);
    return r.user;
  },

  async logout() { await signOut(auth); this.current = null; window._user = null; },

  isAdmin()  { return this.current?.role === 'admin'; },
  isBanned() { return this.current?.banned === true; },

  async _ensure(user, name=null) {
    const ref = doc(db, 'users', user.uid);
    if (!(await getDoc(ref)).exists()) {
      await setDoc(ref, { uid:user.uid, name:name||user.displayName||'User', email:user.email, photo:user.photoURL||null, role:'user', banned:false, createdAt:serverTimestamp() });
    }
  },

  async _adminLogin() {
    try {
      const r = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASS);
      await setDoc(doc(db,'users',r.user.uid), { uid:r.user.uid, name:'KIKI ADMIN', email:ADMIN_EMAIL, photo:null, role:'admin', banned:false }, {merge:true});
      return r.user;
    } catch {
      const r = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASS);
      await updateProfile(r.user, { displayName:'KIKI ADMIN' });
      await setDoc(doc(db,'users',r.user.uid), { uid:r.user.uid, name:'KIKI ADMIN', email:ADMIN_EMAIL, photo:null, role:'admin', banned:false, createdAt:serverTimestamp() });
      return r.user;
    }
  },
};

const DB = {
  async addComment(cid, text) {
    if (!Auth.current) throw new Error('login');
    if (Auth.isBanned()) throw new Error('banned');
    return addDoc(collection(db,'comments'), { contentId:cid, uid:Auth.current.uid, name:Auth.current.name||Auth.current.displayName||'User', photo:Auth.current.photo||Auth.current.photoURL||null, text, likes:0, dislikes:0, replies:[], createdAt:serverTimestamp() });
  },
  listenComments(cid, cb) {
    const q = query(collection(db,'comments'), where('contentId','==',cid), orderBy('createdAt','desc'), limit(60));
    return onSnapshot(q, snap => cb(snap.docs.map(d=>({id:d.id,...d.data()}))));
  },
  async deleteComment(id) { await deleteDoc(doc(db,'comments',id)); },
  async reactComment(id, type) {
    if (!Auth.current) throw new Error('login');
    const rRef = doc(db,`comments/${id}/reactions`,Auth.current.uid);
    const prev = await getDoc(rRef);
    const ref  = doc(db,'comments',id);
    const f = type==='like'?'likes':'dislikes', o = type==='like'?'dislikes':'likes';
    if (prev.exists()&&prev.data().type===type) { await deleteDoc(rRef); await updateDoc(ref,{[f]:increment(-1)}); }
    else { if(prev.exists()) await updateDoc(ref,{[o]:increment(-1)}); await setDoc(rRef,{type}); await updateDoc(ref,{[f]:increment(1)}); }
  },
  async addReply(cid, text) {
    if (!Auth.current) throw new Error('login');
    const ref = doc(db,'comments',cid);
    const snap = await getDoc(ref);
    const replies = [...(snap.data().replies||[]), { uid:Auth.current.uid, name:Auth.current.name||Auth.current.displayName||'User', photo:Auth.current.photo||Auth.current.photoURL||null, text, at:new Date().toISOString() }];
    await updateDoc(ref, { replies });
  },
  async watchlistToggle(item) {
    if (!Auth.current) throw new Error('login');
    const id = `${Auth.current.uid}_${item.slug}`;
    const ref = doc(db,'watchlist',id);
    if ((await getDoc(ref)).exists()) { await deleteDoc(ref); return false; }
    await setDoc(ref, { ...item, uid:Auth.current.uid, at:serverTimestamp() });
    return true;
  },
  async inWatchlist(slug) {
    if (!Auth.current) return false;
    return (await getDoc(doc(db,'watchlist',`${Auth.current.uid}_${slug}`))).exists();
  },
  async getWatchlist() {
    if (!Auth.current) return [];
    const snap = await getDocs(query(collection(db,'watchlist'), where('uid','==',Auth.current.uid), orderBy('at','desc')));
    return snap.docs.map(d=>d.data());
  },
  async getUsers()        { return (await getDocs(collection(db,'users'))).docs.map(d=>({id:d.id,...d.data()})); },
  async banUser(uid,v)    { await updateDoc(doc(db,'users',uid),{banned:v}); },
  async setRole(uid,role) { await updateDoc(doc(db,'users',uid),{role}); },
  async nukeComments(uid) {
    const snap = await getDocs(query(collection(db,'comments'),where('uid','==',uid)));
    const b = writeBatch(db); snap.docs.forEach(d=>b.delete(d.ref)); await b.commit();
  },
  async stats() {
    const [u,c] = await Promise.all([getDocs(collection(db,'users')),getDocs(collection(db,'comments'))]);
    return { users:u.size, comments:c.size };
  },
  async recentComments() {
    return (await getDocs(query(collection(db,'comments'),orderBy('createdAt','desc'),limit(100)))).docs.map(d=>({id:d.id,...d.data()}));
  },
};

export { Auth, DB };
