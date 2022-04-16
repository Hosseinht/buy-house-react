import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBjwrCDv194_qwofNDKjKzgH4PCjD-reQg",
    authDomain: "house-marketplace-app-beafd.firebaseapp.com",
    projectId: "house-marketplace-app-beafd",
    storageBucket: "house-marketplace-app-beafd.appspot.com",
    messagingSenderId: "650633385967",
    appId: "1:650633385967:web:8cae9df590db6333fb481a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore()
// firestore is database