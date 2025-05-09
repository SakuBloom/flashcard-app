import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

let voices = [];

const loadVoices = () => {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    let id;

    const checkVoices = () => {
      voices = synth.getVoices();
      if (voices.length > 0) {
        clearInterval(id);
        resolve(voices);
      }
    };

    id = setInterval(checkVoices, 100);
  });
};

const speakText = async (text) => {
  if (!text) return;
  await loadVoices();

  const utterance = new SpeechSynthesisUtterance(text);
  const isJapanese = /[^\x00-\x7F]/.test(text);
  utterance.lang = isJapanese ? "ja-JP" : "en-US";

  // 声を設定（自然な声を優先）
  const preferredVoice = voices.find((v) =>
    isJapanese
      ? v.lang === "ja-JP" && v.name.includes("Google")
      : v.lang.startsWith("en") && v.name.includes("Google")
  );
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
};

const CardView = ({ cards, setCards }) => {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [shuffledCards, setShuffledCards] = useState([]);
  const navigate = useNavigate();

  const currentCard = shuffledCards[index];

  useEffect(() => {
    const fetchCards = async () => {
      const cardsCollection = collection(db, "cards");
      const snapshot = await getDocs(cardsCollection);
      const fetchedCards = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCards(fetchedCards);
    };

    fetchCards();
  }, [setCards]);

  useEffect(() => {
    if (cards.length > 0) {
      const shuffled = [...cards].sort(() => Math.random() - 0.5);
      setShuffledCards(shuffled);
      setIndex(0);
    }
  }, [cards]);

  useEffect(() => {
    if (currentCard && (currentCard.front || currentCard.back)) {
      const text = flipped ? currentCard.back : currentCard.front;
      speakText(text.trim());
    }
  }, [index, flipped, currentCard]);

  const next = () => {
    if (index < shuffledCards.length - 1) {
      setIndex(index + 1);
      setFlipped(false);
    } else {
      const reshuffled = [...cards].sort(() => Math.random() - 0.5);
      setShuffledCards(reshuffled);
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

  const handleEditClick = () => {
    const password = prompt("パスワードを入力してください:");
    if (password === "0816") {
      navigate("/edit");
    } else if (password !== null) {
      alert("パスワードが間違っています。");
    }
  };

  if (!currentCard) {
    return (
      <div className="card-container">
        <div>カードがありません</div>
        <button className="edit-button" onClick={handleEditClick}>
          編集
        </button>
      </div>
    );
  }

  return (
    <div
      className="card-container"
      style={{ textAlign: "center", marginTop: "20px" }}
    >
      <div
        className="card"
        onClick={() => setFlipped(!flipped)}
        style={{
          width: "300px",
          height: "300px",
          margin: "0 auto",
          border: "2px solid #333",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16pt",
          cursor: "pointer",
          backgroundColor: "#f9f9f9",
          userSelect: "none",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        {flipped ? (
          currentCard.back
        ) : currentCard.image ? (
          <img
            src={currentCard.image}
            alt="card front"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : (
          currentCard.front
        )}
      </div>

      <div className="card-navigation" style={{ marginTop: "20px" }}>
        <p>
          {index + 1} / {shuffledCards.length}
        </p>
        <div
          className="buttons"
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
          }}
        >
          <button onClick={prev}>← 戻る</button>
          <button onClick={next}>進む →</button>
        </div>
      </div>

      <button
        className="edit-button"
        style={{ marginTop: "20px" }}
        onClick={handleEditClick}
      >
        編集
      </button>
    </div>
  );
};

export default CardView;
