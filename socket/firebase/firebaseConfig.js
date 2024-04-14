// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCtfL3JZVk9bTXUl9P0sbOLBtixCggp-3g",
    authDomain: "peerlink-9f2dd.firebaseapp.com",
    projectId: "peerlink-9f2dd",
    storageBucket: "peerlink-9f2dd.appspot.com",
    messagingSenderId: "701029515178",
    appId: "1:701029515178:web:5dbc3c6b91740dad1fb5d3",
    measurementId: "G-5K4RGTDK62"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)
// const analytics = getAnalytics(app);