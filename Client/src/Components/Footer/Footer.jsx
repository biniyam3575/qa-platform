import React from 'react';
import classes from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={classes.footer}>
      <div className={classes.footerGrid}>
        <div className={classes.footerSection}>
          <h4 style={{color: '#007bff'}}>Evangadi Networks</h4>
          <p>The best place to learn and share your knowledge with fellow developers across the globe.</p>
        </div>
        
        <div className={classes.footerSection}>
          <h4>Useful Links</h4>
          <ul>
            <li><a href="/">How it works</a></li>
            <li><a href="/">Terms of Service</a></li>
            <li><a href="/">Privacy Policy</a></li>
          </ul>
        </div>

        <div className={classes.footerSection}>
          <h4>Contact Info</h4>
          <ul>
            <li>Evangadi Networks</li>
            <li>support@evangadi.com</li>
            <li>+1-202-386-2702</li>
          </ul>
        </div>
      </div>
      
      <div className={classes.bottomBar}>
        &copy; 2026 Evangadi Networks. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;