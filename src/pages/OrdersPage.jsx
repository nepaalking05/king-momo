import { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../services/firebase";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  const [paymentFilter, setPaymentFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [dateFilter, setDateFilter] =
    useState("");

  const [showQr, setShowQr] =
    useState(false);

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setOrders(data);
    });

    return () => unsubscribe();
  }, []);

  async function markCompleted(
    orderId,
    paymentMode
  ) {
    try {
      await updateDoc(
        doc(db, "orders", orderId),
        {
          status: "completed",
          paymentMode,
        }
      );
    } catch (err) {
      console.error(err);
    }
  }

  function openUpi(order) {
    setSelectedOrder(order);
    setShowQr(true);
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const paymentMatch =
        paymentFilter === "all" ||
        order.paymentMode === paymentFilter;

      const statusMatch =
        statusFilter === "all" ||
        order.status === statusFilter;

      let dateMatch = true;

      if (dateFilter && order.createdAt?.toDate) {
        const orderDate =
          order.createdAt
            .toDate()
            .toISOString()
            .split("T")[0];

        dateMatch =
          orderDate === dateFilter;
      }

      return (
        paymentMatch &&
        statusMatch &&
        dateMatch
      );
    });
  }, [
    orders,
    paymentFilter,
    statusFilter,
    dateFilter,
  ]);

  const totalSales = filteredOrders
    .filter(
      (o) => o.status === "completed"
    )
    .reduce(
      (sum, order) =>
        sum + (order.total || 0),
      0
    );

  return (
    <div className="orders-page">

      <div className="orders-header">
        <div>
          <h2>Orders</h2>
          <small>{filteredOrders.length} Orders</small>
        </div>

        <div className="sales-badge">₹{totalSales}</div>
      </div>

      <div className="mobile-filters">
        <div className="filter-row">
          {/* <button
            className={dateFilter === "" ? "chip active" : "chip"}
            onClick={() => setDateFilter("")}
          >
            All Dates
          </button> */}

          <button
            className="chip"
            onClick={() => {
              const today = new Date().toISOString().split("T")[0];

              setDateFilter(today);
            }}
          >
            Today
          </button>
        </div>

        <div className="filter-row">
          <button
            className={statusFilter === "all" ? "chip active" : "chip"}
            onClick={() => setStatusFilter("all")}
          >
            All
          </button>

          <button
            className={statusFilter === "pending" ? "chip active" : "chip"}
            onClick={() => setStatusFilter("pending")}
          >
            Pending
          </button>

          <button
            className={statusFilter === "completed" ? "chip active" : "chip"}
            onClick={() => setStatusFilter("completed")}
          >
            Completed
          </button>
        </div>

        <div className="filter-row">
          <button
            className={paymentFilter === "all" ? "chip active" : "chip"}
            onClick={() => setPaymentFilter("all")}
          >
            All
          </button>

          <button
            className={paymentFilter === "cash" ? "chip active" : "chip"}
            onClick={() => setPaymentFilter("cash")}
          >
            Cash
          </button>

          <button
            className={paymentFilter === "upi" ? "chip active" : "chip"}
            onClick={() => setPaymentFilter("upi")}
          >
            UPI
          </button>
        </div>
      </div>

      <div className="orders-grid">
        {filteredOrders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-top">
              <div>
                <h3>₹{order.total}</h3>

                <small>
                  {order.createdAt?.toDate
                    ? order.createdAt.toDate().toLocaleString()
                    : ""}
                </small>
              </div>

              <span className={`status-badge ${order.status}`}>
                {order.status}
              </span>
            </div>

            {order.paymentMode && (
              <div className="payment-chip">
                {order.paymentMode.toUpperCase()}
              </div>
            )}

            <div className="order-items">
              {order.items?.map((item, index) => (
                <div key={index} className="order-item">
                  <span>{item.name}</span>

                  <span>x{item.qty}</span>
                </div>
              ))}
            </div>

            {order.status === "pending" && (
              <div className="payment-actions">
                <button
                  className="cash-btn"
                  onClick={() => markCompleted(order.id, "cash")}
                >
                  Collect Cash
                </button>

                <button className="upi-btn" onClick={() => openUpi(order)}>
                  UPI
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showQr && selectedOrder && (
        <div className="qr-modal">
          <div className="qr-content">
            <h3>Receive Payment</h3>

            <QRCode
              size={220}
              value={`upi://pay?pa=paytm.s2zpfne@pty&pn=King Momo&am=${selectedOrder.total}&cu=INR`}
            />

            <h2>₹{selectedOrder.total}</h2>

            <button
              className="complete-payment-btn"
              onClick={async () => {
                await markCompleted(selectedOrder.id, "upi");

                setShowQr(false);
                setSelectedOrder(null);
              }}
            >
              Payment Received
            </button>

            <button
              className="close-btn"
              onClick={() => {
                setShowQr(false);
                setSelectedOrder(null);
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}