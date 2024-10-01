import React, { useState, useEffect } from 'react';
import { Types } from "ic-auth";
import ICWalletList from "../../components/auth/ICWalletList/ICWalletList";
import internetComputerLogo from '../../assets/images/internet_computer.png';
import cipherProxyLogo from '../../assets/images/cipher_proxy_logo.png';
import cipherProxyTag from '../../assets/images/cipher_proxy.png';
import { FiTwitter, FiGithub, FiGlobe, FiLogIn, FiArrowRight } from 'react-icons/fi';
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
        <button className="lp-button lp-button-secondary" onClick={() => setShowLogin(!showLogin)}>
          <FiLogIn /> Login
        </button>
      </header>

      <main className="lp-main-content">
        <section className="lp-hero-section">
          <h1 className="gradient-text">Cipher AI Vault</h1>
          <h2>Secure AI on the Internet Computer</h2>
          <p>
            Experience unparalleled security and performance with Cipher AI Vault. 
            Harness the power of sandboxed AI, in-memory VectorDB, and stable memory storage.
          </p>
          <div className="lp-cta-buttons">
            <button className="lp-button lp-button-secondary" onClick={() => setShowLogin(!showLogin)}>
              <FiArrowRight /> Get Started
            </button>
            <button
              className="lp-button lp-button-secondary"
              onClick={() => window.open('https://github.com/supaIC/Cipher-AI-Vault', '_blank')}
            >
              <FiGithub /> Learn More
            </button>
          </div>
        </section>

        <section className="lp-features-section" id="features">
          <div className="lp-feature-cards">
            {[
              { icon: '🛡️', title: 'Secure Sandboxed AI', description: 'Run AI models in a secure environment, isolated from potential threats.' },
              { icon: '⚡', title: 'In-memory VectorDB', description: 'Lightning-fast data retrieval and processing for AI applications.' },
              { icon: '💾', title: 'Stable Memory', description: 'Reliable, persistent storage for your critical AI data and models.' }
            ].map((feature, index) => (
              <div className="lp-card" key={index} style={{ '--animation-order': index } as React.CSSProperties}>
                <div className="lp-card-icon">{feature.icon}</div>
                <h4>{feature.title}</h4>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
          <a href="https://internetcomputer.org" target="_blank" rel="noopener noreferrer" className="lp-ic-logo-link">
            <img src={internetComputerLogo} alt="Internet Computer" className="lp-ic-logo" />
          </a>
        </section>

        <section className="lp-about-section" id="about">
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-footer-content">
        <img src={cipherProxyTag} alt="Cipher Proxy" className="lp-about-image" />
          <div className="lp-social-links">
            <a href="https://twitter.com/cipherproxyllc" target="_blank" rel="noopener noreferrer">
              <FiTwitter className="lp-social-icon" /> Twitter
            </a>
            <a href="https://github.com/cipherproxy" target="_blank" rel="noopener noreferrer">
              <FiGithub className="lp-social-icon" /> GitHub
            </a>
            <a href="https://www.cipherproxy.com" target="_blank" rel="noopener noreferrer">
              <FiGlobe className="lp-social-icon" /> Website
            </a>
          </div>
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