import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { cardCollection, db } from "./firebase"; // firebase.jsからインポート
import CardView from "./CardView";
import EditPage from "./EditPage";
import "./App.css";

const App = () => {
  const [cards, setCards] = useState([]);

  // Firestoreからカードを取得
  const fetchCards = async () => {
    const snapshot = await getDocs(cardCollection);
    const fetchedCards = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCards(fetchedCards);
  };

  useEffect(() => {
    fetchCards();
  }, []);

  // カードを追加
  const addCard = async (newCard) => {
    if (newCard.front && newCard.back) {
      await addDoc(cardCollection, {
        front: newCard.front,
        back: newCard.back,
        checked: false,
      });
      fetchCards(); // 再取得
    }
  };

  // カードを削除
  const deleteCard = async (id) => {
    const cardDoc = doc(db, "cards", id);
    await deleteDoc(cardDoc);
    fetchCards(); // 再取得
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
          element={
            <EditPage
              cards={cards}
              setCards={setCards}
              addCard={addCard}
            />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
