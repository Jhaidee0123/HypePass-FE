import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Styles from './footer-styles.scss';
import Logo from '../logo/logo';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Cosmetic-only newsletter: stores nothing, just confirms visually so the
  // footer feels alive. Wire to a real endpoint when we have one.
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className={Styles.footer}>
      {/* Editorial CTA + newsletter */}
      <section className={Styles.cta}>
        <div className={Styles.ctaInner}>
          <div className={Styles.ctaLeft}>
            <div className={Styles.ctaEyebrow}>
              <span className="pulse-dot" />
              <span className="mono">{t('footer.cta.eyebrow')}</span>
            </div>
            <h2 className={Styles.ctaTitle}>
              {t('footer.cta.titleA')}{' '}
              <span className={Styles.ctaTitleAccent}>
                {t('footer.cta.titleB')}
              </span>
            </h2>
            <p className={Styles.ctaBody}>{t('footer.cta.body')}</p>
          </div>
          <form
            className={Styles.newsletter}
            onSubmit={handleSubscribe}
            aria-label={t('footer.newsletter.aria')}
          >
            {subscribed ? (
              <div className={Styles.newsletterDone}>
                ✓ {t('footer.newsletter.done')}
              </div>
            ) : (
              <>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer.newsletter.placeholder')}
                  className={Styles.newsletterInput}
                  required
                />
                <button
                  type="submit"
                  className={Styles.newsletterBtn}
                  aria-label={t('footer.newsletter.cta')}
                >
                  {t('footer.newsletter.cta')}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M1 7h12M8 2l5 5-5 5" strokeLinecap="round" />
                  </svg>
                </button>
              </>
            )}
          </form>
        </div>
      </section>

      {/* Main grid: brand + 4 columns */}
      <section className={Styles.main}>
        <div className={Styles.mainInner}>
          <div className={Styles.brand}>
            <Logo variant="full" size={120} />
          </div>

          <nav className={Styles.cols} aria-label={t('footer.aria.nav')}>
            <div className={Styles.col}>
              <div className={Styles.colTitle}>
                {t('home.footer.listen')}
              </div>
              <Link to="/events" className={Styles.colItem}>
                {t('home.footer.allEvents')}
              </Link>
              <Link
                to="/events?category=musica"
                className={Styles.colItem}
              >
                {t('home.footer.concerts')}
              </Link>
              <Link
                to="/events?category=festival"
                className={Styles.colItem}
              >
                {t('home.footer.festivals')}
              </Link>
            </div>

            <div className={Styles.col}>
              <div className={Styles.colTitle}>
                {t('home.footer.trade')}
              </div>
              <Link to="/marketplace" className={Styles.colItem}>
                {t('home.footer.market')}
              </Link>
              <Link to="/wallet" className={Styles.colItem}>
                {t('home.footer.sellTickets')}
              </Link>
              <Link to="/wallet" className={Styles.colItem}>
                {t('home.footer.transfer')}
              </Link>
            </div>

            <div className={Styles.col}>
              <div className={Styles.colTitle}>
                {t('home.footer.support')}
              </div>
              <Link to="/faq" className={Styles.colItem}>
                {t('home.footer.faq')}
              </Link>
              <Link to="/legal/terms" className={Styles.colItem}>
                {t('home.footer.terms')}
              </Link>
              <Link to="/legal/privacy" className={Styles.colItem}>
                {t('home.footer.privacy')}
              </Link>
            </div>

            <div className={Styles.col}>
              <div className={Styles.colTitle}>
                {t('footer.social.title')}
              </div>
              <div className={Styles.socialRow}>
                <SocialLink
                  href="https://instagram.com/"
                  label="Instagram"
                  icon={<IconInstagram />}
                />
                <SocialLink
                  href="https://x.com/"
                  label="X / Twitter"
                  icon={<IconX />}
                />
                <SocialLink
                  href="https://www.youtube.com/"
                  label="YouTube"
                  icon={<IconYouTube />}
                />
                <SocialLink
                  href="https://www.tiktok.com/"
                  label="TikTok"
                  icon={<IconTikTok />}
                />
              </div>
              <a
                href="mailto:hola@hypepass.co"
                className={Styles.colItem}
              >
                hola@hypepass.co
              </a>
            </div>
          </nav>
        </div>
      </section>

      {/* Bottom strip */}
      <section className={Styles.bottom}>
        <div className={Styles.bottomInner}>
          <div className={Styles.bottomLeft}>
            © {year} HYPEPASS · {t('footer.bottom.region')}
          </div>
          <div className={Styles.bottomRight}>
            {t('footer.bottom.tagline')}
          </div>
        </div>
      </section>
    </footer>
  );
};

/* =========================== sub-components =========================== */

const SocialLink: React.FC<{
  href: string;
  label: string;
  icon: React.ReactNode;
}> = ({ href, label, icon }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className={Styles.socialLink}
  >
    {icon}
  </a>
);

const IconInstagram: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.7" fill="currentColor" />
  </svg>
);

const IconX: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2H21l-6.522 7.451L22 22h-6.844l-4.74-6.21L4.8 22H2.043l6.97-7.964L2 2h7.014l4.286 5.69L18.244 2zm-1.196 18h1.832L7.06 4H5.103l11.945 16z" />
  </svg>
);

const IconYouTube: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.582 7.186a2.506 2.506 0 0 0-1.768-1.768C18.265 5 12 5 12 5s-6.265 0-7.814.418A2.506 2.506 0 0 0 2.418 7.186 26.18 26.18 0 0 0 2 12a26.18 26.18 0 0 0 .418 4.814 2.506 2.506 0 0 0 1.768 1.768C5.735 19 12 19 12 19s6.265 0 7.814-.418a2.506 2.506 0 0 0 1.768-1.768A26.18 26.18 0 0 0 22 12a26.18 26.18 0 0 0-.418-4.814zM10 15.464V8.536L15.928 12 10 15.464z" />
  </svg>
);

const IconTikTok: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 3.21 16a6.32 6.32 0 0 0 9.94 5.21 6.36 6.36 0 0 0 2.81-5.27V8.66a8.16 8.16 0 0 0 4.77 1.52V6.69h-1.14z" />
  </svg>
);

export default Footer;
