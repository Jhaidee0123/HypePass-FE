import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Styles from './home-styles.scss';
import { PulseButton, SeoHelmet } from '@/presentation/components';
import { PublicEvents } from '@/domain/usecases';
import { PublicEventListItem } from '@/domain/models';

type Props = {
  publicEvents: PublicEvents;
};

const formatCOP = (cents: number, currency = 'COP') =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);

/** Fires `onEnter` once the target first intersects the viewport. */
const useInViewOnce = (): [React.RefObject<HTMLElement | null>, boolean] => {
  const ref = useRef<HTMLElement | null>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || seen) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [seen]);

  return [ref, seen];
};

const Home: React.FC<Props> = ({ publicEvents }) => {
  const { t } = useTranslation();
  const [hero, setHero] = useState<PublicEventListItem | null>(null);

  useEffect(() => {
    publicEvents
      .list({ sort: 'soonest', page: 1, pageSize: 1 })
      .then((res) => setHero(res.items[0] ?? null))
      .catch(() => setHero(null));
  }, [publicEvents]);

  return (
    <div className={Styles.homePage}>
      <SeoHelmet
        title={`HypePass — ${t('home.tagline')}`}
        description={t('home.heroSubtitle')}
        type="website"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'HypePass',
          url:
            typeof window !== 'undefined'
              ? window.location.origin
              : undefined,
          description: t('home.heroSubtitle'),
          sameAs: [],
        }}
      />

      <HeroSection hero={hero} />
      <MarqueeSection />
      <PullquoteSection />
      <BentoSection />
      <HowItWorksSection />
      <ForOrganizersBanner />
      <UpcomingFeatureSection />
    </div>
  );
};

/* ============================== ORGANIZERS BANNER ============================== */

const ForOrganizersBanner: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className={Styles.organizerBanner}>
      <div className={Styles.organizerBannerInner}>
        <div className={Styles.organizerBannerText}>
          <div className={Styles.organizerBannerEyebrow}>
            <span className="pulse-dot" />
            <span className="mono">{t('home.organizerBanner.eyebrow')}</span>
          </div>
          <h2 className={`${Styles.organizerBannerTitle} display`}>
            {t('home.organizerBanner.title')}
          </h2>
          <p className={Styles.organizerBannerBody}>
            {t('home.organizerBanner.body')}
          </p>
        </div>
        <Link to="/for-organizers" className={Styles.organizerBannerCta}>
          {t('home.organizerBanner.cta')} →
        </Link>
      </div>
    </section>
  );
};

/* ============================== HERO ============================== */

