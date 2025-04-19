import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

const speak = (text) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = /[^\x00-\x7F]/.test(text) ? "ja-JP" : "en-US";
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
};

const CardView = ({ cards, setCards }) => {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [shuffledCards, setShuffledCards] = useState([]);

  const currentCard = shuffledCards[index];

  useEffect(() => {
    // カード順をランダムにシャッフル
    if (cards.length > 0) {
      setShuffledCards([...cards].sort(() => Math.random() - 0.5));
      setIndex(0); // 最初のカードに戻す
    }
  }, [cards]);

  useEffect(() => {
    if (currentCard) {
      speak(flipped ? currentCard.back : currentCard.front);
    }
  }, [index, flipped, currentCard]);

  // Firestoreからカードデータ取得
  useEffect(() => {
    const fetchCards = async () => {
      const cardsCollection = collection(db, "cards");
      const snapshot = await getDocs(cardsCollection);
      const fetchedCards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCards(fetchedCards);
    };

    fetchCards();
  }, [setCards]);

  const next = () => {
    if (index < shuffledCards.length - 1) {
      setIndex(index + 1);
      setFlipped(false);
    } else {
      // 最後のカードに到達 → シャッフルしてリセット
      setShuffledCards([...cards].sort(() => Math.random() - 0.5));
      setIndex(0);
      setFlipped(false);
    }
  };

  const prev = () => {
    if (index > 0) {
      setIndex(index - 1);
      setFlipped(false);
    }
  };

  // カードがない場合の表示
  if (!currentCard) {
    return (
      <div className="card-container">
        <div>カードがありません</div>
        <Link to="/edit">
          <button className="edit-button">編集</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="card-container">
      <div className="card" onClick={() => setFlipped(!flipped)}>
        {flipped ? currentCard.back : currentCard.front}
      </div>
      <div className="card-navigation">
        <p>{index + 1} / {shuffledCards.length}</p>
        <div className="buttons">
          <button onClick={prev}>← 戻る</button>
          <button onClick={next}>進む →</button>
        </div>
      </div>
      <Link to="/edit">
        <button className="edit-button">編集</button>
      </Link>
    </div>
  );
};

export default CardView;
