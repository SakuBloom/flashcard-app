import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "./firebase"; // firebase.jsをインポート
import { collection, addDoc, deleteDoc, doc, getDocs } from "firebase/firestore";
import Papa from "papaparse"; // CSV読み込み用

const EditPage = ({ cards, setCards }) => {
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const [csvFile, setCsvFile] = useState(null); // CSVファイルの状態

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

  // CSVファイル選択後にCSVをパースしてFirestoreに反映
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCsvFile(file); // ファイルをステートに保存

    Papa.parse(file, {
      complete: async (results) => {
        const newCards = results.data
          .filter(row => row.front && row.back) // frontとbackが存在する行のみをフィルタリング
          .map(row => ({
            front: row.front,
            back: row.back,
            checked: false,
          }));

        // Firestoreに新しいカードを追加
        for (const card of newCards) {
          try {
            const docRef = await addDoc(collection(db, "cards"), card);
            setCards(prev => [...prev, { id: docRef.id, ...card }]);
          } catch (error) {
            console.error("Error adding card from CSV: ", error);
          }
        }
      },
      header: true,  // CSVにヘッダーがある場合
      skipEmptyLines: true,  // 空行をスキップ
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

        {/* CSVファイル選択ボタン */}
        <input type="file" accept=".csv" onChange={handleCSVUpload} />
      </div>

      {/* カードリスト */}
      <ul className="card-list">
        {cards.map((card) => (
          <li key={card.id}>
            {card.front} - {card.back}
            <button onClick={() => deleteCard(card.id)}>削除</button>
          </li>
        ))}
      </ul>

      {/* 戻るボタン */}
      <Link to="/">
        <button>カード表示に戻る</button>
      </Link>
    </div>
  );
};

export default EditPage;
