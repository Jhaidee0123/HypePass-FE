import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import Styles from './for-organizers-styles.scss';
import { PulseButton, SeoHelmet } from '@/presentation/components';
import { currentAccountState } from '@/presentation/components/atoms/atoms';

/** Fires `onEnter` once the target first intersects the viewport. */
const useInViewOnce = (): [
  React.RefObject<HTMLDivElement | null>,
  boolean,
] => {
  const ref = useRef<HTMLDivElement | null>(null);
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
      { threshold: 0.15 },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [seen]);

  return [ref, seen];
};

const ForOrganizers: React.FC = () => {
  const { t } = useTranslation();
  const { getCurrentAccount } = useRecoilValue(currentAccountState);
  const isAuth = !!getCurrentAccount()?.session;
  const ctaTarget = isAuth ? '/organizer' : '/signup';

  // Always land at the top (hero) when entering this page, regardless of
  // where the user came from — react-router preserves scroll by default.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <div className={Styles.page}>
      <SeoHelmet
        title={t('forOrganizers.seo.title')}
        description={t('forOrganizers.seo.description')}
        type="website"
      />
      <HeroSection />
      <MarqueeSection />
      <StepsSection />
      <FeaturesSection />
      <WhySection />
      <FinalCtaSection ctaTarget={ctaTarget} />
    </div>
  );
};

/* ============================== HERO ============================== */

const HeroSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className={`${Styles.hero} grain`}>
      <div className={Styles.heroAurora} aria-hidden="true" />
      <div className={Styles.heroBeam} aria-hidden="true" />

      <div className={Styles.heroInner}>
        <div className={Styles.heroEyebrow}>
          <span className="pulse-dot" />
          <span className="mono">{t('forOrganizers.hero.eyebrow')}</span>
        </div>
        <h1 className={`${Styles.heroTitle} display`}>
          {t('forOrganizers.hero.titleA')}{' '}
          <span className={Styles.heroTitleAccent}>
            {t('forOrganizers.hero.titleB')}
          </span>
        </h1>
        <p className={Styles.heroBody}>{t('forOrganizers.hero.body')}</p>
        <div className={Styles.heroProof}>
          <span className="mono">{t('forOrganizers.hero.proofLine')}</span>
        </div>
      </div>
    </section>
  );
};

/* ============================== MARQUEE ============================== */

const MarqueeSection: React.FC = () => {
  const { t } = useTranslation();
  const items = [
    t('forOrganizers.marquee.multiSession'),
    t('forOrganizers.marquee.salePhases'),
    t('forOrganizers.marquee.promoterCodes'),
    t('forOrganizers.marquee.courtesies'),
    t('forOrganizers.marquee.rotatingQr'),
    t('forOrganizers.marquee.staffScanner'),
    t('forOrganizers.marquee.controlledResale'),
    t('forOrganizers.marquee.transfers'),
    t('forOrganizers.marquee.attendeeList'),
    t('forOrganizers.marquee.mapsIntegrated'),
  ];
  // Duplicated track so the loop is seamless.
  const track = [...items, ...items];

  return (
    <section className={Styles.marquee} aria-hidden="true">
      <div className={Styles.marqueeTrack}>
        {track.map((label, i) => (
          <span key={i} className={Styles.marqueeItem}>
            <span className={Styles.marqueeDot} />
            <span className="mono">{label}</span>
          </span>
        ))}
      </div>
    </section>
  );
};

/* ============================== STEPS ============================== */

