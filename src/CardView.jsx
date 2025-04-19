import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "./firebase";  // firebase.jsをインポート
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";

const speak = (text) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = /[^\x00-\x7F]/.test(text) ? "ja-JP" : "en-US";
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
};

const CardView = ({ cards, setCards }) => {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const currentCard = cards[index];

  useEffect(() => {
    if (currentCard) {
      speak(flipped ? currentCard.back : currentCard.front);
    }
  }, [index, flipped, currentCard]);

  // カードデータの取得（Firestoreから）
  useEffect(() => {
    const fetchCards = async () => {
      const cardsCollection = collection(db, "cards");
      const snapshot = await getDocs(cardsCollection);
      const fetchedCards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCards(fetchedCards);
    };

    fetchCards();
  }, [setCards]);

  // カード削除
  const deleteCard = async (id) => {
    try {
      const cardDoc = doc(db, "cards", id);
      await deleteDoc(cardDoc);
      setCards(cards.filter(card => card.id !== id));  // ローカルの状態も更新
    } catch (error) {
      console.error("Error removing card: ", error);
    }
  };

  const next = () => {
    if (index < cards.length - 1) {
      setIndex(index + 1);
      setFlipped(false);
    }
  };

  const prev = () => {
    if (index > 0) {
      setIndex(index - 1);
      setFlipped(false);
    }
  };

  if (!currentCard) {
    return <div>カードがありません</div>;
  }

  return (
    <div className="card-container">
      <div className="card" onClick={() => setFlipped(!flipped)}>
        {flipped ? currentCard.back : currentCard.front}
      </div>
      <div className="buttons">
        <button onClick={prev}>← 戻る</button>
        <button onClick={next}>進む →</button>
      </div>
      <div className="card-actions">
        <button onClick={() => deleteCard(currentCard.id)}>削除</button>
      </div>
      <Link to="/edit">
        <button className="edit-button">編集</button>
      </Link>
    </div>
  );
};

export default CardView;
