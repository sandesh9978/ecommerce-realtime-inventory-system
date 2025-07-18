const API_URL = "http://localhost:5000/api/products";

export const getProducts = async (token) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(API_URL, { headers });
  return res.json();
};
