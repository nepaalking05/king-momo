import { useCartStore } from "../store/cartStore";
import './floatingCart.css'
export default function FloatingCart({ onClick }) {
  const { items } = useCartStore();

  const totalItems = items.reduce(
    (sum, item) => sum + item.qty,
    0
  );

  const totalAmount = items.reduce(
    (sum, item) =>
      sum + item.qty * item.price,
    0
  );

  if (totalItems === 0) return null;

  return (
    <div
      className="floating-cart-v2"
      onClick={onClick}
    >
      <div>
        <strong>
          {totalItems} Items
        </strong>
        <small>
          ₹{totalAmount}
        </small>
      </div>

      <div className="cart-action">
        View Cart →
      </div>
    </div>
  );
}