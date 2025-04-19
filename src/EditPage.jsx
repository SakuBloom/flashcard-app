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

      <Link to="/" style={{ marginBottom: "10px", display: "block" }}>
        <button>カード表示に戻る</button>
      </Link>

      <div className="manual-edit" style={{ marginBottom: "20px" }}>
        <h3>手動編集</h3>
        <input
          type="text"
          placeholder="表面"
          value={newFront}
          onChange={(e) => setNewFront(e.target.value)}
          style={{ marginBottom: "10px" }}
        />
        <input
          type="text"
          placeholder="裏面"
          value={newBack}
          onChange={(e) => setNewBack(e.target.value)}
          style={{ marginBottom: "10px" }}
        />
        <button onClick={addCard} style={{ marginBottom: "10px" }}>追加</button>
      </div>

      <div className="csv-upload" style={{ marginBottom: "20px" }}>
        <h3>CSV読込</h3>
        <input type="file" accept=".csv" onChange={handleCSVUpload} style={{ marginBottom: "10px" }} />
        {csvFile && <div>選択されたファイル: {csvFile.name}</div>}
        <button onClick={handleCSVUpload} style={{ marginBottom: "10px" }}>アップロード</button>
      </div>

      <div className="current-cards">
        <h3>現在のカード一覧</h3>
        <ul>
          {cards.map((card) => (
            <li key={card.id}>
              {card.front} - {card.back}
              <button onClick={() => deleteCard(card.id)} style={{ marginLeft: "10px" }}>削除</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EditPage;
