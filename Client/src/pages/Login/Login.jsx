import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axiosBase from '../../api/axiosConfig';
import { FaArrowLeft, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import classes from './Login.module.css';

const Login = () => {
  const [inputValue, setInputValue] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const fromPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axiosBase.post('/users/login', {
        username: inputValue.trim(),
        password: password,
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate(fromPath, { replace: true });
      }
    } catch (err) {
      console.error('Login failed:', err.response?.data);
      setError(err.response?.data?.message || 'Invalid username/email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.container}>
      <button type="button" onClick={() => navigate('/')} className={classes.backBtn}>
        <FaArrowLeft aria-hidden="true" /> Back to Dashboard
      </button>

      <div className={classes.formCard}>
        <p className={classes.eyebrow}>Welcome back</p>
        <h1 className={classes.formTitle}>Sign In</h1>
        <p className={classes.formSubtitle}>
          Access your developer profile and continue the conversation.
        </p>

        {error && (
          <div className={classes.serverError} role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={classes.formLayout} noValidate>
          <div className={classes.inputGroup}>
            <label htmlFor="login-identifier" className={classes.label}>
              Username or Email
            </label>
            <input
              id="login-identifier"
              type="text"
              placeholder="e.g. jane_doe or jane@example.com"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              required
              className={classes.textInput}
            />
          </div>

          <div className={classes.inputGroup}>
            <label htmlFor="login-password" className={classes.label}>
              Password
            </label>
            <div className={classes.passwordWrapper}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={classes.textInput}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={classes.eyeBtn}
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className={classes.submitBtn}>
            {loading ? (
              <>
                <FaSpinner className={classes.spinnerIcon} aria-hidden="true" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className={classes.formFooterLinks}>
          <span className={classes.footerText}>New to the community?</span>{' '}
          <Link to="/register" className={classes.footerLink}>
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;