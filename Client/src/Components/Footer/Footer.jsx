import React from 'react';
import { Link } from 'react-router-dom'; // Better than <a> tags for React
import { FaFacebook, FaInstagram, FaYoutube, FaGithub } from 'react-icons/fa';
import classes from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={classes.footer}>
      <div className={classes.footerGrid}>
        
        {/* Brand Section */}
        <div className={classes.footerSection}>
          <h2 className={classes.logoText}>DevStack<span className={classes.hub}>Hub</span></h2>
          <div className={classes.socialIcons}>
            <a href="https://facebook.com" target="_blank" rel="noreferrer"><FaFacebook /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer"><FaInstagram /></a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer"><FaYoutube /></a>
            <a href="https://github.com" target="_blank" rel="noreferrer"><FaGithub /></a>
          </div>
        </div>
        
        {/* Useful Links */}
        <div className={classes.footerSection}>
          <h4>Useful Links</h4>
          <ul>
            <li><Link to="/how-it-works">How it works</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className={classes.footerSection}>
          <h4>Contact Info</h4>
          <p>support@devstackhub.com</p>
          <p>+1-202-386-2702</p>
        </div>
      </div>
      
      <div className={classes.bottomBar}>
        <p>&copy; 2026 DevStack Hub. Built by Biniyam. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;