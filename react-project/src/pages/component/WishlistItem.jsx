import React from "react";

function WishlistItem({ item, removeFromWishlist }) {
  return (
    <div className="p-4 border rounded shadow">
      <h3 className="text-lg">{item.name}</h3>
      <p className="text-gray-600">Price: Rs. {item.price}</p>
      <button onClick={() => removeFromWishlist(item.id)} className="text-red-600 underline mt-2">
        Remove
      </button>
    </div>
  );
}

export default WishlistItem;
