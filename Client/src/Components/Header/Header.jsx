import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUserCircle, FaChevronDown, FaSignOutAlt, FaUserEdit, FaBars, FaTimes, FaQuestionCircle } from 'react-icons/fa';
import classes from './Header.module.css';
import logo from '../../assets/images/logo.png';

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [questionCount, setQuestionCount] = useState(0); // Feature: Dynamic count tracking
  
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && token) {
      const parsedUser = JSON.parse(savedUser);
      setUserData(parsedUser);
      
      // Feature Hint: Once your backend is connected, populate this from your context/API
      // For now, it gracefully safely checks if your local storage user payload has a count
      setQuestionCount(parsedUser.totalQuestions || 0);
    }
  }, [token]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

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
      <div className={classes.headerContainer}>
        <div className={classes.logo}>
          <Link to="/">
            <img src={logo} alt="Community Logo" />
          </Link>
        </div>

        {/* Mobile Menu Icon Toggle */}
        <div className={classes.menuIcon} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </div>

        <nav className={`${classes.navLinks} ${mobileMenuOpen ? classes.active : ''}`}>
          <Link to="/" className={location.pathname === '/' ? classes.activeLink : ''}>
            Home
          </Link>
          <Link to="/how-it-works" className={location.pathname === '/how-it-works' ? classes.activeLink : ''}>
            How it works
          </Link>

          {token ? (
            <div className={classes.profileWrapper} ref={dropdownRef}>
              <div 
                className={classes.profileTrigger} 
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {userData?.profile_image ? (
                  <img src={userData.profile_image} className={classes.avatarImg} alt="User profile" />
                ) : (
                  <FaUserCircle size={28} className={classes.defaultIcon} />
                )}
                <span className={classes.userNameText}>{userData?.userName || 'Account'}</span>
                <FaChevronDown className={`${classes.caret} ${dropdownOpen ? classes.rotate : ''}`} />
              </div>

              {dropdownOpen && (
                <div className={classes.dropdownMenu}>
                  <div className={classes.dropdownHeader}>
                    <p>Signed in as</p>
                    <strong>{userData?.userName || 'User'}</strong>
                  </div>
                  
                  <div className={classes.divider}></div>
                  
                  {/* Feature Implementation: Personal Questions Dashboard Link */}
                  <Link to="/my-questions" className={classes.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    <FaQuestionCircle className={classes.icon} /> 
                    <span className={classes.itemText}>My Questions</span>
                    {questionCount > 0 && (
                      <span className={classes.countBadge}>{questionCount}</span>
                    )}
                  </Link>

                  <Link to="/settings" className={classes.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    <FaUserEdit className={classes.icon} /> 
                    <span className={classes.itemText}>Update Profile</span>
                  </Link>
                  
                  <div className={classes.divider}></div>

                  <button onClick={handleLogout} className={classes.dropdownItem}>
                    <FaSignOutAlt className={classes.icon} /> 
                    <span className={classes.itemText}>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={classes.authGroup}>
              <Link to="/login" className={classes.loginBtn}>
                Sign In
              </Link>
              <Link to="/register" className={classes.signupBtn}>
                Join Community
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;