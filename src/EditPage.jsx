import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "./firebase";  // firebase.jsをインポート
import { collection, addDoc, deleteDoc, doc, getDocs } from "firebase/firestore";

const EditPage = ({ cards, setCards }) => {
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");

  // Firestoreからカードデータを取得
  useEffect(() => {
    const fetchCards = async () => {
      const cardsCollection = collection(db, "cards");
      const snapshot = await getDocs(cardsCollection);
      const fetchedCards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCards(fetchedCards);
    };

    fetchCards();
  }, [setCards]);

  // 新しいカードをFirestoreに追加
  const addCard = async () => {
    if (newFront && newBack) {
      try {
        const newCard = {
          front: newFront,
          back: newBack,
          checked: false,
        };
        const docRef = await addDoc(collection(db, "cards"), newCard);
        setCards([...cards, { id: docRef.id, ...newCard }]);
        setNewFront("");
        setNewBack("");
      } catch (error) {
        console.error("Error adding card: ", error);
      }
    }
  };

  // Firestoreからカードを削除
  const deleteCard = async (id) => {
    try {
      const cardDoc = doc(db, "cards", id);
      await deleteDoc(cardDoc);
      setCards(cards.filter((card) => card.id !== id));
    } catch (error) {
      console.error("Error deleting card: ", error);
    }
  };

  return (
    <div className="edit-page">
      <h2>カードの編集</h2>
      <div className="add-card">
        <input
          type="text"
          placeholder="表面"
          value={newFront}
          onChange={(e) => setNewFront(e.target.value)}
        />
        <input
          type="text"
          placeholder="裏面"
          value={newBack}
          onChange={(e) => setNewBack(e.target.value)}
        />
        <button onClick={addCard}>追加</button>
      </div>

      <ul className="card-list">
        {cards.map((card) => (
          <li key={card.id}>
            {card.front} - {card.back}
            <button onClick={() => deleteCard(card.id)}>削除</button>
          </li>
        ))}
      </ul>

      <Link to="/">
        <button>カード表示に戻る</button>
      </Link>
    </div>
  );
};

export default EditPage;
