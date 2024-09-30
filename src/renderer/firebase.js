// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAWxOAtAN7S-nBBmwma1XYjJxC8RcN81TE",
    authDomain: "workfolio-1fff1.firebaseapp.com",
    projectId: "workfolio-1fff1",
    storageBucket: "workfolio-1fff1.appspot.com",
    messagingSenderId: "142716499929",
    appId: "1:142716499929:web:723fec30b5d83fb7180bc8"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);
const db  = getFirestore(app);
const storage  =getStorage(app);

export { auth,db,storage};