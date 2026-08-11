import { useEffect, useState } from "react";

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../services/firebase";
import "./inventory.css";

const categories = [
  "Veg",
  "Paneer",
  "Soya",
  "Aloo",
  "Cheese Corn",
];

const variants = [
  "Steam",
  "Fry",
  "Afghani",
  "Kurkure",
  "Jhol"
];

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "Veg",
    price: "",
    stock: "",
    lowStock: "",
    image: "",
    variants: [],
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "inventory"),
      (snapshot) => {
        setItems(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      }
    );

    return () => unsubscribe();
  }, []);

  const resetForm = () => {
    setEditingId(null);

    setForm({
      name: "",
      category: "Veg",
      price: "",
      stock: "",
      lowStock: "",
      image: "",
      variants: [],
    });
  };

  const toggleVariant = (variant) => {
    if (form.variants.includes(variant)) {
      setForm({
        ...form,
        variants: form.variants.filter(
          (v) => v !== variant
        ),
      });
    } else {
      setForm({
        ...form,
        variants: [...form.variants, variant],
      });
    }
  };

  const saveItem = async () => {
    if (!form.name.trim()) {
      alert("Enter Item Name");
      return;
    }

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        lowStock: Number(form.lowStock),
      };

      if (editingId) {
        await updateDoc(
          doc(db, "inventory", editingId),
          payload
        );

        alert("Item Updated");
      } else {
        await addDoc(
          collection(db, "inventory"),
          {
            ...payload,
            createdAt: serverTimestamp(),
          }
        );

        alert("Item Added");
      }

      resetForm();
      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const editItem = (item) => {
    setShowModal(true);

    setEditingId(item.id);

    setForm({
      name: item.name || "",
      category: item.category || "Veg",
      price: item.price || "",
      stock: item.stock || "",
      lowStock: item.lowStock || "",
      image: item.image || "",
      variants: item.variants || [],
    });
  };

  const groupedItems = categories.reduce(
    (acc, category) => {
      acc[category] = items.filter(
        (item) => item.category === category
      );
      return acc;
    },
    {}
  );

  return (
    <div className="inventory-page">
      <h2>Inventory</h2>

      {categories.map((category) => (
        <div
          key={category}
          className="inventory-section"
        >
          <h3>{category}</h3>

          <div className="inventory-grid">
            {groupedItems[category]?.map(
              (item) => (
                <div
                  key={item.id}
                  className="inventory-card"
                >
                  <img
                    src={
                      item.image ||
                      "https://via.placeholder.com/300x200"
                    }
                    alt={item.name}
                  />

                  <div className="inventory-card-body">
                    <h4>{item.name}</h4>

                    <div className="price-row">
                      <span>
                        ₹{item.price}
                      </span>

                      <span
                        className={
                          item.stock <=
                          item.lowStock
                            ? "stock low"
                            : "stock"
                        }
                      >
                        Stock: {item.stock}
                      </span>
                    </div>

                    <div className="variant-tags">
                      {item.variants?.map(
                        (variant) => (
                          <span
                            key={variant}
                          >
                            {variant}
                          </span>
                        )
                      )}
                    </div>

                    {item.stock <=
                      item.lowStock && (
                      <div className="low-stock">
                        ⚠ Low Stock
                      </div>
                    )}

                    <button
                      className="edit-btn"
                      onClick={() =>
                        editItem(item)
                      }
                    >
                      Edit Item
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      ))}

      <button
        className="inventory-fab"
        onClick={() => {
          resetForm();
          setShowModal(true);
        }}
      >
        +
      </button>

      {showModal && (
        <div
          className="inventory-modal-overlay"
          onClick={() =>
            setShowModal(false)
          }
        >
          <div
            className="inventory-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <h3>
              {editingId
                ? "Edit Item"
                : "Add Item"}
            </h3>

            <input
              placeholder="Item Name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
            />

            <select
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category:
                    e.target.value,
                })
              }
            >
              {categories.map((cat) => (
                <option
                  key={cat}
                  value={cat}
                >
                  {cat}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={(e) =>
                setForm({
                  ...form,
                  price:
                    e.target.value,
                })
              }
            />

            <input
              type="number"
              placeholder="Stock Qty"
              value={form.stock}
              onChange={(e) =>
                setForm({
                  ...form,
                  stock:
                    e.target.value,
                })
              }
            />

            <input
              type="number"
              placeholder="Low Stock Alert"
              value={form.lowStock}
              onChange={(e) =>
                setForm({
                  ...form,
                  lowStock:
                    e.target.value,
                })
              }
            />

            <input
              placeholder="Image URL"
              value={form.image}
              onChange={(e) =>
                setForm({
                  ...form,
                  image:
                    e.target.value,
                })
              }
            />

            <div className="variant-group">
              {variants.map(
                (variant) => (
                  <button
                    type="button"
                    key={variant}
                    className={
                      form.variants.includes(
                        variant
                      )
                        ? "variant-btn active"
                        : "variant-btn"
                    }
                    onClick={() =>
                      toggleVariant(
                        variant
                      )
                    }
                  >
                    {variant}
                  </button>
                )
              )}
            </div>

            <button
              className="save-item-btn"
              onClick={saveItem}
            >
              {editingId
                ? "Update Item"
                : "Add Item"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}