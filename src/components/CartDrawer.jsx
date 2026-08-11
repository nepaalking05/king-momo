import { useCartStore } from "../store/cartStore";
import './cartDrawer.css'
export default function CartDrawer({
  open,
  onClose,
}) {
  const {
    items,
    increaseQty,
    decreaseQty,
  } = useCartStore();

  const total = items.reduce(
    (sum, item) =>
      sum + item.price * item.qty,
    0
  );

  const totalItems = items.reduce(
    (sum, item) => sum + item.qty,
    0
  );

  if (!open) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />

      <div
        className="cart-drawer"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "80vh",
          background: "white",
          zIndex: 99999,
          border: "5px solid red",
        }}
      >
        <div className="drawer-handle" />

        <div className="cart-header">
          <div className="cart-title">
            <h2>Your Order</h2>
            <small>{totalItems} Items</small>
          </div>

          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="cart-items">
          {items.length === 0 ? (
            <div className="empty-cart">Cart Empty</div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="cart-row">
                <div>
                  <h4>{item.name}</h4>
                  <span>₹{item.price}</span>
                </div>

                <div className="qty-control">
                  <button onClick={() => decreaseQty(item.id)}>−</button>

                  <span>{item.qty}</span>

                  <button onClick={() => increaseQty(item.id)}>+</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <div className="total-row">
            <span>Total</span>
            <strong>₹{total}</strong>
          </div>

          <button className="place-order-btn">Place Order</button>
        </div>
      </div>
    </>
  );
}