import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosBase from '../../api/axiosConfig';
import classes from './Settings.module.css';
import { FaUserCircle, FaCamera } from 'react-icons/fa';

const Settings = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userName: '',
    first_name: '',
    last_name: '',
    email: '',
    profile_image: '' // Added to track the image URL
  });
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  
  // 1. Fetch current user data on component load
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await axiosBase.get('/users/profile');
        const user = data.data;
        setFormData({
          userName: user.userName || '',
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          profile_image: user.profile_image || '' // Load existing image if any
        });
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // 2. Handle Text Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Handle Cloudinary Image Upload
  const uploadImage = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return; // Guard clause

    const data = new FormData();
    data.append('file', files[0]);
    data.append('upload_preset', 'profile'); 

    setUpdating(true);
    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dpgqaacyv/image/upload', {
        method: 'POST',
        body: data,
      });
      
      const file = await res.json();
      
      if (file.secure_url) {
        // Use functional update to ensure all other fields (name, username) are kept
        setFormData((prevData) => ({
          ...prevData,
          profile_image: file.secure_url
        }));
        
        setMessage({ type: 'success', text: 'Image uploaded! Click Save to finish.' });
        console.log("Image URL:", file.secure_url);
      }
    } catch (err) {
      console.error("Upload error", err);
      setMessage({ type: 'error', text: 'Failed to upload image.' });
    } finally {
      setUpdating(false);
    }
  };

  // 4. Handle Final Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: '', text: '' });

    try {
      // Send the complete formData including the new profile_image URL to the backend
      const response = await axiosBase.put('/users/update', formData);
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully! Redirecting...' });
        
        // Update the 'user' object in localStorage so the Header/Home UI updates immediately
        const storedUser = JSON.parse(localStorage.getItem('user')) || {};
        const updatedUser = { ...storedUser, ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Wait 2 seconds so the user sees the success message, then go home
        setTimeout(() => {
          navigate('/');
          window.location.reload(); // Refresh to ensure all components catch the new localStorage data
        }, 2000);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className={classes.loader}>Loading profile...</div>;

  return (
    <div className={classes.settingsContainer}>
      <div className={classes.settingsCard}>
        <h2>My Settings</h2>
        <p className={classes.subtitle}>Manage your public profile and account details</p>

        <form onSubmit={handleSubmit} className={classes.form}>
          
          {/* Avatar Upload Section */}
          <div className={classes.avatarSection}>
            <div className={classes.avatarWrapper}>
              {formData.profile_image ? (
                <img src={formData.profile_image} alt="Profile" className={classes.previewImg} />
              ) : (
                <FaUserCircle size={100} className={classes.bigAvatar} />
              )}
              
              <label htmlFor="avatar-upload" className={classes.cameraBtn}>
                <FaCamera />
                <input 
                  type="file" 
                  id="avatar-upload" 
                  accept="image/*"
                  onChange={uploadImage}
                  hidden 
                />
              </label>
            </div>
            <p className={classes.uploadText}>Click camera to change photo</p>
          </div>

          {/* Feedback Message */}
          {message.text && (
            <div className={message.type === 'success' ? classes.success : classes.error}>
              {message.text}
            </div>
          )}

          <div className={classes.inputGrid}>
            <div className={classes.inputGroup}>
              <label>Username</label>
              <input 
                type="text" 
                name="userName" 
                value={formData.userName} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className={classes.inputGroup}>
              <label>Email (Read-only)</label>
              <input 
                type="email" 
                value={formData.email} 
                disabled 
                className={classes.disabledInput} 
              />
            </div>
            <div className={classes.inputGroup}>
              <label>First Name</label>
              <input 
                type="text" 
                name="first_name" 
                value={formData.first_name} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className={classes.inputGroup}>
              <label>Last Name</label>
              <input 
                type="text" 
                name="last_name" 
                value={formData.last_name} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <button type="submit" className={classes.saveBtn} disabled={updating}>
            {updating ? 'Processing...' : 'Save Profile & Return Home'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;