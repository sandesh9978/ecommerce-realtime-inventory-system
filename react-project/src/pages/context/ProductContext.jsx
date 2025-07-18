import React, { createContext, useContext, useEffect, useState } from "react";
import { getAllProductsApi } from "../api/api";

const ProductContext = createContext();

const defaultProducts = [
  { id: 1, brand: "Samsung", model: "Galaxy S24 Ultra (12+512GB)", price: 199999, stock: 10, status: "Out of stock", image: "https://images.samsung.com/is/image/samsung/p6pim/levant/2401/gallery/levant-galaxy-s24-ultra-sm-s928bzkgmea-thumb-539207237?" },
  { id: 2, brand: "Samsung", model: "Galaxy S25 (12+128GB)", price: 104999, stock: 5, status: "New", image: "https://images.samsung.com/is/image/samsung/p6pim/levant/2401/gallery/levant-galaxy-s25-sm-s921bzkgmea-thumb-539207237?" },
  { id: 3, brand: "Samsung", model: "Galaxy S25 (12+256GB)", price: 114999, stock: 8, status: "New", image: "https://images.samsung.com/is/image/samsung/p6pim/levant/2401/gallery/levant-galaxy-s25-sm-s921bzkgmea-thumb-539207237?" },
  { id: 4, brand: "Samsung", model: "Galaxy S25+ (12+256GB)", price: 141999, stock: 3, status: "New", image: "https://images.samsung.com/is/image/samsung/p6pim/levant/2401/gallery/levant-galaxy-s25plus-sm-s926bzkgmea-thumb-539207237?" },
  { id: 5, brand: "Samsung", model: "Galaxy S25 Ultra (12+256GB)", price: 184999, stock: 7, status: "New", image: "https://images.samsung.com/is/image/samsung/p6pim/levant/2401/gallery/levant-galaxy-s24-ultra-sm-s928bzkgmea-thumb-539207237?" },
  { id: 6, brand: "Samsung", model: "Galaxy S25 Ultra (12+512GB)", price: 199999, stock: 12, status: "New", image: "https://images.samsung.com/is/image/samsung/p6pim/levant/2401/gallery/levant-galaxy-s24-ultra-sm-s928bzkgmea-thumb-539207237?" },
  { id: 7, brand: "Apple", model: "iPhone 16 Pro (128GB)", price: 168700, oldPrice: 178900, stock: 5, status: "New", image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-model-unselect-gallery-1-202309?wid=5120&hei=2880&fmt=jpeg&qlt=80&.v=1692924062367" },
  { id: 8, brand: "Apple", model: "iPhone 16 Pro (256GB)", price: 188200, oldPrice: 198000, stock: 5, status: "New", image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-model-unselect-gallery-1-202309?wid=5120&hei=2880&fmt=jpeg&qlt=80&.v=1692924062367" },
  { id: 9, brand: "Apple", model: "iPhone 16 Pro (512GB)", price: 226600, oldPrice: 237500, stock: 5, status: "New", image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-model-unselect-gallery-1-202309?wid=5120&hei=2880&fmt=jpeg&qlt=80&.v=1692924062367" },
  { id: 10, brand: "Apple", model: "iPhone 16 Pro (1TB)", price: 265200, oldPrice: 275100, stock: 5, status: "New", image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-model-unselect-gallery-1-202309?wid=5120&hei=2880&fmt=jpeg&qlt=80&.v=1692924062367" },
  { id: 11, brand: "Apple", model: "iPhone 16 Pro Max (256GB)", price: 197000, oldPrice: 207000, stock: 5, status: "New", image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-max-model-unselect-gallery-1-202309?wid=5120&hei=2880&fmt=jpeg&qlt=80&.v=1692924062367" },
  { id: 12, brand: "Apple", model: "iPhone 16 Pro Max (512GB)", price: 235500, oldPrice: 245500, stock: 5, status: "New", image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-max-model-unselect-gallery-1-202309?wid=5120&hei=2880&fmt=jpeg&qlt=80&.v=1692924062367" },
  { id: 13, brand: "Apple", model: "iPhone 16 Pro Max (1TB)", price: 274000, oldPrice: 284000, stock: 5, status: "New", image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-max-model-unselect-gallery-1-202309?wid=5120&hei=2880&fmt=jpeg&qlt=80&.v=1692924062367" },
];

// Helper to get deleted product IDs from localStorage
function getDeletedProductIds() {
  try {
    return JSON.parse(localStorage.getItem('deletedProductIds')) || [];
  } catch {
    return [];
  }
}

// Helper to add a deleted product ID to localStorage
export function addDeletedProductId(id) {
  const ids = getDeletedProductIds();
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem('deletedProductIds', JSON.stringify(ids));
  }
}

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  // Fetch products from backend on mount
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await getAllProductsApi();
        if (Array.isArray(res.data)) {
          setProducts(res.data);
          localStorage.setItem("products", JSON.stringify(res.data));
          return;
        }
        // If backend returns object with products property
        if (res.data && Array.isArray(res.data.products)) {
          setProducts(res.data.products);
          localStorage.setItem("products", JSON.stringify(res.data.products));
          return;
        }
      } catch (err) {
        // Fallback to localStorage/defaultProducts
        const saved = JSON.parse(localStorage.getItem("products") || "null");
        const deletedIds = getDeletedProductIds();
        let merged;
        if (saved && Array.isArray(saved)) {
          merged = [
            ...saved,
            ...defaultProducts.filter(def => !saved.some(p => p.id === def.id))
          ];
        } else {
          merged = defaultProducts;
        }
        setProducts(merged.filter(p => !deletedIds.includes(p.id)));
      }
    }
    fetchProducts();
  }, []);

  // Sync to localStorage whenever products change
  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  // Listen for storage changes (other tabs)
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "products") {
        const saved = JSON.parse(e.newValue || "null");
        if (saved && Array.isArray(saved)) setProducts(saved);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <ProductContext.Provider value={{ products, setProducts }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
}

export { defaultProducts }; 