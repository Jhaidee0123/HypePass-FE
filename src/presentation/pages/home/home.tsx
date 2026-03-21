import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Styles from './home-styles.scss';

const Home: React.FC = () => {
  return (
    <div className={Styles.homePage}>
      <Helmet>
        <title>Home | App</title>
        <meta name="description" content="Welcome to the application." />
      </Helmet>

      <header className={Styles.header}>
        <div className={Styles.headerInner}>
          <span className={Styles.logo}>App</span>
          <nav className={Styles.nav}>
            <Link to="/login" className={Styles.navLink}>Login</Link>
            <Link to="/signup" className={Styles.navLinkPrimary}>Sign Up</Link>
          </nav>
        </div>
      </header>

      <main className={Styles.hero}>
        <h1 className={Styles.heroTitle}>Welcome to Your App</h1>
        <p className={Styles.heroText}>
          A clean architecture React template with authentication, routing, and a design system ready to customize.
        </p>
        <div className={Styles.heroActions}>
          <Link to="/signup" className={Styles.primaryBtn}>Get Started</Link>
          <Link to="/login" className={Styles.secondaryBtn}>Sign In</Link>
        </div>
      </main>

      <footer className={Styles.footer}>
        <p>Built with React + TypeScript + Clean Architecture</p>
      </footer>
    </div>
  );
};

export default Home;
