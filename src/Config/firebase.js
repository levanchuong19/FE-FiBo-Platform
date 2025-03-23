// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAGfusho6cEnebWSc8BXmIAOaalagV_gm0",
  authDomain: "pet-management-628af.firebaseapp.com",
  projectId: "pet-management-628af",
  storageBucket: "pet-management-628af.appspot.com",
  messagingSenderId: "438552630531",
  appId: "1:438552630531:web:99ed52729956b449d08536",
  measurementId: "G-R2C4VEE9TY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();
const auth = getAuth();
export {storage, googleProvider,auth};