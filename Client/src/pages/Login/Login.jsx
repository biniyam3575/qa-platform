import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosBase from '../../api/axiosConfig'; 
import classes from './Login.module.css';

const Login = () => {
  // We use 'inputValue' because your backend allows either Username OR Email
  const [inputValue, setInputValue] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // CRITICAL: The key must be 'username' to match your backend destructuring
      const response = await axiosBase.post('/users/login', {
        username: inputValue, 
        password: password
      });

      if (response.data.success) {
        // 1. Store the JWT Token
        localStorage.setItem('token', response.data.token);
        
        // 2. Store the User object (Backend returns: { success, token, user })
        // This ensures Home.jsx can access 'userName' immediately
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // 3. Move to Home Page
        navigate('/'); 
      }
    } catch (err) {
      // Handle the 401 Unauthorized or 500 Server Error
      console.error("Login Error:", err.response?.data);
      setError(err.response?.data?.message || 'Invalid username/email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.card}>
        <h2 className={classes.title}>Login to your account</h2>
        <p className={classes.subtitle}>
          Don't have an account? <Link to="/register" className={classes.orangeText}>Create a new account</Link>
        </p>

        {error && <div className={classes.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} className={classes.form}>
          <div className={classes.inputGroup}>
            <input 
              type="text" 
              placeholder="Username or Email" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)} 
              required 
              className={classes.inputField}
            />
          </div>

          <div className={classes.inputGroup}>
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className={classes.inputField}
            />
          </div>

          <button type="submit" disabled={loading} className={classes.loginBtn}>
            {loading ? 'Processing...' : 'Login'}
          </button>
        </form>

        <div className={classes.footer}>
          <Link to="/register" className={classes.forgotPassword}>
            I forgot my password
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;