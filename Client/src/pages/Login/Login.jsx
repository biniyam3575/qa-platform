import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosBase from '../../api/axiosConfig'; 
import classes from './Login.module.css';

const Login = () => {
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axiosBase.post('/users/login', {
        username: username, 
        password: password
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/'); 
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.card}>
        <h2 className={classes.title}>Login</h2>
        {error && <div className={classes.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={classes.form}>
          <input 
            type="text" 
            placeholder="Username or Email" 
            value={username}
            onChange={(e) => setUsername(e.target.value)} 
            required 
            className={classes.input}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            required 
            className={classes.input}
          />
          <button type="submit" disabled={loading} className={classes.button}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className={classes.footerText}>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;