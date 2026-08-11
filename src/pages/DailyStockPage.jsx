import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../services/firebase";

export default function DailyStockPage() {
  const [stockItems, setStockItems] =
    useState([]);

  const [form, setForm] =
    useState({
      itemName: "",
      quantity: "",
      unit: "kg",
      cost: "",
    });

  useEffect(() => {
    return onSnapshot(
      collection(db, "dailyStock"),
      (snapshot) => {
        setStockItems(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      }
    );
  }, []);

  const addStock = async () => {
    if (!form.itemName) return;

    await addDoc(
      collection(db, "dailyStock"),
      {
        ...form,
        quantity:
          Number(form.quantity),

        cost:
          Number(form.cost),

        date:
          new Date()
            .toISOString()
            .split("T")[0],

        createdAt:
          serverTimestamp(),
      }
    );

    setForm({
      itemName: "",
      quantity: "",
      unit: "kg",
      cost: "",
    });
  };

  const todayExpense =
    stockItems.reduce(
      (sum, item) =>
        sum + (item.cost || 0),
      0
    );

  return (
    <div className="stock-page">
      <h2>Daily Stock</h2>

      <div className="summary-card">
        ₹{todayExpense}
      </div>

      <div className="stock-form">
        <input
          placeholder="Item"
          value={form.itemName}
          onChange={(e) =>
            setForm({
              ...form,
              itemName:
                e.target.value,
            })
          }
        />

        <input
          placeholder="Quantity"
          value={form.quantity}
          onChange={(e) =>
            setForm({
              ...form,
              quantity:
                e.target.value,
            })
          }
        />

        <input
          placeholder="Unit"
          value={form.unit}
          onChange={(e) =>
            setForm({
              ...form,
              unit:
                e.target.value,
            })
          }
        />

        <input
          placeholder="Cost"
          value={form.cost}
          onChange={(e) =>
            setForm({
              ...form,
              cost:
                e.target.value,
            })
          }
        />

        <button onClick={addStock}>
          Add Stock
        </button>
      </div>

      <div className="stock-list">
        {stockItems.map(
          (item) => (
            <div
              key={item.id}
              className="stock-card"
            >
              <h4>
                {item.itemName}
              </h4>

              <p>
                {item.quantity}
                {" "}
                {item.unit}
              </p>

              <strong>
                ₹{item.cost}
              </strong>
            </div>
          )
        )}
      </div>
    </div>
  );
}