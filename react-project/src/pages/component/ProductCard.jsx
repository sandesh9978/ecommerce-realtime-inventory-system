import React from "react";
import { useNavigate } from "react-router-dom";

function ProductCard({ product, addToCart }) {
  const navigate = useNavigate();
  return (
    <div className="border rounded shadow p-4 flex flex-col items-center bg-white hover:shadow-lg transition w-full max-w-xs mx-auto">
      <img
        src={`/images/${product.image || "placeholder.jpg"}`}
        alt={product.name}
        className="w-full h-40 object-cover rounded mb-2"
      />
      <div className="text-lg font-semibold text-center mb-1">{product.name}</div>
      <div className="flex items-baseline gap-2 mb-2">
        {product.oldPrice && (
          <span className="text-gray-500 text-sm line-through">
            NPR {product.oldPrice}
          </span>
        )}
        <span className="font-bold text-blue-600 text-lg">
          NPR {product.price}
        </span>
      </div>
      <button
        onClick={() => addToCart(product)}
        className="mt-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
      >
        Add to Cart
      </button>
      <button
        onClick={() => navigate(`/products/${product.id}`)}
        className="text-blue-500 underline text-sm mt-2 w-full"
      >
        View Details
      </button>
    </div>
  );
}

export default ProductCard;
