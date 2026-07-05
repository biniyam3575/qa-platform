import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FaUserCircle,
  FaChevronDown,
  FaSignOutAlt,
  FaUserEdit,
  FaBars,
  FaTimes,
  FaQuestionCircle,
} from 'react-icons/fa';
import classes from './Header.module.css';
import logo from '../../assets/images/logo.png';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/how-it-works', label: 'How it works' },
];

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && token) {
      const parsedUser = JSON.parse(savedUser);
      setUserData(parsedUser);
      // Populate from your context/API once the backend is wired up.
      setQuestionCount(parsedUser.totalQuestions || 0);
    }
  }, [token]);

  // Close the account dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Add a subtle elevation once the page has scrolled
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserData(null);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
    window.location.reload();
  };

  const initials = (userData?.userName || 'A')
    .trim()
    .charAt(0)
    .toUpperCase();

  const renderNavLinks = (onLinkClick) =>
    NAV_LINKS.map((link) => (
      <Link
        key={link.to}
        to={link.to}
        onClick={onLinkClick}
        className={`${classes.navLink} ${
          location.pathname === link.to ? classes.navLinkActive : ''
        }`}
      >
        {link.label}
      </Link>
    ));

  return (
    <header className={`${classes.header} ${scrolled ? classes.headerScrolled : ''}`}>
      <div className={classes.headerContainer}>
        <Link to="/" className={classes.logo} aria-label="Go to homepage">
          <img src={logo} alt="" className={classes.logoImg} />
        </Link>

        {/* Desktop navigation */}
        <nav className={classes.navLinks} aria-label="Primary">
          {renderNavLinks()}
        </nav>

        <div className={classes.actions}>
          {token ? (
            <div className={classes.profileWrapper} ref={dropdownRef}>
              <button
                type="button"
                className={classes.profileTrigger}
                onClick={() => setDropdownOpen((open) => !open)}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                {userData?.profile_image ? (
                  <img
                    src={userData.profile_image}
                    className={classes.avatarImg}
                    alt=""
                  />
                ) : (
                  <span className={classes.avatarFallback}>{initials}</span>
                )}
                <span className={classes.userNameText}>
                  {userData?.userName || 'Account'}
                </span>
                <FaChevronDown
                  className={`${classes.caret} ${dropdownOpen ? classes.caretOpen : ''}`}
                  aria-hidden="true"
                />
              </button>

              {dropdownOpen && (
                <div className={classes.dropdownMenu} role="menu">
                  <div className={classes.dropdownHeader}>
                    <p className={classes.dropdownEyebrow}>Signed in as</p>
                    <strong className={classes.dropdownName}>
                      {userData?.userName || 'User'}
                    </strong>
                  </div>

                  <div className={classes.divider} />

                  <Link
                    to="/my-questions"
                    className={classes.dropdownItem}
                    onClick={() => setDropdownOpen(false)}
                    role="menuitem"
                  >
                    <FaQuestionCircle className={classes.icon} aria-hidden="true" />
                    <span className={classes.itemText}>My Questions</span>
                    {questionCount > 0 && (
                      <span className={classes.countBadge}>{questionCount}</span>
                    )}
                  </Link>

                  <Link
                    to="/settings"
                    className={classes.dropdownItem}
                    onClick={() => setDropdownOpen(false)}
                    role="menuitem"
                  >
                    <FaUserEdit className={classes.icon} aria-hidden="true" />
                    <span className={classes.itemText}>Update Profile</span>
                  </Link>

                  <div className={classes.divider} />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className={`${classes.dropdownItem} ${classes.dropdownItemButton}`}
                    role="menuitem"
                  >
                    <FaSignOutAlt className={classes.icon} aria-hidden="true" />
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

          {/* Mobile menu toggle */}
          <button
            type="button"
            className={classes.menuIcon}
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile navigation panel */}
      <div
        className={`${classes.mobilePanel} ${mobileMenuOpen ? classes.mobilePanelOpen : ''}`}
      >
        <nav className={classes.mobileNavLinks} aria-label="Mobile">
          {renderNavLinks(() => setMobileMenuOpen(false))}
        </nav>

        <div className={classes.mobileDivider} />

        {token ? (
          <div className={classes.mobileAccount}>
            <div className={classes.mobileAccountHeader}>
              {userData?.profile_image ? (
                <img
                  src={userData.profile_image}
                  className={classes.avatarImg}
                  alt=""
                />
              ) : (
                <span className={classes.avatarFallback}>{initials}</span>
              )}
              <div>
                <p className={classes.dropdownEyebrow}>Signed in as</p>
                <strong className={classes.dropdownName}>
                  {userData?.userName || 'User'}
                </strong>
              </div>
            </div>

            <Link
              to="/my-questions"
              className={classes.dropdownItem}
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaQuestionCircle className={classes.icon} aria-hidden="true" />
              <span className={classes.itemText}>My Questions</span>
              {questionCount > 0 && (
                <span className={classes.countBadge}>{questionCount}</span>
              )}
            </Link>

            <Link
              to="/settings"
              className={classes.dropdownItem}
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaUserEdit className={classes.icon} aria-hidden="true" />
              <span className={classes.itemText}>Update Profile</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className={`${classes.dropdownItem} ${classes.dropdownItemButton}`}
            >
              <FaSignOutAlt className={classes.icon} aria-hidden="true" />
              <span className={classes.itemText}>Log Out</span>
            </button>
          </div>
        ) : (
          <div className={classes.mobileAuthGroup}>
            <Link
              to="/login"
              className={classes.loginBtn}
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className={classes.signupBtn}
              onClick={() => setMobileMenuOpen(false)}
            >
              Join Community
            </Link>
          </div>
        )}
      </div>

      {/* Backdrop for mobile menu */}
      {mobileMenuOpen && (
        <div
          className={classes.backdrop}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
};

export default Header;