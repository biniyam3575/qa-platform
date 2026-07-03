import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axiosBase from '../../api/axiosConfig'; 
import { FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import classes from './Login.module.css';

const Login = () => {
  const [inputValue, setInputValue] = useState(''); 
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const fromNode = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axiosBase.post('/users/login', {
        username: inputValue.trim(), 
        password: password
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        navigate(fromNode, { replace: true }); 
      }
    } catch (err) {
      console.error("Login Context Rejection:", err.response?.data);
      setError(err.response?.data?.message || 'Invalid username/email or password configurations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.container}>
      {/* Structural Back Arrow Layer */}
      <div className={classes.navigationHeader}>
        <button onClick={() => navigate('/')} className={classes.backBtn} title="Return to Dashboard">
          <FaArrowLeft className={classes.arrowIcon} /> Back to Dashboard
        </button>
      </div>

      <div className={classes.card}>
        <h2 className={classes.title}>Sign In</h2>
        <p className={classes.subtitle}>Access your academic engineering profile</p>

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
            <div className={classes.passwordWrapper}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className={classes.inputFieldPassword}
              />
              <button 
                type="button" 
                className={classes.eyeToggleButton}
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password string" : "Reveal password string"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className={classes.loginBtn}>
            {loading ? 'Processing Authentication...' : 'Sign In'}
          </button>
        </form>

        {/* Professional Lower Account Creation Container */}
        <div className={classes.footer}>
          <span className={classes.footerText}>New to our community? </span>
          <Link to="/register" className={classes.darkLink}>
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;