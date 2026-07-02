// src/components/Footer.jsx
import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} Tanay Naik</p>
    </footer>
  );
};

export default Footer;
