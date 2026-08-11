import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
} from "firebase/firestore";
import './dashboard.css'
import { db } from "../services/firebase";

export default function DashboardPage() {
  const [orders, setOrders] =
    useState([]);

  const [stockItems, setStockItems] =
    useState([]);

  const [inventory, setInventory] =
    useState([]);

  useEffect(() => {
    const unsubOrders =
      onSnapshot(
        collection(db, "orders"),
        (snapshot) => {
          setOrders(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
          );
        }
      );

    const unsubStock =
      onSnapshot(
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

    const unsubInventory =
      onSnapshot(
        collection(db, "inventory"),
        (snapshot) => {
          setInventory(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
          );
        }
      );

    return () => {
      unsubOrders();
      unsubStock();
      unsubInventory();
    };
  }, []);

  const completedOrders =
    orders.filter(
      (o) =>
        o.status === "completed"
    );

  const totalSales =
    completedOrders.reduce(
      (sum, order) =>
        sum + (order.total || 0),
      0
    );

  const totalExpense =
    stockItems.reduce(
      (sum, stock) =>
        sum + (stock.cost || 0),
      0
    );

  const profit =
    totalSales - totalExpense;

  const pendingOrders =
    orders.filter(
      (o) =>
        o.status === "pending"
    ).length;

  const lowStockItems =
    inventory.filter(
      (item) =>
        item.stock <=
        item.lowStock
    );

  return (
    <div className="dashboard-page">
      <h2>Dashboard</h2>

      <div className="dashboard-grid">
        <div className="dashboard-card sales">
          <h4>Sales</h4>
          <h2>₹{totalSales}</h2>
        </div>

        <div className="dashboard-card expense">
          <h4>Expense</h4>
          <h2>₹{totalExpense}</h2>
        </div>

        <div className="dashboard-card profit">
          <h4>Profit</h4>
          <h2>₹{profit}</h2>
        </div>

        <div className="dashboard-card pending">
          <h4>Pending Orders</h4>
          <h2>{pendingOrders}</h2>
        </div>
      </div>

      <div className="low-stock-section">
        <h3>
          Low Stock Alerts
        </h3>

        {lowStockItems.length ===
        0 ? (
          <p>
            No low stock items
          </p>
        ) : (
          lowStockItems.map(
            (item) => (
              <div
                key={item.id}
                className="low-stock-card"
              >
                <span>
                  {item.name}
                </span>

                <strong>
                  {item.stock}
                </strong>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}