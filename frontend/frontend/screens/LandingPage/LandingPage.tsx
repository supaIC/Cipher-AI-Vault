import React, { useState, useEffect } from 'react';
import { Types } from "ic-auth";
import ICWalletList from "../../components/auth/ICWalletList/ICWalletList";
import internetComputerLogo from '../../assets/logos/internet_computer.png';
import cipherProxyLogo from '../../assets/images/cipher_proxy_logo.png';
import { FiTwitter, FiGithub, FiGlobe } from 'react-icons/fi'; // Import icons for links
import './LandingPage.css';

interface LandingPageProps {
  giveToParent: (principal: string, agent: any, provider: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ giveToParent }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (showLogin) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }, [showLogin]);

  return (
    <div className="lp-container">
      <header className={`lp-header ${scrolled ? 'lp-scrolled' : ''}`}>
        <div className="lp-logo">
          <img src={cipherProxyLogo} alt="Cipher Proxy" />
        </div>
        <nav className="lp-nav">
          <a href="#features" className="animated-underline">Features</a>
          <a href="#about" className="animated-underline">About</a>
          <a href="#contact" className="animated-underline">Contact</a>
        </nav>
        <button className="lp-button lp-button-secondary" onClick={() => setShowLogin(!showLogin)}>
          Login
        </button>
      </header>

      <main className="lp-main-content">
        <section className="lp-hero-section">
          <h1 className="gradient-text">Secure AI Infrastructure</h1>
          <h2>on the Internet Computer</h2>
          <p>
            Experience unparalleled security and performance with Cipher AI Vault. 
            Harness the power of sandboxed AI, in-memory VectorDB, and stable memory storage.
          </p>
          <div className="lp-cta-buttons">
            <button className="lp-button lp-button-primary" onClick={() => setShowLogin(!showLogin)}>
              Get Started
            </button>
            <button className="lp-button lp-button-outline">
              Learn More
            </button>
          </div>
        </section>

        <section className="lp-features-section" id="features">
          <h3>Key Features</h3>
          <div className="lp-feature-cards">
            {[
              { icon: '🛡️', title: 'Secure Sandboxed AI', description: 'Run AI models in a secure environment, isolated from potential threats.' },
              { icon: '⚡', title: 'In-memory VectorDB', description: 'Lightning-fast data retrieval and processing for AI applications.' },
              { icon: '💾', title: 'Stable Memory Storage', description: 'Reliable, persistent storage for your critical AI data and models.' }
            ].map((feature, index) => (
              <div className="lp-card" key={index} style={{ '--animation-order': index } as React.CSSProperties}>
                <div className="lp-card-icon">{feature.icon}</div>
                <h4>{feature.title}</h4>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="lp-about-section" id="about">
          <h3>About Cipher Proxy</h3>
          <p>
            Cipher Proxy is at the forefront of secure, decentralized AI infrastructure. 
            Built on the Internet Computer, we provide developers and enterprises with the tools 
            they need to create powerful, secure AI applications without compromising on 
            performance or data integrity.
          </p>
          <div className="lp-social-links">
            <a href="https://twitter.com/cipherproxy" target="_blank" rel="noopener noreferrer">
              <FiTwitter className="lp-social-icon" /> Twitter
            </a>
            <a href="https://github.com/cipherproxy" target="_blank" rel="noopener noreferrer">
              <FiGithub className="lp-social-icon" /> GitHub
            </a>
            <a href="https://www.cipherproxy.com" target="_blank" rel="noopener noreferrer">
              <FiGlobe className="lp-social-icon" /> Website
            </a>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-footer-content">
          <div className="lp-footer-logo gradient-text">cipher proxy</div>
          <div className="lp-footer-links">
            <a href="#privacy" className="animated-underline">Privacy Policy</a>
            <a href="#terms" className="animated-underline">Terms of Service</a>
            <a href="#contact" className="animated-underline">Contact Us</a>
          </div>
        </div>
        <div className="lp-footer-bottom">
          © 2024 Cipher Proxy. All rights reserved.
        </div>
      </footer>

      {showLogin && (
        <div className={`lp-login-modal ${showLogin ? 'active' : ''}`}>
          <button className="lp-close-button" onClick={() => setShowLogin(false)}>×</button>
          <ICWalletList giveToParent={giveToParent} whitelist={[]} />
        </div>
      )}
    </div>
  );
};

export default LandingPage;
