import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaCaretDown, FaSignOutAlt, FaUserEdit, FaBars } from 'react-icons/fa';
import classes from './Header.module.css';
import logo from '../../assets/images/logo.png';

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUserData(JSON.parse(savedUser));
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserData(null);
    setDropdownOpen(false);
    navigate('/login');
    window.location.reload();
  };

  return (
    <header className={classes.header}>
      <div className={classes.logo}>
        <Link to="/">
          <img src={logo} alt="AppLogo" /> 
        </Link>
      </div>

      {/* Mobile Menu Toggle */}
      <div className={classes.menuIcon} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        <FaBars />
      </div>

      <nav className={`${classes.navLinks} ${mobileMenuOpen ? classes.active : ''}`}>
        <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
        <Link to="/how-it-works" onClick={() => setMobileMenuOpen(false)}>How it works</Link>
        
        {token ? (
          <div className={classes.profileWrapper}>
            <div 
              className={classes.profileTrigger} 
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {userData?.profile_image ? (
                <img src={userData.profile_image} className={classes.avatarImg} alt="user" />
              ) : (
                <FaUserCircle size={32} className={classes.defaultIcon} />
              )}
              <FaCaretDown className={dropdownOpen ? classes.rotate : ''} />
            </div>

            {dropdownOpen && (
              <div className={classes.dropdownMenu}>
                <div className={classes.dropdownHeader}>
                  <p>Signed in as</p>
                  <strong>{userData?.userName}</strong>
                </div>
                <hr />
                <Link to="/settings" className={classes.dropdownItem} onClick={() => setDropdownOpen(false)}>
                  <FaUserEdit /> Update Profile
                </Link>
                <button onClick={handleLogout} className={classes.dropdownItem}>
                  <FaSignOutAlt /> Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className={classes.authBtn} onClick={() => setMobileMenuOpen(false)}>Login</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;