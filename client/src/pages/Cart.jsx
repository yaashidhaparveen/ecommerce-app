import { useCart } from '../CartContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Cart() {
  const { cart, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first');
      navigate('/login');
      return;
    }

    try {
      const items = cart.map(item => ({ product_id: item.id, quantity: item.quantity }));
      await axios.post(
        'http://localhost:5000/api/orders',
        { items },
        { headers: { Authorization: 'Bearer ${token}' } }
      )
      clearCart();
      alert('Order placed successfully!');
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.error || 'Checkout failed');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Your Cart</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cart.map(item => (
            <div key={item.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}>
              <h3>{item.name}</h3>
              <p>Quantity: {item.quantity}</p>
              <p>₹{item.price} each</p>
              <button onClick={() => removeFromCart(item.id)}>Remove</button>
            </div>
          ))}
          <h2>Total: ₹{total.toFixed(2)}</h2>
          <button onClick={handleCheckout}>Checkout</button>
        </>
      )}
    </div>
  );
}

export default Cart;