import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB9kiShl2Oyl5RGIIuM2DpUI2F9LPiw_iA",
  authDomain: "trackko-2bdaf.firebaseapp.com",
  projectId: "trackko-2bdaf",
  storageBucket: "trackko-2bdaf.appspot.com",
  messagingSenderId: "633500813326",
  appId: "1:633500813326:web:41798f939586d0ee21145f",
  measurementId: "G-TT93RXF26K",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    loginBtn.click();

    signupBtn.click();
  }
});

document.getElementById("togglePass").addEventListener("click", () => {
  const pass = document.getElementById("password");
  pass.type = pass.type === "password" ? "text" : "password";
  document.getElementById("togglePass").classList.toggle("fa-eye-slash");
});

document.getElementById("toggleLoginPass").addEventListener("click", () => {
  const pass = document.getElementById("loginPassword");
  pass.type = pass.type === "password" ? "text" : "password";
  document.getElementById("toggleLoginPass").classList.toggle("fa-eye-slash");
});

document.getElementById("toLogin").addEventListener("click", () => {
  signupForm.style.display = "none";
  loginForm.style.display = "flex";
});

document.getElementById("toSignup").addEventListener("click", () => {
  loginForm.style.display = "none";
  signupForm.style.display = "flex";
});

document.getElementById("signupBtn").addEventListener("click", async () => {
  const nickname = document.getElementById("nickname").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("signupMessage");

  if (!nickname || !email || !password) {
    msg.style.color = "red";
    msg.innerText = "Please fill all fields";
    return;
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    msg.style.color = "red";
    msg.innerText = "Please enter a valid email";
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    console.log("User created:", user.uid);

    await setDoc(doc(db, "users", user.uid), { nickname, email });

    localStorage.setItem("nickname", nickname);
    localStorage.setItem("uid", user.uid);
    console.log("Nickname saved in Firestore:", nickname);

    msg.style.color = "green";
    msg.innerText = "✅ Account created successfully! Redirecting to login...";

    document.getElementById("nickname").value = "";
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";

    setTimeout(() => {
      signupForm.style.display = "none";
      loginForm.style.display = "flex";
      msg.innerText = "";
    }, 1500);
  } catch (err) {
    console.error("Signup error:", err);
    msg.style.color = "red";
    msg.innerText = err.message;
  }
});

document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const msg = document.getElementById("loginMessage");

  if (!email || !password) {
    msg.style.color = "red";
    msg.innerText = "Please fill all fields";
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const uid = userCredential.user.uid;

    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      localStorage.setItem("nickname", data.nickname);
      localStorage.setItem("uid", uid);
    }

    msg.style.color = "green";
    msg.innerText = "Login successful! Redirecting...";

    setTimeout(() => (window.location.href = "dashboard.html"), 1000);
  } catch (err) {
    msg.style.color = "red";
    msg.innerText = err.message;
  }
});
