// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";

// Firebaseの設定情報（Firebase Consoleからコピーした設定情報を貼り付け）
const firebaseConfig = {
    apiKey: "AIzaSyA2z9qwRXUhctiVN1uQ2wjAZFmBTnJnz7w",
    authDomain: "card-785eb.firebaseapp.com",
    projectId: "card-785eb",
    storageBucket: "card-785eb.firebasestorage.app",
    messagingSenderId: "295950025850",
    appId: "1:295950025850:web:dee87a709d9055e9cc67c3"
  };

// Firebaseの初期化
const app = initializeApp(firebaseConfig);

// Firestoreのインスタンスを取得
const db = getFirestore(app);

// Firestoreのコレクションの参照を取得（カード用）
const cardCollection = collection(db, "cards");

export { db, cardCollection, getDocs, addDoc, updateDoc, doc, deleteDoc };
