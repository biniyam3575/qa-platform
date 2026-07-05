import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosBase from '../../api/axiosConfig';
import classes from './Settings.module.css';
import {
  FaArrowLeft,
  FaUserCircle,
  FaCamera,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaSpinner,
  FaCheck,
} from 'react-icons/fa';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dpgqaacyv/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'profile';

const PasswordField = ({ id, label, placeholder, value, onChange, error }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className={classes.inputGroup}>
      <label htmlFor={id} className={classes.label}>
        {label}
      </label>
      <div className={classes.passwordWrapper}>
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          name={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete="new-password"
          className={`${classes.textInput} ${error ? classes.inputError : ''}`}
          aria-invalid={!!error}
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
      {error && <p className={classes.fieldError}>{error}</p>}
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
  });
  const [email, setEmail] = useState('');

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  const [loading, setLoading] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await axiosBase.get('/users/profile');
        const user = data.data;
        setFormData({
          userName: user?.userName || '',
          first_name: user?.first_name || '',
          last_name: user?.last_name || '',
          profile_image: user?.profile_image || '',
        });
        setEmail(user?.email || '');
      } catch (err) {
        console.error('Fetch error:', err);
        setServerError('Could not load your profile. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    }
    if (successMessage) setSuccessMessage('');
  };

  const uploadImage = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(files[0].type)) {
      setServerError('Please choose a JPG, PNG, WEBP, or GIF image.');
      return;
    }

    const data = new FormData();
    data.append('file', files[0]);
    data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    setServerError('');
    setIsUploadingImage(true);
    try {
      const res = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: data,
      });
      const file = await res.json();

      if (file.secure_url) {
        setFormData((prev) => ({ ...prev, profile_image: file.secure_url }));
        setSuccessMessage('Image uploaded. Click "Save Changes" to finish.');
      } else {
        setServerError('Failed to upload image. Please try again.');
      }
    } catch (err) {
      console.error('Upload error', err);
      setServerError('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.userName.trim()) nextErrors.userName = 'Username is required.';
    if (!formData.first_name.trim()) nextErrors.first_name = 'First name is required.';
    if (!formData.last_name.trim()) nextErrors.last_name = 'Last name is required.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const { data } = await axiosBase.put('/users/update', formData);

      if (data.success) {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...storedUser, ...formData }));
        setSuccessMessage('Your profile has been updated.');
      }
    } catch (err) {
      setServerError(err.response?.data?.message || 'Update failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---- Password change ------------------------------------------------
  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (passwordErrors[e.target.name]) {
      setPasswordErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    }
    if (passwordMessage.text) setPasswordMessage({ type: '', text: '' });
  };

  const validatePassword = () => {
    const nextErrors = {};
    if (!passwordData.currentPassword) nextErrors.currentPassword = 'Enter your current password.';
    if (!passwordData.newPassword) nextErrors.newPassword = 'Enter a new password.';
    else if (passwordData.newPassword.length < 6)
      nextErrors.newPassword = 'New password must be at least 6 characters.';
    if (passwordData.confirmNewPassword !== passwordData.newPassword)
      nextErrors.confirmNewPassword = 'Passwords do not match.';
    setPasswordErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (!validatePassword()) return;

    try {
      setIsSavingPassword(true);
      const { data } = await axiosBase.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (data.success) {
        setPasswordMessage({ type: 'success', text: 'Password updated successfully.' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        setTimeout(() => setIsChangingPassword(false), 1500);
      }
    } catch (err) {
      setPasswordMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update password.',
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className={classes.loaderContainer}>
        <div className={classes.spinner} />
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <button type="button" onClick={() => navigate(-1)} className={classes.backBtn}>
        <FaArrowLeft aria-hidden="true" /> Back
      </button>

      <div className={classes.layout}>
        {/* Preview panel */}
        <aside className={classes.previewPanel}>
          <div className={classes.avatarWrapper}>
            {formData.profile_image ? (
              <img src={formData.profile_image} alt="" className={classes.avatarImg} />
            ) : (
              <FaUserCircle className={classes.avatarFallbackIcon} aria-hidden="true" />
            )}

            <label htmlFor="avatar-upload" className={classes.cameraBtn}>
              {isUploadingImage ? (
                <FaSpinner className={classes.spinnerIcon} aria-hidden="true" />
              ) : (
                <FaCamera aria-hidden="true" />
              )}
              <input
                type="file"
                id="avatar-upload"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={uploadImage}
                disabled={isUploadingImage}
                hidden
              />
            </label>
          </div>
          <p className={classes.avatarHint}>Click the camera to change your photo</p>

          <h2 className={classes.previewName}>
            {formData.first_name || formData.last_name
              ? `${formData.first_name} ${formData.last_name}`.trim()
              : 'Your Name'}
          </h2>
          <p className={classes.previewUsername}>@{formData.userName || 'username'}</p>
          <p className={classes.previewEmail}>{email}</p>
        </aside>

        {/* Form */}
        <div className={classes.formCard}>
          <h1 className={classes.formTitle}>Account Settings</h1>
          <p className={classes.formSubtitle}>
            Update how your profile appears across the community.
          </p>

          <form onSubmit={handleSubmit} className={classes.formLayout} noValidate>
            <div className={classes.fieldRow}>
              <div className={classes.inputGroup}>
                <label htmlFor="first_name" className={classes.label}>
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`${classes.textInput} ${
                    errors.first_name ? classes.inputError : ''
                  }`}
                  aria-invalid={!!errors.first_name}
                />
                {errors.first_name && <p className={classes.fieldError}>{errors.first_name}</p>}
              </div>

              <div className={classes.inputGroup}>
                <label htmlFor="last_name" className={classes.label}>
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`${classes.textInput} ${
                    errors.last_name ? classes.inputError : ''
                  }`}
                  aria-invalid={!!errors.last_name}
                />
                {errors.last_name && <p className={classes.fieldError}>{errors.last_name}</p>}
              </div>
            </div>

            <div className={classes.inputGroup}>
              <label htmlFor="userName" className={classes.label}>
                Username
              </label>
              <input
                id="userName"
                name="userName"
                type="text"
                value={formData.userName}
                onChange={handleChange}
                className={`${classes.textInput} ${errors.userName ? classes.inputError : ''}`}
                aria-invalid={!!errors.userName}
              />
              {errors.userName && <p className={classes.fieldError}>{errors.userName}</p>}
            </div>

            {serverError && (
              <div className={classes.serverError} role="alert">
                {serverError}
              </div>
            )}
            {successMessage && (
              <div className={classes.successBanner} role="status">
                <FaCheck aria-hidden="true" /> {successMessage}
              </div>
            )}

            <div className={classes.formFooter}>
              <button
                type="button"
                className={classes.cancelBtn}
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button type="submit" className={classes.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <FaSpinner className={classes.spinnerIcon} aria-hidden="true" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>

          {/* Password section */}
          <div className={classes.passwordSection}>
            <button
              type="button"
              className={classes.passwordTriggerBtn}
              onClick={() => setIsChangingPassword((prev) => !prev)}
            >
              <FaLock aria-hidden="true" />
              {isChangingPassword ? 'Cancel Password Change' : 'Change Password'}
            </button>

            {isChangingPassword && (
              <form onSubmit={handlePasswordSubmit} className={classes.passwordDrawer} noValidate>
                <PasswordField
                  id="currentPassword"
                  label="Current Password"
                  placeholder="Enter current password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  error={passwordErrors.currentPassword}
                />
                <PasswordField
                  id="newPassword"
                  label="New Password"
                  placeholder="At least 6 characters"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  error={passwordErrors.newPassword}
                />
                <PasswordField
                  id="confirmNewPassword"
                  label="Confirm New Password"
                  placeholder="Re-enter new password"
                  value={passwordData.confirmNewPassword}
                  onChange={handlePasswordChange}
                  error={passwordErrors.confirmNewPassword}
                />

                {passwordMessage.text && (
                  <div
                    className={
                      passwordMessage.type === 'success'
                        ? classes.successBanner
                        : classes.serverError
                    }
                  >
                    {passwordMessage.type === 'success' && <FaCheck aria-hidden="true" />}{' '}
                    {passwordMessage.text}
                  </div>
                )}

                <div className={classes.formFooter}>
                  <button
                    type="submit"
                    className={classes.submitBtn}
                    disabled={isSavingPassword}
                  >
                    {isSavingPassword ? (
                      <>
                        <FaSpinner className={classes.spinnerIcon} aria-hidden="true" />
                        Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;