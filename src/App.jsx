import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { cardCollection, db } from "./firebase"; // firebase.jsからインポート
import CardView from "./CardView";
import EditPage from "./EditPage";
import "./App.css";

const App = () => {
  const [cards, setCards] = useState([]);

  // 初回読み込み時にFirestoreからカードを取得
  useEffect(() => {
    const fetchCards = async () => {
      const snapshot = await getDocs(cardCollection);
      const fetchedCards = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCards(fetchedCards);
    };

    fetchCards();
  }, []);

  // カードをFirestoreに追加
  const addCard = async (newCard) => {
    if (newCard.front && newCard.back) {
      await addDoc(cardCollection, {
        front: newCard.front,
        back: newCard.back,
        checked: false,
      });
      // Firestoreから最新データを取得
      const snapshot = await getDocs(cardCollection);
      const updatedCards = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCards(updatedCards);
    }
  };

  // カードをFirestoreから削除
  const deleteCard = async (id) => {
    const cardDoc = doc(db, "cards", id);
    await deleteDoc(cardDoc);
    // Firestoreから最新データを取得
    const snapshot = await getDocs(cardCollection);
    const updatedCards = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCards(updatedCards);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <CardView
              cards={cards.filter(
                (c) => c.checked || cards.every((c) => !c.checked)
              )}
              deleteCard={deleteCard}
            />
          }
        />
        <Route
          path="/edit"
          element={<EditPage cards={cards} setCards={setCards} addCard={addCard} />}
        />
      </Routes>
    </Router>
  );
};

export default App;
