import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const { setToken, setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/register', formData);
      setToken(data.token);
      setUser(data);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--main-bg)' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-md)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ marginBottom: '10px', color: 'var(--text-main)' }}>Create Account</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>Join Code Chunker Pro today.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              required 
              style={{ color: 'black', background: '#F4F5F8', border: '1px solid var(--border-color)' }}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              required 
              style={{ color: 'black', background: '#F4F5F8', border: '1px solid var(--border-color)' }}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              required 
              style={{ color: 'black', background: '#F4F5F8', border: '1px solid var(--border-color)' }}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Get Started</button>
        </form>
        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--pm-orange)', fontWeight: '600' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;