import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosBase from '../../api/axiosConfig';
import { FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import classes from './Register.module.css'; 

const Register = () => {
  const [formData, setFormData] = useState({
    userName: '', first_name: '', last_name: '', email: '', password: '', confirmPassword: ''
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

    // Client-side verification for matching passwords
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match. Please verify your inputs.");
    }

    setLoading(true);
    try {
      // Exclude confirmPassword from payload data sent to your backend
      const { userName, first_name, last_name, email, password } = formData;
      const response = await axiosBase.post('/users/register', {
        userName: userName.trim(),
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.trim(),
        password
      });

      if (response.data.success) {
        alert("Account registered successfully!");
        navigate('/login');
      }
    } catch (err) {
      console.error("Registration failed:", err.response?.data);
      setError(err.response?.data?.message || 'Something went wrong during account provisioning.');
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
        <h2 className={classes.title}>Create an Account</h2>
        <p className={classes.subtitle}>Join our community today</p>
        
        {error && <div className={classes.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} className={classes.form}>
          <div className={classes.inputGroup}>
            <input 
              className={classes.input}
              type="text" 
              name="userName" 
              placeholder="Username" 
              value={formData.userName}
              onChange={handleChange} 
              required 
            />
          </div>

          <div className={classes.row}>
            <div className={classes.inputGroup}>
              <input 
                className={classes.input}
                type="text" 
                name="first_name" 
                placeholder="First Name" 
                value={formData.first_name}
                onChange={handleChange} 
                required 
              />
            </div>
            <div className={classes.inputGroup}>
              <input 
                className={classes.input}
                type="text" 
                name="last_name" 
                placeholder="Last Name" 
                value={formData.last_name}
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div className={classes.inputGroup}>
            <input 
              className={classes.input}
              type="email" 
              name="email" 
              placeholder="Email Address" 
              value={formData.email}
              onChange={handleChange} 
              required 
            />
          </div>

          {/* Primary Password Field */}
          <div className={classes.inputGroup}>
            <div className={classes.passwordWrapper}>
              <input 
                className={classes.inputPassword}
                type={showPassword ? "text" : "password"} 
                name="password" 
                placeholder="Password" 
                value={formData.password}
                onChange={handleChange} 
                required 
              />
              <button 
                type="button" 
                className={classes.eyeToggleButton}
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Reveal password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className={classes.inputGroup}>
            <div className={classes.passwordWrapper}>
              <input 
                className={classes.inputPassword}
                type={showConfirmPassword ? "text" : "password"} 
                name="confirmPassword" 
                placeholder="Confirm Password" 
                value={formData.confirmPassword}
                onChange={handleChange} 
                required 
              />
              <button 
                type="button" 
                className={classes.eyeToggleButton}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                title={showConfirmPassword ? "Hide password" : "Reveal password"}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className={classes.button}>
            {loading ? 'Registering Account...' : 'Register'}
          </button>
        </form>

        <div className={classes.footer}>
          <span className={classes.footerLabel}>Already have an account? </span>
          <Link to="/login" className={classes.darkLink}>Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;