const StepsSection: React.FC = () => {
  const { t } = useTranslation();
  const [ref, seen] = useInViewOnce();

  const steps = [
    {
      n: '01',
      title: t('forOrganizers.steps.s1.title'),
      body: t('forOrganizers.steps.s1.body'),
    },
    {
      n: '02',
      title: t('forOrganizers.steps.s2.title'),
      body: t('forOrganizers.steps.s2.body'),
    },
    {
      n: '03',
      title: t('forOrganizers.steps.s3.title'),
      body: t('forOrganizers.steps.s3.body'),
    },
    {
      n: '04',
      title: t('forOrganizers.steps.s4.title'),
      body: t('forOrganizers.steps.s4.body'),
    },
  ];

  return (
    <section
      ref={ref}
      className={`${Styles.steps} ${seen ? Styles.revealed : ''}`}
    >
      <div className={Styles.stepsInner}>
        <div className="hr-label">{t('forOrganizers.steps.eyebrow')}</div>
        <h2 className={`${Styles.h2} display`}>
          {t('forOrganizers.steps.title')}
        </h2>
        <div className={Styles.stepsGrid}>
          {steps.map((s, i) => (
            <div
              key={s.n}
              className={Styles.stepCard}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className={Styles.stepNumber}>{s.n}</div>
              <h3 className={Styles.stepTitle}>{s.title}</h3>
              <p className={Styles.stepBody}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ============================== FEATURES ============================== */

const FeaturesSection: React.FC = () => {
  const { t } = useTranslation();
  const [ref, seen] = useInViewOnce();

  const features = [
    {
      icon: '🎟️',
      title: t('forOrganizers.features.salePhases.title'),
      body: t('forOrganizers.features.salePhases.body'),
      large: true,
    },
    {
      icon: '🤝',
      title: t('forOrganizers.features.promoters.title'),
      body: t('forOrganizers.features.promoters.body'),
    },
    {
      icon: '🎁',
      title: t('forOrganizers.features.courtesies.title'),
      body: t('forOrganizers.features.courtesies.body'),
    },
    {
      icon: '🛡️',
      title: t('forOrganizers.features.rotatingQr.title'),
      body: t('forOrganizers.features.rotatingQr.body'),
    },
    {
      icon: '📱',
      title: t('forOrganizers.features.staffScanner.title'),
      body: t('forOrganizers.features.staffScanner.body'),
    },
    {
      icon: '🔁',
      title: t('forOrganizers.features.resale.title'),
      body: t('forOrganizers.features.resale.body'),
      large: true,
    },
    {
      icon: '📍',
      title: t('forOrganizers.features.maps.title'),
      body: t('forOrganizers.features.maps.body'),
    },
    {
      icon: '👥',
      title: t('forOrganizers.features.attendees.title'),
      body: t('forOrganizers.features.attendees.body'),
    },
    {
      icon: '📊',
      title: t('forOrganizers.features.dashboard.title'),
      body: t('forOrganizers.features.dashboard.body'),
    },
  ];

  return (
    <section
      ref={ref}
      className={`${Styles.features} ${seen ? Styles.revealed : ''}`}
    >
      <div className={Styles.featuresInner}>
        <div className="hr-label">{t('forOrganizers.features.eyebrow')}</div>
        <h2 className={`${Styles.h2} display`}>
          {t('forOrganizers.features.title')}
        </h2>
        <p className={Styles.sectionLead}>
          {t('forOrganizers.features.lead')}
        </p>
        <div className={Styles.featuresGrid}>
          {features.map((f, i) => (
            <div
              key={i}
              className={`${Styles.featureCard} ${f.large ? Styles.featureLarge : ''}`}
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div className={Styles.featureIcon}>{f.icon}</div>
              <div className={Styles.featureTitle}>{f.title}</div>
              <div className={Styles.featureBody}>{f.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ============================== WHY ============================== */

const WhySection: React.FC = () => {
  const { t } = useTranslation();
  const [ref, seen] = useInViewOnce();

  const rows = [
    {
      title: t('forOrganizers.why.r1.title'),
      body: t('forOrganizers.why.r1.body'),
    },
    {
      title: t('forOrganizers.why.r2.title'),
      body: t('forOrganizers.why.r2.body'),
    },
    {
      title: t('forOrganizers.why.r3.title'),
      body: t('forOrganizers.why.r3.body'),
    },
    {
      title: t('forOrganizers.why.r4.title'),
      body: t('forOrganizers.why.r4.body'),
    },
  ];

  return (
    <section
      ref={ref}
      className={`${Styles.why} ${seen ? Styles.revealed : ''}`}
    >
      <div className={Styles.whyInner}>
        <div className="hr-label">{t('forOrganizers.why.eyebrow')}</div>
        <h2 className={`${Styles.h2} display`}>
          {t('forOrganizers.why.title')}
        </h2>
        <div className={Styles.whyList}>
          {rows.map((r, i) => (
            <div key={i} className={Styles.whyRow}>
              <div className={Styles.whyMark}>✓</div>
              <div>
                <div className={Styles.whyRowTitle}>{r.title}</div>
                <div className={Styles.whyRowBody}>{r.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ============================== FINAL CTA ============================== */

const FinalCtaSection: React.FC<{ ctaTarget: string }> = ({ ctaTarget }) => {
  const { t } = useTranslation();
  const [ref, seen] = useInViewOnce();

  return (
    <section
      ref={ref}
      className={`${Styles.finalCta} ${seen ? Styles.revealed : ''}`}
    >
      <div className={Styles.finalAurora} aria-hidden="true" />
      <div className={Styles.finalInner}>
        <div className={Styles.finalEyebrow}>
          <span className="pulse-dot" />
          <span className="mono">{t('forOrganizers.finalCta.eyebrow')}</span>
        </div>
        <h2 className={`${Styles.finalTitle} display`}>
          {t('forOrganizers.finalCta.title')}
        </h2>
        <p className={Styles.finalBody}>{t('forOrganizers.finalCta.body')}</p>
        <div className={Styles.finalCtas}>
          <Link to={ctaTarget}>
            <PulseButton variant="primary">
              {t('forOrganizers.finalCta.ctaPrimary')} →
            </PulseButton>
          </Link>
          <a href="mailto:hola@hypepass.co">
            <PulseButton variant="ghost">
              {t('forOrganizers.finalCta.ctaSecondary')}
            </PulseButton>
          </a>
        </div>
      </div>
    </section>
  );
};

export default ForOrganizers;
