import React, { useEffect, useState } from 'react';
import axios from 'axios';

const initialForm = {
  brand: '',
  model: '',
  price: '',
  oldPrice: '',
  status: '',
  details: '',
  stock: '',
  costPrice: '',
  images: []
};

const API_BASE = 'http://localhost:5000';

const AdminProductManager = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchProducts = () => {
    setLoading(true);
    axios.get(`${API_BASE}/api/products`)
      .then(res => setProducts(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Failed to fetch products'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'images') {
      setForm(f => ({ ...f, images: files }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'images') {
        for (let i = 0; i < value.length; i++) {
          formData.append('images', value[i]);
        }
      } else {
        formData.append(key, value);
      }
    });
    try {
      const token = localStorage.getItem('token');
      if (editingId) {
        await axios.put(`${API_BASE}/api/products/${editingId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        await axios.post(`${API_BASE}/api/products`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
      }
      setForm(initialForm);
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      let msg = 'Failed to save product';
      if (err.response && err.response.data && err.response.data.message) {
        msg += ': ' + err.response.data.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = product => {
    setEditingId(product.id);
    setForm({
      brand: product.brand || '',
      model: product.model || '',
      price: product.price || '',
      oldPrice: product.oldPrice || '',
      status: product.status || '',
      details: product.details || '',
      stock: product.stock || '',
      costPrice: product.costPrice || '',
      images: [] // upload new images if needed
    });
    window.scrollTo(0, 0);
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this product?')) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/api/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchProducts();
    } catch {
      setError('Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async imageId => {
    if (!window.confirm('Delete this image?')) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/api/products/image/${imageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchProducts();
    } catch {
      setError('Failed to delete image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Product Manager</h1>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="brand" value={form.brand} onChange={handleChange} placeholder="Brand" className="border p-2" required />
        <input name="model" value={form.model} onChange={handleChange} placeholder="Model" className="border p-2" required />
        <input name="price" value={form.price} onChange={handleChange} placeholder="Price" type="number" className="border p-2" required />
        <input name="oldPrice" value={form.oldPrice} onChange={handleChange} placeholder="Old Price" type="number" className="border p-2" />
        <input name="status" value={form.status} onChange={handleChange} placeholder="Status" className="border p-2" />
        <input name="stock" value={form.stock} onChange={handleChange} placeholder="Stock" type="number" className="border p-2" />
        <input name="costPrice" value={form.costPrice} onChange={handleChange} placeholder="Cost Price" type="number" className="border p-2" />
        <textarea name="details" value={form.details} onChange={handleChange} placeholder="Details" className="border p-2 md:col-span-2" />
        <input name="images" type="file" multiple onChange={handleChange} className="md:col-span-2" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded md:col-span-2" disabled={loading}>{editingId ? 'Update' : 'Add'} Product</button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm(initialForm);
            }}
            className="bg-gray-400 text-white px-4 py-2 rounded md:col-span-2"
          >
            Cancel Edit
          </button>
        )}
      </form>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Brand</th>
              <th className="p-2 border">Model</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Images</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(products) && products.map(product => (
              <tr key={product.id}>
                <td className="p-2 border">{product.id}</td>
                <td className="p-2 border">{product.brand}</td>
                <td className="p-2 border">{product.model}</td>
                <td className="p-2 border">{product.price}</td>
                <td className="p-2 border">
                  {product.image ? (
                    <img
                      src={`http://localhost:5000/${product.image}`}
                      alt="Product"
                      className="w-10 h-10 object-cover border"
                    />
                  ) : (
                    "No Image"
                  )}
                </td>
                <td className="p-2 border">
                  <button
                    onClick={() => handleEdit(product)}
                    className="bg-yellow-400 text-white px-2 py-1 rounded mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProductManager;
