import React from "react";
import "./menuCard.css";

const MenuCard = ({
  item,
  quantity = 0,
  onAdd,
  onIncrease,
  onDecrease,
}) => {
  const isOutOfStock = !item.stock || item.stock <= 0;
  const isLowStock =
    !isOutOfStock && item.stock <= (item.lowStock || 3);

  return (
    <div
      className={`menu-card ${
        isOutOfStock ? "out-of-stock" : ""
      }`}
    >
      {/* Food Image */}
      <div className="menu-image">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
          />
        ) : (
          <div className="image-placeholder">🍽️</div>
        )}

        {isOutOfStock && (
          <div className="image-overlay">
            Out of Stock
          </div>
        )}
      </div>

      {/* Food Details */}
      <div className="menu-content">
        <div className="menu-header">
          <h3 title={item.name}>
            {item.name}
          </h3>

          {isLowStock && (
            <span className="low-stock">
              Low stock
            </span>
          )}
        </div>

        {item.description && (
          <p className="description">
            {item.description}
          </p>
        )}

        <div className="menu-bottom">
          <div className="price-stock">
            <span className="price">
              ₹{item.price}
            </span>

            <span className="stock">
              {isOutOfStock
                ? "Unavailable"
                : `${item.stock} left`}
            </span>
          </div>

          {/* Add / Quantity */}
          {!isOutOfStock && quantity > 0 ? (
            <div
              className="quantity-control"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => onDecrease(item)}
              >
                −
              </button>

              <span>{quantity}</span>

              <button
                type="button"
                onClick={() => onIncrease(item)}
                disabled={quantity >= item.stock}
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="add-btn"
              disabled={isOutOfStock}
              onClick={() => onAdd(item)}
            >
              + Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuCard;