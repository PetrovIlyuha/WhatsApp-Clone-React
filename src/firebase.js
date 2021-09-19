import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/database';
import { AUDIOS, IMAGES } from './firebase-constants';

const firebaseConfig = {
  apiKey: 'AIzaSyBmb1Uw49c8-sBq4sQXYRDhtQLZvcE3bWI',
  authDomain: 'whatsapp-clone-aa50e.firebaseapp.com',
  projectId: 'whatsapp-clone-aa50e',
  storageBucket: 'whatsapp-clone-aa50e.appspot.com',
  messagingSenderId: '361401889826',
  appId: '1:361401889826:web:c1fce133ebabb1d21c067b',
};

// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);
const database = firebaseApp.firestore();
const auth = firebaseApp.auth();
const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
const imagesStorage = firebase.storage().ref(IMAGES);
const audioStorage = firebase.storage().ref(AUDIOS);
const createTimestamp = firebase.firestore.FieldValue.serverTimestamp;
const serverTimestamp = firebase.database.ServerValue.TIMESTAMP;

export {
  database,
  auth,
  googleAuthProvider,
  imagesStorage,
  audioStorage,
  createTimestamp,
  serverTimestamp,
};
