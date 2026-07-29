import { useEffect, useState } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', price: '', image_url: '', stock: '' });
  const [editingId, setEditingId] = useState(null);
  const token = localStorage.getItem('token');

  const fetchProducts = () => {
    axios.get('http://localhost:5000/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const headers = { Authorization: `Bearer ${token}` };

    try {   
      if (editingId) {
        await axios.put('http://localhost:5000/api/products/${editingId}', form, { headers });
      } else {
        await axios.post('http://localhost:5000/api/products', form, { headers });
      }
      setForm({ name: '', description: '', price: '', image_url: '', stock: '' });
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.image_url,
      stock: product.stock,
    });
    setEditingId(product.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete('http://localhost:5000/api/products/${id}', {
        headers: { Authorization: 'Bearer ${token}' },
      });
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete product');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin Dashboard</h1>

      <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
        <div>
          <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        </div>
        <div>
          <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        </div>
        <div>
          <input name="price" type="number" step="0.01" placeholder="Price" value={form.price} onChange={handleChange} required />
        </div>
        <div>
          <input name="image_url" placeholder="Image URL" value={form.image_url} onChange={handleChange} />
        </div>
        <div>
          <input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleChange} required />
        </div>
        <button type="submit">{editingId ? 'Update Product' : 'Add Product'}</button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', description: '', price: '', image_url: '', stock: '' }); }}>
            Cancel
          </button>
        )}
      </form>

      <h2>All Products</h2>
      {products.map(product => (
        <div key={product.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}>
          <h3>{product.name}</h3>
          <p>₹{product.price} | Stock: {product.stock}</p>
          <button onClick={() => handleEdit(product)}>Edit</button>
          <button onClick={() => handleDelete(product.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default AdminDashboard;