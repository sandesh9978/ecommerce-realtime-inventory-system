import axios from 'axios';
const ApiFormData = axios.create({
    baseURL: 'http://localhost:5000',
    withCredentials: true,
    headers: {
        "Content-Type": "multipart/form-data",
    },
});
const Api = axios.create({
    baseURL: 'http://localhost:5000',
    sithCredentials: true,
    headers: {"Content-Type": "application/json"}
});
export const createUserApi = (data) => ApiFormData.post("/api/pract/create", data);
export const loginUserApi = (data) => Api.post("/api/pract/login", data);
export const getAllProductsApi = () => Api.get("/api/products");
export const addProductApi = (data, token) =>
    Api.post("/api/admin/products", data, {
      headers: { Authorization: `Bearer ${token}` }
    });
export const editProductApi = (id, data, token) =>
  Api.put(`/api/admin/products/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
export const deleteProductApi = (id, token) =>
  Api.delete(`/api/admin/products/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
export const getCartApi = (token) =>
  Api.get("/api/cart", { headers: { Authorization: `Bearer ${token}` } });
export const addToCartApi = (productId, quantity, token) =>
  Api.post("/api/cart/add", { productId, quantity }, { headers: { Authorization: `Bearer ${token}` } });
export const removeFromCartApi = (cartId, token) =>
  Api.delete(`/api/cart/${cartId}`, { headers: { Authorization: `Bearer ${token}` } });
export const clearCartApi = (token) =>
  Api.post("/api/cart/clear", {}, { headers: { Authorization: `Bearer ${token}` } });
export const checkoutCartApi = (token) =>
  Api.post("/api/cart/checkout", {}, { headers: { Authorization: `Bearer ${token}` } });
export const getWishlistApi = (token) =>
  Api.get("/api/wishlist", { headers: { Authorization: `Bearer ${token}` } });
export const addToWishlistApi = (productId, token) =>
  Api.post("/api/wishlist/add", { productId }, { headers: { Authorization: `Bearer ${token}` } });
export const removeFromWishlistApi = (wishlistId, token) =>
  Api.delete(`/api/wishlist/${wishlistId}`, { headers: { Authorization: `Bearer ${token}` } });
export const clearWishlistApi = (token) =>
  Api.post("/api/wishlist/clear", {}, { headers: { Authorization: `Bearer ${token}` } });
export const getOrdersApi = (token) =>
  Api.get("/api/orders", { headers: { Authorization: `Bearer ${token}` } });
export const placeOrderApi = (orderData, token) =>
  Api.post("/api/orders", orderData, { headers: { Authorization: `Bearer ${token}` } });
export const cancelOrderApi = (orderId, token) =>
  Api.put(`/api/orders/${orderId}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
export const getProductReviewsApi = (productId) =>
  Api.get(`/api/products/${productId}/reviews`);
export const addProductReviewApi = (productId, data, token) =>
  Api.post(`/api/products/${productId}/reviews`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
export const getProductByIdApi = (id) => Api.get(`/api/products/${id}`);