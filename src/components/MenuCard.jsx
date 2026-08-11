export default function MenuCard({
  item,
  onAdd,
}) {
  const isOutOfStock =
    Number(item.stock || 0) <= 0;

  return (
    <div
      className={`menu-card ${
        isOutOfStock ? "out-of-stock" : ""
      }`}
    >
      <div className="image-wrapper">
        <img
          src={item.image}
          alt={item.name}
        />

        {isOutOfStock && (
          <div className="stock-overlay">
            Out of Stock
          </div>
        )}
      </div>

      <h3>{item.name}</h3>

      <p>₹{item.price}</p>

      <small>
        Stock: {item.stock || 0}
      </small>

      {!isOutOfStock &&
        item.stock <= item.lowStock && (
          <div className="low-stock-badge">
            Low Stock
          </div>
        )}

      <button
        disabled={isOutOfStock}
        className={
          isOutOfStock
            ? "add-btn disabled"
            : "add-btn"
        }
        onClick={() => onAdd(item)}
      >
        {isOutOfStock
          ? "Unavailable"
          : "Add"}
      </button>
    </div>
  );
}