import { useEffect, useMemo, useState } from "react";
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
  "Jhol",
];

const emptyForm = {
  name: "",
  category: "Veg",
  price: "",
  stock: "",
  lowStock: "",
  image: "",
  variants: [],
};

export default function InventoryPage() {
  const [items, setItems] = useState([]);

  const [activeCategory, setActiveCategory] =
    useState("All");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [saving, setSaving] =
    useState(false);

  const [form, setForm] =
    useState(emptyForm);

  /* =========================================
     FIREBASE
  ========================================= */

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "inventory"),
      (snapshot) => {
        const data = snapshot.docs.map(
          (itemDoc) => ({
            id: itemDoc.id,
            ...itemDoc.data(),
          })
        );

        setItems(data);
      },
      (error) => {
        console.error(
          "Inventory listener error:",
          error
        );
      }
    );

    return () => unsubscribe();
  }, []);

  /* =========================================
     COUNTS
  ========================================= */

  const categoryCounts = useMemo(() => {
    const counts = {};

    categories.forEach((category) => {
      counts[category] = items.filter(
        (item) =>
          item.category === category
      ).length;
    });

    return counts;
  }, [items]);

  /* =========================================
     FILTERED ITEMS
  ========================================= */

  const filteredItems = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return items.filter((item) => {
      const matchesCategory =
        activeCategory === "All" ||
        item.category === activeCategory;

      const matchesSearch =
        !query ||
        item.name
          ?.toLowerCase()
          .includes(query);

      return (
        matchesCategory &&
        matchesSearch
      );
    });
  }, [
    items,
    activeCategory,
    search,
  ]);

  /* =========================================
     FORM
  ========================================= */

  const resetForm = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      category:
        activeCategory !== "All"
          ? activeCategory
          : "Veg",
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const updateForm = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* =========================================
     VARIANTS
  ========================================= */

  const toggleVariant = (variant) => {
    setForm((prev) => {
      const exists =
        prev.variants.includes(variant);

      return {
        ...prev,
        variants: exists
          ? prev.variants.filter(
              (v) => v !== variant
            )
          : [
              ...prev.variants,
              variant,
            ],
      };
    });
  };

  /* =========================================
     SAVE / UPDATE
  ========================================= */

  const saveItem = async () => {
    if (!form.name.trim()) {
      alert("Enter Item Name");
      return;
    }

    if (
      form.price === "" ||
      Number(form.price) < 0
    ) {
      alert("Enter a valid price");
      return;
    }

    if (
      form.stock === "" ||
      Number(form.stock) < 0
    ) {
      alert("Enter a valid stock quantity");
      return;
    }

    if (
      form.lowStock === "" ||
      Number(form.lowStock) < 0
    ) {
      alert(
        "Enter a valid low stock threshold"
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price),
        stock: Number(form.stock),
        lowStock: Number(form.lowStock),
        image: form.image || "",
        variants: form.variants || [],
      };

      if (editingId) {
        await updateDoc(
          doc(
            db,
            "inventory",
            editingId
          ),
          payload
        );
      } else {
        await addDoc(
          collection(db, "inventory"),
          {
            ...payload,
            createdAt:
              serverTimestamp(),
          }
        );
      }

      closeModal();
    } catch (error) {
      console.error(
        "Error saving item:",
        error
      );

      alert(
        "Unable to save item. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================
     EDIT
  ========================================= */

  const editItem = (item) => {
    setEditingId(item.id);

    setForm({
      name: item.name || "",
      category:
        item.category || "Veg",
      price:
        item.price ?? "",
      stock:
        item.stock ?? "",
      lowStock:
        item.lowStock ?? "",
      image:
        item.image || "",
      variants:
        item.variants || [],
    });

    setShowModal(true);
  };

  /* =========================================
     ADD ITEM
  ========================================= */

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  return (
    <div className="inventory-page">

      {/* =====================================
          PAGE HEADER
      ===================================== */}

      <div className="inventory-header">
        <div>
          <h2>Inventory</h2>

          <p>
            Manage your menu items and stock
          </p>
        </div>

        <button
          type="button"
          className="desktop-add-btn"
          onClick={openAddModal}
        >
          <span>+</span>
          Add Item
        </button>
      </div>

      {/* =====================================
          SEARCH
      ===================================== */}

      <div className="inventory-search">
        <span className="search-icon">
          ⌕
        </span>

        <input
          type="text"
          placeholder="Search menu items..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        {search && (
          <button
            type="button"
            className="clear-search"
            onClick={() => setSearch("")}
          >
            ×
          </button>
        )}
      </div>

      {/* =====================================
          CATEGORY FILTER
      ===================================== */}

      <div className="category-filter-wrapper">
        <div className="category-filter">

          <button
            type="button"
            className={`category-chip ${
              activeCategory === "All"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveCategory("All")
            }
          >
            <span>All</span>

            <small>
              {items.length}
            </small>
          </button>

          {categories.map((category) => (
            <button
              type="button"
              key={category}
              className={`category-chip ${
                activeCategory === category
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveCategory(
                  category
                )
              }
            >
              <span>{category}</span>

              <small>
                {categoryCounts[
                  category
                ] || 0}
              </small>
            </button>
          ))}

        </div>
      </div>

      {/* =====================================
          RESULTS HEADER
      ===================================== */}

      <div className="inventory-results-header">
        <div>
          <h3>
            {activeCategory === "All"
              ? "All Items"
              : activeCategory}
          </h3>

          <span>
            {filteredItems.length}{" "}
            {filteredItems.length === 1
              ? "item"
              : "items"}
          </span>
        </div>

        {search && (
          <span className="search-result-label">
            Searching for "{search}"
          </span>
        )}
      </div>

      {/* =====================================
          INVENTORY LIST
      ===================================== */}

      <div className="inventory-list">

        {filteredItems.length === 0 ? (
          <div className="inventory-empty">

            <div className="empty-icon">
              🍽️
            </div>

            <h3>
              No items found
            </h3>

            <p>
              {search
                ? "Try a different search."
                : "Add an item to this category."}
            </p>

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
              >
                Clear Search
              </button>
            )}

          </div>
        ) : (
          filteredItems.map((item) => {
            const stock =
              Number(item.stock) || 0;

            const lowStock =
              Number(item.lowStock) || 0;

            const isOutOfStock =
              stock <= 0;

            const isLowStock =
              !isOutOfStock &&
              stock <= lowStock;

            return (
              <div
                key={item.id}
                className={`inventory-card ${
                  isOutOfStock
                    ? "out-of-stock"
                    : ""
                }`}
              >

                <div className="inventory-main">

                  {/* NAME */}

                  <div className="inventory-name">
                    <h4
                      title={item.name}
                    >
                      {item.name}
                    </h4>

                    {isOutOfStock ? (
                      <span className="inventory-status out">
                        Out
                      </span>
                    ) : isLowStock ? (
                      <span className="inventory-status low">
                        Low
                      </span>
                    ) : null}
                  </div>

                  {/* CATEGORY */}

                  <span className="item-category">
                    {item.category}
                  </span>

                  {/* PRICE */}

                  <div className="inventory-price">
                    ₹{item.price}
                  </div>

                  {/* STOCK */}

                  <div
                    className={`inventory-stock ${
                      isLowStock
                        ? "low"
                        : ""
                    } ${
                      isOutOfStock
                        ? "empty"
                        : ""
                    }`}
                  >
                    <span>
                      Stock
                    </span>

                    <strong>
                      {stock}
                    </strong>
                  </div>

                  {/* VARIANTS */}

                  {item.variants
                    ?.length > 0 && (
                    <div className="variant-tags">
                      {item.variants
                        .slice(0, 3)
                        .map(
                          (variant) => (
                            <span
                              key={
                                variant
                              }
                            >
                              {variant}
                            </span>
                          )
                        )}

                      {item.variants
                        .length > 3 && (
                        <span className="more-variants">
                          +
                          {item
                            .variants
                            .length -
                            3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* EDIT */}

                  <button
                    type="button"
                    className="edit-btn"
                    onClick={() =>
                      editItem(item)
                    }
                  >
                    Edit
                  </button>

                </div>
              </div>
            );
          })
        )}

      </div>

      {/* =====================================
          MOBILE FAB
      ===================================== */}

      <button
        type="button"
        className="inventory-fab"
        onClick={openAddModal}
        aria-label="Add inventory item"
      >
        +
      </button>

      {/* =====================================
          MODAL
      ===================================== */}

      {showModal && (
        <div
          className="inventory-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="inventory-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="modal-header">
              <div>
                <h3>
                  {editingId
                    ? "Edit Item"
                    : "Add Item"}
                </h3>

                <p>
                  {editingId
                    ? "Update item details and stock"
                    : "Add a new item to your menu"}
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            {/* FORM */}

            <div className="inventory-form">

              <div className="form-field full">
                <label>
                  Item Name
                </label>

                <input
                  type="text"
                  placeholder="e.g. Paneer Steam Momos"
                  value={form.name}
                  onChange={(e) =>
                    updateForm(
                      "name",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="form-row">

                <div className="form-field">
                  <label>
                    Category
                  </label>

                  <select
                    value={
                      form.category
                    }
                    onChange={(e) =>
                      updateForm(
                        "category",
                        e.target.value
                      )
                    }
                  >
                    {categories.map(
                      (category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="form-field">
                  <label>
                    Price
                  </label>

                  <div className="input-with-prefix">
                    <span>₹</span>

                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={
                        form.price
                      }
                      onChange={(e) =>
                        updateForm(
                          "price",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

              </div>

              <div className="form-row">

                <div className="form-field">
                  <label>
                    Stock Quantity
                  </label>

                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={
                      form.stock
                    }
                    onChange={(e) =>
                      updateForm(
                        "stock",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-field">
                  <label>
                    Low Stock Alert
                  </label>

                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 5"
                    value={
                      form.lowStock
                    }
                    onChange={(e) =>
                      updateForm(
                        "lowStock",
                        e.target.value
                      )
                    }
                  />
                </div>

              </div>

              {/* VARIANTS */}

              <div className="form-field">
                <label>
                  Variants
                </label>

                <div className="variant-selector">
                  {variants.map(
                    (variant) => {
                      const selected =
                        form.variants.includes(
                          variant
                        );

                      return (
                        <button
                          type="button"
                          key={variant}
                          className={`variant-btn ${
                            selected
                              ? "active"
                              : ""
                          }`}
                          onClick={() =>
                            toggleVariant(
                              variant
                            )
                          }
                        >
                          {selected && (
                            <span>
                              ✓
                            </span>
                          )}

                          {variant}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

            </div>

            {/* MODAL FOOTER */}

            <div className="modal-footer">

              <button
                type="button"
                className="cancel-btn"
                onClick={closeModal}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="save-item-btn"
                onClick={saveItem}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Item"
                  : "Add Item"}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}