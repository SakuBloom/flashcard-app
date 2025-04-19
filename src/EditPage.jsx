import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "./firebase"; // firebase.jsをインポート
import { collection, addDoc, deleteDoc, doc, getDocs } from "firebase/firestore";
import Papa from "papaparse"; // CSV読み込み用

const EditPage = ({ cards, setCards }) => {
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const [selectedCards, setSelectedCards] = useState([]); // 選択されたカードを管理

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

  // 複数の選択されたカードを削除
  const deleteSelectedCards = async () => {
    try {
      // 削除処理を一度に行う
      await Promise.all(
        selectedCards.map(async (cardId) => {
          const cardDoc = doc(db, "cards", cardId);
          await deleteDoc(cardDoc);
        })
      );

      // 削除後にカードの状態を更新
      setCards(cards.filter((card) => !selectedCards.includes(card.id)));
      setSelectedCards([]); // 削除後に選択をクリア
    } catch (error) {
      console.error("Error deleting selected cards: ", error);
    }
  };

  // チェックボックスの選択状態を更新
  const toggleCardSelection = (id) => {
    setSelectedCards((prevSelectedCards) =>
      prevSelectedCards.includes(id)
        ? prevSelectedCards.filter((cardId) => cardId !== id)
        : [...prevSelectedCards, id]
    );
  };

  // CSVファイルからカードを読み込む
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const newCards = results.data
          .filter(row => row.front && row.back)
          .map(row => ({
            front: row.front,
            back: row.back,
            checked: false,
          }));

        for (const card of newCards) {
          try {
            const docRef = await addDoc(collection(db, "cards"), card);
            setCards(prev => [...prev, { id: docRef.id, ...card }]);
          } catch (error) {
            console.error("Error adding card from CSV: ", error);
          }
        }
      },
    });
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
        <input type="file" accept=".csv" onChange={handleCSVUpload} />
      </div>

      <div className="card-list">
        <ul>
          {cards.map((card) => (
            <li key={card.id}>
              <input
                type="checkbox"
                checked={selectedCards.includes(card.id)}
                onChange={() => toggleCardSelection(card.id)}
              />
              {card.front} - {card.back}
            </li>
          ))}
        </ul>

        <button onClick={deleteSelectedCards}>まとめて削除</button>
      </div>

      <Link to="/">
        <button>カード表示に戻る</button>
      </Link>
    </div>
  );
};

export default EditPage;
