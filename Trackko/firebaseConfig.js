// firebaseConfig.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyB9kiShl2Oyl5RGIIuM2DpUI2F9LPiw_iA",
  authDomain: "trackko-2bdaf.firebaseapp.com",
  projectId: "trackko-2bdaf",
  storageBucket: "trackko-2bdaf.appspot.com",
  messagingSenderId: "633500813326",
  appId: "1:633500813326:web:41798f939586d0ee21145f",
  measurementId: "G-TT93RXF26K",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
