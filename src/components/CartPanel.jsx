<div className="cart-item-v2">
  <div>
    <h4>{item.name}</h4>

    <small>
      ₹{item.price}
    </small>
  </div>

  <div className="qty-control">
    <button
      onClick={() =>
        decreaseQty(item.id)
      }
    >
      −
    </button>

    <span>{item.qty}</span>

    <button
      onClick={() =>
        increaseQty(item.id)
      }
    >
      +
    </button>
  </div>
</div>