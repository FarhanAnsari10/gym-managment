// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// // import ReactNativeAsyncStorage from "@firebase-native-async-storage/async-storage";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// import { initializeAuth, getReactNativePersistence } from "firebase/auth";
// import{ getFirestore } from 'firebase/firestore'




// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyCnkw8TwoB2BcHSqGDS6qIfxHHeXw_f9U4",
//   authDomain: "gym-management-49109.firebaseapp.com",
//   projectId: "gym-management-49109",
//   storageBucket: "gym-management-49109.firebasestorage.app",
//   messagingSenderId: "433938893587",
//   appId: "1:433938893587:web:d992825f727210af13e8e6",
//   measurementId: "G-8P25C7LY3G"
// };

// const app = initializeApp(firebaseConfig);
// export const auth = initializeAuth(app,{
//     persistence : getReactNativePersistence(AsyncStorage)
// });
// export const db=getFirestore(app);


import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCnkw8TwoB2BcHSqGDS6qIfxHHeXw_f9U4",
  authDomain: "gym-management-49109.firebaseapp.com",
  projectId: "gym-management-49109",
  storageBucket: "gym-management-49109.appspot.com",
  messagingSenderId: "433938893587",
  appId: "1:433938893587:web:d992825f727210af13e8e6",
  measurementId: "G-8P25C7LY3G"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
// export const auth = getAuth(app);
export const db = getFirestore(app);