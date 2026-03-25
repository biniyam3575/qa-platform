import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import classes from './Header.module.css';

const Header = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className={classes.header}>
      <div className={classes.logo}>
        <Link to="/">
          <img src="/logo.png" alt="AppLogo" /> 
        </Link>
      </div>

      <nav className={classes.navLinks}>
        <Link to="/">Home</Link>
        <Link to="/how-it-works">How it works</Link>
        
        {token ? (
          <>
            <button onClick={handleLogout} className={classes.logoutBtn}>
              Log Out
            </button>
          </>
        ) : (
          <Link to="/login" className={classes.authBtn}>Login</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;