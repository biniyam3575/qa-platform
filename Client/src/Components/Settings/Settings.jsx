import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosBase from '../../api/axiosConfig';
import classes from './Settings.module.css';
import { FaUserCircle, FaCamera, FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';

const PasswordField = ({ id, label, placeholder, value, onChange, required }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className={classes.inputGroup}>
      <label htmlFor={id}>{label}</label>
      <div className={classes.passwordWrapper}>
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          name={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete="new-password"
        />
        <button
          type="button"
          className={classes.eyeBtn}
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          {visible ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
    </div>
  );
};

const Settings = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userName: '',
    first_name: '',
    last_name: '',
    profile_image: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // 1. Fetch current user data on component load
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await axiosBase.get('/users/profile');
        const user = data.data;
        setFormData((prev) => ({
          ...prev,
          userName: user.userName || '',
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          profile_image: user.profile_image || '',
        }));
      } catch (err) {
        console.error('Fetch error:', err);
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
    if (!files || files.length === 0) return;

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
        setFormData((prevData) => ({
          ...prevData,
          profile_image: file.secure_url,
        }));
        setMessage({ type: 'success', text: 'Image uploaded! Click Save to finish.' });
      }
    } catch (err) {
      console.error('Upload error', err);
      setMessage({ type: 'error', text: 'Failed to upload image.' });
    } finally {
      setUpdating(false);
    }
  };

  // 4. Handle Final Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (isChangingPassword && formData.newPassword !== formData.confirmNewPassword) {
      setMessage({ type: 'error', text: 'The new passwords do not match.' });
      return;
    }

    setUpdating(true);
    try {
      const { currentPassword, newPassword, confirmNewPassword, ...profileFields } = formData;
      const payload = isChangingPassword
        ? { ...profileFields, currentPassword, newPassword }
        : profileFields;

      const response = await axiosBase.put('/users/update', payload);

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully! Redirecting...' });

        const storedUser = JSON.parse(localStorage.getItem('user')) || {};
        const updatedUser = { ...storedUser, ...profileFields };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        setTimeout(() => {
          navigate('/');
          window.location.reload();
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
              <label htmlFor="userName">Username</label>
              <input
                id="userName"
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                required
              />
            </div>
            <div className={classes.inputGroup}>
              <label htmlFor="first_name">First Name</label>
              <input
                id="first_name"
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className={classes.inputGroup}>
              <label htmlFor="last_name">Last Name</label>
              <input
                id="last_name"
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Change Password Section */}
          <div className={classes.passwordToggleRow}>
            <button
              type="button"
              className={classes.passwordTriggerBtn}
              onClick={() => setIsChangingPassword((prev) => !prev)}
            >
              <FaLock size={12} /> {isChangingPassword ? 'Cancel Password Change' : 'Change Password'}
            </button>
          </div>

          {isChangingPassword && (
            <div className={classes.passwordDrawer}>
              <PasswordField
                id="currentPassword"
                label="Current Password"
                placeholder="Enter current password"
                value={formData.currentPassword}
                onChange={handleChange}
                required={isChangingPassword}
              />
              <PasswordField
                id="newPassword"
                label="New Password"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleChange}
                required={isChangingPassword}
              />
              <PasswordField
                id="confirmNewPassword"
                label="Confirm New Password"
                placeholder="Re-enter new password"
                value={formData.confirmNewPassword}
                onChange={handleChange}
                required={isChangingPassword}
              />
            </div>
          )}

          <button type="submit" className={classes.saveBtn} disabled={updating}>
            {updating ? 'Processing...' : 'Save Profile & Return Home'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;