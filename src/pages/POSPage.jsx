import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../services/firebase";

import Header from "../components/Header";
import MenuCard from "../components/MenuCard";
import FloatingCart from "../components/FloatingCart";
import CartDrawer from "../components/CartDrawer";

import { useCartStore } from "../store/cartStore";

export default function POSPage() {
  const { addItem } = useCartStore();

  const [drawerOpen, setDrawerOpen] =
    useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [menuItems, setMenuItems] =
    useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "inventory"),
      (snapshot) => {
        const data = snapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );

        setMenuItems(data);
      }
    );

    return () => unsubscribe();
  }, []);

  const categories = useMemo(() => {
    const cats = [
      "All",
      ...new Set(
        menuItems.map(
          (item) => item.category
        )
      ),
    ];

    return cats;
  }, [menuItems]);

  const filteredMenu = useMemo(() => {
    if (selectedCategory === "All") {
      return menuItems;
    }

    return selectedCategory === "All"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);
  }, [
    menuItems,
    selectedCategory,
  ]);

  return (
    <div className="app-shell">
      <div className="content">
        <div className="menu-section">
          <h2>Menu</h2>

          <div className="category-row">
            {categories.map(
              (category) => (
                <button
                  key={category}
                  className={
                    selectedCategory ===
                    category
                      ? "category-btn active"
                      : "category-btn"
                  }
                  onClick={() =>
                    setSelectedCategory(
                      category
                    )
                  }
                >
                  {category}
                </button>
              )
            )}
          </div>

          <div className="menu-grid">
            {filteredMenu.map(
              (item) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  onAdd={addItem}
                />
              )
            )}
          </div>
        </div>
      </div>

      <FloatingCart
        onClick={() =>
          setDrawerOpen(true)
        }
      />

      <CartDrawer
        open={drawerOpen}
        onClose={() =>
          setDrawerOpen(false)
        }
      />
    </div>
  );
}