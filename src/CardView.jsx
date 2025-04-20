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
    if (cards.length > 0) {
      setShuffledCards([...cards].sort(() => Math.random() - 0.5));
      setIndex(0);
    }
  }, [cards]);

  useEffect(() => {
    if (currentCard) {
      speak(flipped ? currentCard.back : currentCard.front);
    }
  }, [index, flipped, currentCard]);

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
    <div className="card-container" style={{ textAlign: "center", marginTop: "20px" }}>
      <div
        className="card"
        onClick={() => setFlipped(!flipped)}
        style={{
          width: "400px",
          height: "400px",
          margin: "0 auto",
          border: "2px solid #333",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "10pt",
          cursor: "pointer",
          backgroundColor: "#f9f9f9",
          userSelect: "none",
          borderRadius: "12px",
          overflow: "hidden"
        }}
      >
        {flipped ? (
          currentCard.back
        ) : currentCard.image ? (
          <img
            src={currentCard.image}
            alt="card front"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          currentCard.front
        )}
      </div>

      <div className="card-navigation" style={{ marginTop: "20px" }}>
        <p>{index + 1} / {shuffledCards.length}</p>
        <div className="buttons" style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button onClick={prev}>← 戻る</button>
          <button onClick={next}>進む →</button>
        </div>
      </div>

      <Link to="/edit">
        <button className="edit-button" style={{ marginTop: "20px" }}>編集</button>
      </Link>
    </div>
  );
};

export default CardView;
