import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosBase from '../../api/axiosConfig';
import classes from './Register.module.css'; 

const Register = () => {
  const [formData, setFormData] = useState({
    userName: '', first_name: '', last_name: '', email: '', password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axiosBase.post('/users/register', formData);
      if (response.data.success) {
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.card}>
        <h2 className={classes.title}>Create an Account</h2>
        <p className={classes.subtitle}>Join our community today</p>
        
        {error && <div className={classes.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} className={classes.form}>
          <input 
            className={classes.input}
            type="text" name="userName" placeholder="Username" 
            onChange={handleChange} required 
          />
          <div className={classes.row}>
            <input 
              className={classes.input}
              type="text" name="first_name" placeholder="First Name" 
              onChange={handleChange} required 
            />
            <input 
              className={classes.input}
              type="text" name="last_name" placeholder="Last Name" 
              onChange={handleChange} required 
            />
          </div>
          <input 
            className={classes.input}
            type="email" name="email" placeholder="Email Address" 
            onChange={handleChange} required 
          />
          <input 
            className={classes.input}
            type="password" name="password" placeholder="Password" 
            onChange={handleChange} required 
          />

          <button type="submit" disabled={loading} className={classes.button}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className={classes.footerText}>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;