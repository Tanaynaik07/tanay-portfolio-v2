// src/components/Contact.jsx
import React from 'react';
import '../styles/Contact.css';

const links = [
  { label: 'Email', value: 'REPLACE_EMAIL', href: 'mailto:REPLACE_EMAIL' },
  { label: 'GitHub', value: '@Tanaynaik07', href: 'https://github.com/Tanaynaik07' },
  { label: 'LinkedIn', value: 'REPLACE_LINKEDIN_HANDLE', href: 'REPLACE_LINKEDIN_URL' },
  { label: 'Instagram', value: '@tanay_n_7', href: 'https://www.instagram.com/tanay_n_7/' },
];

const Contact = () => {
  return (
    <section className="section" id="connect">
      <span className="eyebrow">Get in touch</span>
      <h2 className="section-title">Connect</h2>
      <div className="contact-grid">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target={l.href.startsWith('mailto:') ? undefined : '_blank'}
            rel={l.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
            className="contact-card"
          >
            <span className="contact-label">{l.label}</span>
            <span className="contact-value">{l.value}</span>
          </a>
        ))}
      </div>
    </section>
  );
};

export default Contact;
