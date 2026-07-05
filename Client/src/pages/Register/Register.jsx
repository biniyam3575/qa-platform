import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosBase from '../../api/axiosConfig';
import { FaArrowLeft, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import classes from './Register.module.css';

const Register = () => {
  const [formData, setFormData] = useState({
    userName: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify your inputs.');
      return;
    }

    setLoading(true);

    try {
      const { userName, first_name, last_name, email, password } = formData;
      const response = await axiosBase.post('/users/register', {
        userName: userName.trim(),
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.trim(),
        password,
      });

      if (response.data.success) {
        navigate('/login');
      }
    } catch (err) {
      console.error('Registration failed:', err.response?.data);
      setError(err.response?.data?.message || 'Something went wrong during account provisioning.');
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
        <p className={classes.eyebrow}>Join us</p>
        <h1 className={classes.formTitle}>Create an Account</h1>
        <p className={classes.formSubtitle}>
          Set up your developer profile and join the community.
        </p>

        {error && (
          <div className={classes.serverError} role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={classes.formLayout} noValidate>
          <div className={classes.inputGroup}>
            <label htmlFor="register-username" className={classes.label}>
              Username
            </label>
            <input
              id="register-username"
              type="text"
              name="userName"
              placeholder="e.g. jane_doe"
              value={formData.userName}
              onChange={handleChange}
              required
              className={classes.textInput}
            />
          </div>

          <div className={classes.row}>
            <div className={classes.inputGroup}>
              <label htmlFor="register-first-name" className={classes.label}>
                First Name
              </label>
              <input
                id="register-first-name"
                type="text"
                name="first_name"
                placeholder="Jane"
                value={formData.first_name}
                onChange={handleChange}
                required
                className={classes.textInput}
              />
            </div>

            <div className={classes.inputGroup}>
              <label htmlFor="register-last-name" className={classes.label}>
                Last Name
              </label>
              <input
                id="register-last-name"
                type="text"
                name="last_name"
                placeholder="Doe"
                value={formData.last_name}
                onChange={handleChange}
                required
                className={classes.textInput}
              />
            </div>
          </div>

          <div className={classes.inputGroup}>
            <label htmlFor="register-email" className={classes.label}>
              Email Address
            </label>
            <input
              id="register-email"
              type="email"
              name="email"
              placeholder="jane@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className={classes.textInput}
            />
          </div>

          <div className={classes.inputGroup}>
            <label htmlFor="register-password" className={classes.label}>
              Password
            </label>
            <div className={classes.passwordWrapper}>
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
                className={classes.textInput}
                autoComplete="new-password"
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

          <div className={classes.inputGroup}>
            <label htmlFor="register-confirm-password" className={classes.label}>
              Confirm Password
            </label>
            <div className={classes.passwordWrapper}>
              <input
                id="register-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className={classes.textInput}
                autoComplete="new-password"
              />
              <button
                type="button"
                className={classes.eyeBtn}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className={classes.submitBtn}>
            {loading ? (
              <>
                <FaSpinner className={classes.spinnerIcon} aria-hidden="true" />
                Registering Account...
              </>
            ) : (
              'Register'
            )}
          </button>
        </form>

        <div className={classes.formFooterLinks}>
          <span className={classes.footerText}>Already have an account?</span>{' '}
          <Link to="/login" className={classes.footerLink}>
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;