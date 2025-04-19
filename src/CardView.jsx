
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const speak = (text) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = /[^\x00-\x7F]/.test(text) ? "ja-JP" : "en-US";
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
};

const CardView = ({ cards }) => {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const currentCard = cards[index];

  useEffect(() => {
    if (currentCard) {
      speak(flipped ? currentCard.back : currentCard.front);
    }
  }, [index, flipped]);

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
      <Link to="/edit">
        <button className="edit-button">編集</button>
      </Link>
    </div>
  );
};

export default CardView;
