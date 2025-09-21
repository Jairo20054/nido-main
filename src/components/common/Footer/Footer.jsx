import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-links">
        <a href="#">Privacidad</a>
        <span>·</span>
        <a href="#">Términos</a>
        <span>·</span>
        <a href="#">Publicidad</a>
      </div>
      <div className="copyright">
        © {new Date().getFullYear()} ViviendaSocial
      </div>
    </footer>
  );
};

export default Footer;