const HeroSection: React.FC<{ hero: PublicEventListItem | null }> = ({
  hero,
}) => {
  const { t } = useTranslation();
  return (
    <section className={`${Styles.hero} grain`}>
      {/* Animated aurora mesh + scanning beam overlay */}
      <div className={Styles.heroAurora} aria-hidden="true" />
      <div className={Styles.heroBeam} aria-hidden="true" />

      <div className={Styles.heroInner}>
        {hero ? (
          <>
            <div className={Styles.heroTagline}>
              <span className="pulse-dot" />
              <span className="mono">
                {hero.category?.name?.toUpperCase() ?? 'LIVE DROP'}
              </span>
            </div>
            <h1 className={`${Styles.heroTitle} display`}>{hero.title}</h1>
            <div className={Styles.heroMeta}>
              {hero.nextSessionStartsAt && (
                <span>
                  {new Date(hero.nextSessionStartsAt).toLocaleString(
                    undefined,
                    {
                      weekday: 'short',
                      month: 'short',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    },
                  )}
                </span>
              )}
              {hero.venue && (
                <>
                  <span className={Styles.heroSep}>/</span>
                  <span>
                    {hero.venue.name} · {hero.venue.city}
                  </span>
                </>
              )}
              {hero.fromPrice !== null && (
                <>
                  <span className={Styles.heroSep}>/</span>
                  <span>
                    {t('discover.from')}{' '}
                    {formatCOP(hero.fromPrice, hero.currency)}
                  </span>
                </>
              )}
            </div>
            <div className={Styles.ctaRow}>
              <Link to={`/events/${hero.slug}`}>
                <PulseButton variant="primary">
                  {t('discover.getTickets')}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M1 7h12M8 2l5 5-5 5" strokeLinecap="round" />
                  </svg>
                </PulseButton>
              </Link>
              <Link to="/events">
                <PulseButton variant="secondary">
                  {t('home.exploreAll')}
                </PulseButton>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className={Styles.heroTagline}>
              <span className="pulse-dot lime" />
              <span className="mono">{t('home.tagline')}</span>
            </div>
            <h1 className={`${Styles.heroTitle} display`}>
              {t('home.heroTitle')}
              <br />
              <span className={Styles.titleAccent}>
                {t('home.heroTitleAccent')}
              </span>
            </h1>
            <p className={Styles.heroSubtitle}>{t('home.heroSubtitle')}</p>
            <div className={Styles.ctaRow}>
              <Link to="/events">
                <PulseButton variant="primary">
                  {t('home.primaryCta')}
                </PulseButton>
              </Link>
              <Link to="/marketplace">
                <PulseButton variant="secondary">
                  {t('home.secondaryCta')}
                </PulseButton>
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Scroll-down nudger */}
      <div className={Styles.scrollHint} aria-hidden="true">
        <span className={Styles.scrollHintDot} />
      </div>
    </section>
  );
};

/* =========================== MARQUEE =========================== */

const MARQUEE_TAGS = [
  'INDIE',
  'ELECTRÓNICA',
  'REGGAETON',
  'STAND UP',
  'FESTIVAL',
  'ROCK',
  'TEATRO',
  'HIP HOP',
  'CUMBIA',
  'POP',
  'CLÁSICA',
  'JAZZ',
];

const MARQUEE_CITIES = [
  'BOGOTÁ',
  'MEDELLÍN',
  'CALI',
  'BARRANQUILLA',
  'CARTAGENA',
  'BUCARAMANGA',
  'PEREIRA',
  'MANIZALES',
];

const MarqueeSection: React.FC = () => (
  <section className={Styles.marquee} aria-hidden="true">
    <div className={Styles.marqueeTrack}>
      <MarqueeRow items={MARQUEE_TAGS} />
      <MarqueeRow items={MARQUEE_TAGS} />
    </div>
    <div className={`${Styles.marqueeTrack} ${Styles.marqueeReverse}`}>
      <MarqueeRow items={MARQUEE_CITIES} accent />
      <MarqueeRow items={MARQUEE_CITIES} accent />
    </div>
  </section>
);

const MarqueeRow: React.FC<{ items: string[]; accent?: boolean }> = ({
  items,
  accent,
}) => (
  <div className={Styles.marqueeRow}>
    {items.map((s, i) => (
      <React.Fragment key={`${s}-${i}`}>
        <span className={accent ? Styles.marqueeAccent : Styles.marqueeItem}>
          {s}
        </span>
        <span className={Styles.marqueeDot}>●</span>
      </React.Fragment>
    ))}
  </div>
);

/* =========================== PULLQUOTE =========================== */

const PULLQUOTE_TAGS = [
  'home.pullquote.tag1',
  'home.pullquote.tag2',
  'home.pullquote.tag3',
];

const PullquoteSection: React.FC = () => {
  const { t } = useTranslation();
  const [ref, inView] = useInViewOnce();
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className={`${Styles.pullquote} ${inView ? Styles.pullquoteIn : ''}`}
    >
      <div className={Styles.pullquoteInner}>
        <div className={Styles.pullquoteMark} aria-hidden="true">
          ❝
        </div>
        <blockquote className={Styles.pullquoteText}>
          <span className={Styles.pullquoteLine1}>
            {t('home.pullquote.line1')}
          </span>{' '}
          <span
            className={`${Styles.pullquoteLine2} ${Styles.titleAccent}`}
          >
            {t('home.pullquote.line2')}
          </span>
        </blockquote>
        <div className={Styles.pullquoteTags}>
          {PULLQUOTE_TAGS.map((k) => (
            <span key={k} className={Styles.pullquoteTag}>
              {t(k)}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ============================= BENTO ============================= */

const BentoSection: React.FC = () => {
  const { t } = useTranslation();
  const [ref, inView] = useInViewOnce();

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className={`${Styles.bento} ${inView ? Styles.bentoIn : ''}`}
    >
      <div className={Styles.sectionHead}>
        <div className={Styles.eyebrow}>
          <span className="pulse-bulb" aria-hidden="true" />
          {t('home.bento.eyebrow')}
        </div>
        <h2 className={Styles.sectionTitle}>
          {t('home.bento.titleA')}{' '}
          <span className={Styles.titleAccent}>
            {t('home.bento.titleB')}
          </span>
        </h2>
      </div>

      <div className={Styles.bentoGrid}>
        <TiltCard
          className={`${Styles.bentoCard} ${Styles.bentoBig}`}
          tone="lime"
        >
          <div className={Styles.bentoN}>01</div>
          <h3 className={Styles.bentoTitle}>{t('home.bento.qr.title')}</h3>
          <p className={Styles.bentoBody}>{t('home.bento.qr.body')}</p>
          <QrVisual />
        </TiltCard>

        <TiltCard className={Styles.bentoCard}>
          <div className={Styles.bentoN}>02</div>
          <h3 className={Styles.bentoTitle}>
            {t('home.bento.resale.title')}
          </h3>
          <p className={Styles.bentoBody}>{t('home.bento.resale.body')}</p>
        </TiltCard>

        <TiltCard className={Styles.bentoCard} tone="magenta">
          <div className={Styles.bentoN}>03</div>
          <h3 className={Styles.bentoTitle}>
            {t('home.bento.escrow.title')}
          </h3>
          <p className={Styles.bentoBody}>{t('home.bento.escrow.body')}</p>
        </TiltCard>

        <TiltCard className={Styles.bentoCard}>
          <div className={Styles.bentoN}>04</div>
          <h3 className={Styles.bentoTitle}>
            {t('home.bento.transfer.title')}
          </h3>
          <p className={Styles.bentoBody}>
            {t('home.bento.transfer.body')}
          </p>
        </TiltCard>

        <TiltCard
          className={`${Styles.bentoCard} ${Styles.bentoWide}`}
          tone="lime"
        >
          <div className={Styles.bentoN}>05</div>
          <h3 className={Styles.bentoTitle}>
            {t('home.bento.cap.title')}
          </h3>
          <p className={Styles.bentoBody}>{t('home.bento.cap.body')}</p>
          <CapVisual />
        </TiltCard>
      </div>
    </section>
  );
};

/** Tilt on mouse move — subtle 3D feel without dependencies. */
const TiltCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  tone?: 'default' | 'lime' | 'magenta';
}> = ({ children, className = '', tone = 'default' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    node.style.setProperty('--rx', `${(-y * 6).toFixed(2)}deg`);
    node.style.setProperty('--ry', `${(x * 6).toFixed(2)}deg`);
    node.style.setProperty('--mx', `${(x * 100 + 50).toFixed(2)}%`);
    node.style.setProperty('--my', `${(y * 100 + 50).toFixed(2)}%`);
  };
  const onLeave = () => {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty('--rx', '0deg');
    node.style.setProperty('--ry', '0deg');
  };
  return (
    <div
      ref={ref}
      className={`${className} ${tone !== 'default' ? Styles[`tone_${tone}`] : ''}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  );
};

const QrVisual: React.FC = () => (
  <svg
    viewBox="0 0 100 100"
    className={Styles.qrVisual}
    aria-hidden="true"
  >
    {Array.from({ length: 7 }).map((_, r) =>
      Array.from({ length: 7 }).map((__, c) => {
        // Pseudo-random fixed pattern for deterministic look.
        const on = (r * 13 + c * 7 + (r ^ c)) % 3 !== 0;
        const big = (r === 0 && c === 0) || (r === 0 && c === 6) || (r === 6 && c === 0);
        return (
          <rect
            key={`${r}-${c}`}
            x={c * 14 + 1}
            y={r * 14 + 1}
            width={big ? 14 : 12}
            height={big ? 14 : 12}
            fill={on ? '#d7ff3a' : 'transparent'}
            opacity={on ? 1 : 0.15}
          />
        );
      }),
    )}
    <rect
      className={Styles.qrScan}
      x="0"
      y="0"
      width="100"
      height="4"
      fill="#ff2e93"
    />
  </svg>
);

const CapVisual: React.FC = () => (
  <div className={Styles.capVisual} aria-hidden="true">
    <div className={Styles.capBar}>
      <span>$80K</span>
      <span>$100K</span>
      <span>$120K</span>
      <span>$130K</span>
      <span className={Styles.capCap}>$150K · CAP</span>
    </div>
    <div className={Styles.capTrack}>
      <div className={Styles.capFill} />
      <div className={Styles.capCapMark} />
    </div>
  </div>
);

/* =========================== HOW IT WORKS =========================== */

const STEPS = [
  { key: 'pick', icon: '🎟' },
  { key: 'pay', icon: '💳' },
  { key: 'wallet', icon: '📱' },
  { key: 'scan', icon: '✓' },
];

const HowItWorksSection: React.FC = () => {
  const { t } = useTranslation();
  const [ref, inView] = useInViewOnce();

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className={`${Styles.how} ${inView ? Styles.howIn : ''}`}
    >
      <div className={Styles.sectionHead}>
        <div className={Styles.eyebrow}>◆ {t('home.how.eyebrow')}</div>
        <h2 className={Styles.sectionTitle}>
          {t('home.how.titleA')}{' '}
          <span className={Styles.titleAccent}>
            {t('home.how.titleB')}
          </span>
        </h2>
      </div>
      <div className={Styles.howTrack}>
        <div className={Styles.howLine}>
          <div className={Styles.howLineFill} />
        </div>
        {STEPS.map((s, i) => (
          <div
            key={s.key}
            className={Styles.howStep}
            style={{ '--d': `${i * 140}ms` } as React.CSSProperties}
          >
            <div className={Styles.howStepBubble}>
              <span className={Styles.howIcon}>{s.icon}</span>
              <span className={Styles.howN}>0{i + 1}</span>
            </div>
            <div className={Styles.howStepBody}>
              <div className={Styles.howStepTitle}>
                {t(`home.how.steps.${s.key}.title`)}
              </div>
              <div className={Styles.howStepText}>
                {t(`home.how.steps.${s.key}.body`)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ====================== UPCOMING FEATURE ====================== */

/**
 * Final landing block — fuses the editorial feature image with the
 * "Próximamente / Lo que viene al horizonte" copy and a single CTA.
 * Replaces the previous standalone FeatureImage and ExploreCta sections,
 * which both pointed at /events and felt redundant stacked next to each
 * other.
 */
const FEATURE_IMAGE_URL =
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1800&q=85';

const UpcomingFeatureSection: React.FC = () => {
  const { t } = useTranslation();
  const [ref, inView] = useInViewOnce();
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className={`${Styles.feature} ${inView ? Styles.featureIn : ''}`}
    >
      <div className={Styles.featureFrame}>
        <img
          src={FEATURE_IMAGE_URL}
          alt=""
          className={Styles.featureBg}
          loading="lazy"
        />
        <div className={Styles.featureGradient} />
        <div className={Styles.featureNoise} />

        <div className={Styles.featureContent}>
          <div className={Styles.featureEyebrow}>
            <span className="pulse-bulb" aria-hidden="true" />
            <span className="mono">{t('discover.upcoming')}</span>
          </div>
          <h2 className={Styles.featureTitle}>
            {t('discover.horizonA')}{' '}
            <span className={Styles.titleAccent}>
              {t('discover.horizonB')}
            </span>
            .
          </h2>
          <p className={Styles.featureBody}>{t('home.exploreBody')}</p>
          <div className={Styles.featureCta}>
            <Link to="/events">
              <PulseButton variant="primary">
                {t('home.exploreAll')}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M1 7h12M8 2l5 5-5 5" strokeLinecap="round" />
                </svg>
              </PulseButton>
            </Link>
          </div>
        </div>

        {/* Credit / tag in the bottom-right, SoundCloud-style. */}
        <div className={Styles.featureCredit}>
          <div className={Styles.featureCreditName}>
            {t('home.feature.creditName')}
          </div>
          <div className={Styles.featureCreditSub}>
            {t('home.feature.creditSub')}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;
