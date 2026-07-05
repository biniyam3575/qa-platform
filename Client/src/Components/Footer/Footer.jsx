import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaGithub,
  FaTwitter,
  FaLinkedin,
  FaCode,
  FaHeart,
} from 'react-icons/fa';
import classes from './Footer.module.css';

const CURRENT_YEAR = new Date().getFullYear();

const PRODUCT_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/ask', label: 'Ask a Question' },
];

const ACCOUNT_LINKS = [
  { to: '/my-questions', label: 'My Questions' },
  { to: '/settings', label: 'Account Settings' },
  { to: '/login', label: 'Sign In' },
  { to: '/register', label: 'Join Community' },
];

const SOCIAL_LINKS = [
  { href: 'https://github.com', label: 'GitHub', icon: <FaGithub /> },
  { href: 'https://twitter.com', label: 'Twitter', icon: <FaTwitter /> },
  { href: 'https://linkedin.com', label: 'LinkedIn', icon: <FaLinkedin /> },
];

const Footer = () => {
  return (
    <footer className={classes.footer}>
      <div className={classes.footerContainer}>
        {/* Brand */}
        <div className={classes.brandColumn}>
          <Link to="/" className={classes.brandLogo}>
            <span className={classes.brandIcon}>
              <FaCode aria-hidden="true" />
            </span>
            <span className={classes.brandName}>DevStackHub</span>
          </Link>
          <p className={classes.brandTagline}>
            A community-driven platform where developers ask questions, share
            solutions, and grow together.
          </p>
          <div className={classes.socialRow}>
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={classes.socialIcon}
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Product links */}
        <div className={classes.linkColumn}>
          <h3 className={classes.columnTitle}>Product</h3>
          <ul className={classes.linkList}>
            {PRODUCT_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className={classes.footerLink}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Account links */}
        <div className={classes.linkColumn}>
          <h3 className={classes.columnTitle}>Account</h3>
          <ul className={classes.linkList}>
            {ACCOUNT_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className={classes.footerLink}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={classes.footerDivider} />

      <div className={classes.footerBottom}>
        <p className={classes.copyright}>
          © {CURRENT_YEAR} DevStackHub. All rights reserved.
        </p>
        <p className={classes.madeWith}>
          Built with <FaHeart className={classes.heartIcon} aria-hidden="true" /> for developers
        </p>
      </div>
    </footer>
  );
};

export default Footer;