import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Cart from './pages/Cart';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: '10px', borderBottom: '1px solid #444' }}>
        <Link to="/" style={{ marginRight: '15px' }}>Home</Link>
        <Link to="/cart" style={{ marginRight: '15px' }}>Cart</Link>
        <Link to="/login" style={{ marginRight: '15px' }}>Login</Link>
        <Link to="/signup">Sign Up</Link>
        <Link to="/admin" style={{marginRight: '15px'}}>Admin</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;