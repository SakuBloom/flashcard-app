import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "./firebase";
import { collection, addDoc, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import Papa from "papaparse";

const EditPage = ({ cards, setCards }) => {
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const [selectedCards, setSelectedCards] = useState([]);
  const [editingCardId, setEditingCardId] = useState(null);
  const [editFront, setEditFront] = useState("");
  const [editBack, setEditBack] = useState("");

  useEffect(() => {
    const fetchCards = async () => {
      const cardsCollection = collection(db, "cards");
      const snapshot = await getDocs(cardsCollection);
      const fetchedCards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCards(fetchedCards);
    };

    fetchCards();
  }, [setCards]);

  const addCard = async () => {
    if (newFront && newBack) {
      try {
        const newCard = { front: newFront, back: newBack, checked: false };
        const docRef = await addDoc(collection(db, "cards"), newCard);
        setCards([...cards, { id: docRef.id, ...newCard }]);
        setNewFront("");
        setNewBack("");
      } catch (error) {
        console.error("Error adding card: ", error);
      }
    }
  };

  const deleteSelectedCards = async () => {
    try {
      await Promise.all(
        selectedCards.map(async (cardId) => {
          const cardDoc = doc(db, "cards", cardId);
          await deleteDoc(cardDoc);
        })
      );
      setCards(cards.filter((card) => !selectedCards.includes(card.id)));
      setSelectedCards([]);
    } catch (error) {
      console.error("Error deleting selected cards: ", error);
    }
  };

  const toggleCardSelection = (id) => {
    setSelectedCards(prev =>
      prev.includes(id) ? prev.filter(cardId => cardId !== id) : [...prev, id]
    );
  };

  const selectAllCards = () => {
    const allIds = cards.map(card => card.id);
    setSelectedCards(allIds);
  };

  const deselectAllCards = () => {
    setSelectedCards([]);
  };

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

  const exportToCSV = () => {
    const cardsData = cards.map(card => ({
      front: card.front,
      back: card.back,
    }));

    const csv = Papa.unparse(cardsData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = "cards_export.csv"; // 任意のファイル名を指定
    link.click();
  };

  const startEditing = (card) => {
    setEditingCardId(card.id);
    setEditFront(card.front);
    setEditBack(card.back);
  };

  const saveEdit = async (id) => {
    try {
      const cardDoc = doc(db, "cards", id);
      await updateDoc(cardDoc, { front: editFront, back: editBack });
      setCards(cards.map(card =>
        card.id === id ? { ...card, front: editFront, back: editBack } : card
      ));
      setEditingCardId(null);
    } catch (error) {
      console.error("Error updating card: ", error);
    }
  };

  return (
    <div className="edit-page" style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* 固定ヘッダー */}
      <div className="header" style={{
        position: "sticky",
        top: 0,
        backgroundColor: "white",
        padding: "10px",
        zIndex: 100,
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
      }}>
        <h2>カードの編集</h2>
        <Link to="/"><button>カード表示に戻る</button></Link>
        <div style={{ marginTop: "10px" }}>
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

        {/* ボタンを修正・追加 */}
        <div style={{ marginTop: "10px" }}>
          <button onClick={deleteSelectedCards}>まとめて削除</button>
          <button onClick={selectAllCards} style={{ marginLeft: "10px" }}>全て選択</button>
          <button onClick={deselectAllCards} style={{ marginLeft: "10px" }}>選択解除</button>
          <button onClick={exportToCSV} style={{ marginLeft: "10px" }}>CSVエクスポート</button>
        </div>
      </div>

      {/* スクロール可能なカード一覧 */}
      <div className="card-list" style={{
        overflowY: "auto",
        flexGrow: 1,
        padding: "10px"
      }}>
        <ul>
          {cards.map((card) => (
            <li key={card.id} style={{ marginBottom: "10px" }}>
              <input
                type="checkbox"
                checked={selectedCards.includes(card.id)}
                onChange={() => toggleCardSelection(card.id)}
              />
              {editingCardId === card.id ? (
                <>
                  <input
                    type="text"
                    value={editFront}
                    onChange={(e) => setEditFront(e.target.value)}
                  />
                  <input
                    type="text"
                    value={editBack}
                    onChange={(e) => setEditBack(e.target.value)}
                  />
                  <button onClick={() => saveEdit(card.id)}>保存</button>
                </>
              ) : (
                <>
                  {card.front} - {card.back}
                  <button onClick={() => startEditing(card)} style={{ marginLeft: "10px" }}>
                    修正
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EditPage;
