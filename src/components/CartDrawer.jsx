import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import "./cartDrawer.css";

export default function CartDrawer({
  open,
  onClose,
}) {
  const navigate = useNavigate();

  const {
    items,
    increaseQty,
    decreaseQty,
    placeOrder,
  } = useCartStore();

  const [showSuccess, setShowSuccess] =
    useState(false);

  const [placedOrder, setPlacedOrder] =
    useState(null);

  const total = items.reduce(
    (sum, item) =>
      sum + item.price * item.qty,
    0
  );

  const totalItems = items.reduce(
    (sum, item) => sum + item.qty,
    0
  );

  const handlePlaceOrder = () => {
    if (!items.length) return;

    try {
      const order = placeOrder();

      setPlacedOrder(order);
      setShowSuccess(true);

      // Close cart
      onClose();

      // Show popup, then go to orders
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/orders");
      }, 1800);
    } catch (error) {
      console.error(
        "Unable to place order:",
        error
      );
    }
  };

  if (!open && !showSuccess) {
    return null;
  }

  return (
    <>
      {/* Cart */}

      {open && (
        <div className="cart-layer">
          <div
            className="cart-backdrop"
            onClick={onClose}
          />

          <aside className="cart-drawer">

            <div className="drawer-handle" />

            <header className="cart-header">
              <div className="cart-title">
                <h2>Your Order</h2>

                <span>
                  {totalItems}{" "}
                  {totalItems === 1
                    ? "item"
                    : "items"}
                </span>
              </div>

              <button
                type="button"
                className="close-btn"
                onClick={onClose}
              >
                ×
              </button>
            </header>

            <div className="cart-items">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="cart-row"
                >
                  <div className="cart-item-image">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                      />
                    ) : (
                      <span>🍽️</span>
                    )}
                  </div>

                  <div className="cart-item-info">
                    <h4>
                      {item.name}
                    </h4>

                    <span>
                      ₹{item.price}
                    </span>
                  </div>

                  <div className="qty-control">
                    <button
                      onClick={() =>
                        decreaseQty(item.id)
                      }
                    >
                      −
                    </button>

                    <span>
                      {item.qty}
                    </span>

                    <button
                      onClick={() =>
                        increaseQty(item.id)
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {items.length > 0 && (
              <footer className="cart-footer">
                <div className="summary-row">
                  <span>
                    Subtotal
                  </span>

                  <strong>
                    ₹{total}
                  </strong>
                </div>

                <div className="summary-note">
                  Taxes and delivery charges
                  may apply
                </div>

                <button
                  type="button"
                  className="place-order-btn"
                  onClick={
                    handlePlaceOrder
                  }
                >
                  <span>
                    Place Order
                  </span>

                  <strong>
                    ₹{total}
                  </strong>
                </button>
              </footer>
            )}

          </aside>
        </div>
      )}

      {/* SUCCESS POPUP */}

      {showSuccess && (
        <div className="order-success">
          <div className="success-icon">
            ✓
          </div>

          <div className="success-content">
            <strong>
              Order Placed!
            </strong>

            <span>
              {placedOrder?.id}
            </span>
          </div>
        </div>
      )}
    </>
  );
}