import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Styles from './event-detail-styles.scss';
import { PulseButton, SeoHelmet } from '@/presentation/components';
import { PublicEvents } from '@/domain/usecases';
import { PublicEventDetail } from '@/domain/models';
import {
  readReferralForEvent,
  useReferralCapture,
} from '@/presentation/hooks';

type Props = {
  publicEvents: PublicEvents;
};

const formatCOP = (cents: number, currency = 'COP') =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);

const EventDetail: React.FC<Props> = ({ publicEvents }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  useReferralCapture(slug);
  const [data, setData] = useState<PublicEventDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null,
  );
  const [qty, setQty] = useState(2);

  useEffect(() => {
    if (!slug) return;
    setError(null);
    publicEvents
      .getBySlug(slug)
      .then((d) => {
        setData(d);
        if (d.sessions.length > 0) {
          setSelectedSessionId(d.sessions[0].id);
          if (d.sessions[0].sections.length > 0) {
            setSelectedSectionId(d.sessions[0].sections[0].id);
          }
        }
      })
      .catch((err) =>
        setError(
          err?.response?.status === 404
            ? t('eventDetail.notFound')
            : err?.response?.data?.message ??
              err?.message ??
              t('errors.unexpected'),
        ),
      );
  }, [slug, publicEvents, t]);

  const selectedSession = useMemo(() => {
    return data?.sessions.find((s) => s.id === selectedSessionId) ?? null;
  }, [data, selectedSessionId]);

  const selectedSection = useMemo(() => {
    return (
      selectedSession?.sections.find((s) => s.id === selectedSectionId) ??
      null
    );
  }, [selectedSession, selectedSectionId]);

  const activePhase = selectedSection?.currentPhase ?? null;
  const fallbackPhase = selectedSection?.phases.find((p) => p.isActive) ?? null;
  const displayPhase = activePhase ?? fallbackPhase;

  const unitPrice = displayPhase?.price ?? 0;
  const subtotal = unitPrice * qty;
  const serviceFee = displayPhase?.serviceFee ?? 0;
  const total = subtotal + serviceFee * qty;

  if (error) {
    return (
      <div className={Styles.page}>
        <div className={Styles.error}>{error}</div>
        <Link to="/" className={Styles.backLink}>
          ← {t('common.back')}
        </Link>
      </div>
    );
  }

  if (!data) {
    return <div className={Styles.page}>{t('common.loading')}</div>;
  }

  const { event, category, venue, sessions } = data;

  const handleCheckout = () => {
    if (!selectedSessionId || !selectedSectionId || !displayPhase) return;
    // Checkout flow is implemented in Iter 6. For now, we hand off the
    // parameters via URL so the checkout page can pick them up.
    const ref = readReferralForEvent(slug ?? '');
    const refQs = ref ? `&ref=${encodeURIComponent(ref)}` : '';
    navigate(
      `/checkout?event=${event.id}&session=${selectedSessionId}&section=${selectedSectionId}&phase=${displayPhase.id}&qty=${qty}${refQs}`,
    );
  };

  return (
    <div className={Styles.page}>
      <SeoHelmet
        title={`HypePass — ${event.title}`}
        description={event.shortDescription ?? undefined}
        image={event.coverImageUrl ?? event.bannerImageUrl ?? undefined}
        type="event"
        jsonLd={buildEventJsonLd(data)}
      />

      <nav className={Styles.breadcrumb}>
        <Link to="/" className={Styles.breadcrumbLink}>
          ← {t('common.back')}
        </Link>
        <span className={Styles.breadcrumbSep}>/</span>
        <span className="mono" style={{ fontSize: 10, letterSpacing: '0.1em' }}>
          {t('nav.discover').toUpperCase()}
        </span>
        {category && (
          <>
            <span className={Styles.breadcrumbSep}>/</span>
            <span
              className="mono"
              style={{ fontSize: 10, letterSpacing: '0.1em' }}
            >
              {category.name.toUpperCase()}
            </span>
          </>
        )}
        <span className={Styles.breadcrumbSep}>/</span>
        <span className={Styles.breadcrumbActive}>{event.title}</span>
      </nav>

      <div className={Styles.layout}>
        {/* LEFT */}
        <div className={Styles.left}>
          <div className={Styles.heroImageWrap}>
            {event.bannerImageUrl ? (
              <img
                src={event.bannerImageUrl}
                alt={event.title}
                className={Styles.heroImage}
              />
            ) : event.coverImageUrl ? (
              <img
                src={event.coverImageUrl}
                alt={event.title}
                className={Styles.heroImage}
              />
            ) : (
              <div className={Styles.heroImageEmpty}>NO IMAGE</div>
            )}
          </div>

          <div className={Styles.titleRow}>
            {selectedSession && (
              <div className={Styles.dateCard}>
                <div className={Styles.dateDow}>
                  {new Date(selectedSession.startsAt).toLocaleDateString(
                    undefined,
                    { weekday: 'short' },
                  )}
                </div>
                <div className={Styles.dateDay}>
                  {new Date(selectedSession.startsAt).toLocaleDateString(
                    undefined,
                    { day: '2-digit' },
                  )}
                </div>
                <div className={Styles.dateMonth}>
                  {new Date(selectedSession.startsAt).toLocaleDateString(
                    undefined,
                    { month: 'short' },
                  )}
                  {' · '}
                  {new Date(selectedSession.startsAt).toLocaleTimeString(
                    undefined,
                    { hour: '2-digit', minute: '2-digit' },
                  )}
                </div>
              </div>
            )}
            <div className={Styles.titleBlock}>
              {category && (
                <div className={Styles.categoryLabel}>
                  {category.name.toUpperCase()}
                </div>
              )}
              <h1 className={Styles.title}>{event.title}</h1>
              {(event.locationName || event.locationAddress || venue) && (
                <div className={Styles.venueLine}>
                  {event.locationName ?? venue?.name}
                  {event.locationAddress
                    ? ` · ${event.locationAddress.split(',')[0]}`
                    : venue
                      ? ` · ${venue.city}`
                      : ''}
                </div>
              )}
            </div>
          </div>

          {event.shortDescription && (
            <p className={Styles.shortDescription}>{event.shortDescription}</p>
          )}

          {event.description && (
            <>
              <div className="hr-label" style={{ marginBottom: 16 }}>
                {t('eventDetail.about')}
              </div>
              <p className={Styles.description}>{event.description}</p>
            </>
          )}

          {(event.locationName ||
            event.locationAddress ||
            event.locationLatitude !== null ||
            venue) && (
            <>
              <div
                className="hr-label"
                style={{ marginBottom: 16, marginTop: 32 }}
              >
                {t('eventDetail.venue')}
              </div>
              <div className={Styles.venueCard}>
                <div className={Styles.venueName}>
                  {event.locationName ?? venue?.name ?? ''}
                </div>
                <div className={Styles.venueMeta}>
                  {event.locationAddress
                    ? event.locationAddress
                    : venue
                      ? `${venue.addressLine}${venue.region ? `, ${venue.region}` : ''} · ${venue.city}, ${venue.country}`
                      : ''}
                </div>
                {event.locationLatitude !== null &&
                  event.locationLatitude !== undefined &&
                  event.locationLongitude !== null &&
                  event.locationLongitude !== undefined && (
                    <div
                      style={{
                        marginTop: 14,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 8,
                      }}
                    >
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${event.locationLatitude},${event.locationLongitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={Styles.mapsCta}
                      >
                        {t('eventDetail.openInGoogleMaps')} ↗
                      </a>
                      <a
                        href={`https://waze.com/ul?ll=${event.locationLatitude},${event.locationLongitude}&navigate=yes`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={Styles.mapsCta}
                      >
                        {t('eventDetail.openInWaze')} ↗
                      </a>
                      <a
                        href={`https://maps.apple.com/?ll=${event.locationLatitude},${event.locationLongitude}&q=${encodeURIComponent(
                          event.locationName ?? event.title,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={Styles.mapsCtaSecondary}
                      >
                        {t('eventDetail.openInAppleMaps')} ↗
                      </a>
                    </div>
                  )}
                {!event.locationLatitude && venue?.capacity && (
                  <div className={Styles.venueCap}>
                    · {venue.capacity.toLocaleString('es-CO')}{' '}
                    {t('eventDetail.capacity')}
                  </div>
                )}
              </div>
            </>
          )}

          <div className={Styles.policyRow}>
            <Badge
              label={
                event.resaleEnabled
                  ? t('eventDetail.policy.resaleOn')
                  : t('eventDetail.policy.resaleOff')
              }
              color={event.resaleEnabled ? 'lime' : 'muted'}
            />
            <Badge
              label={
                event.transferEnabled
                  ? t('eventDetail.policy.transferOn')
                  : t('eventDetail.policy.transferOff')
              }
              color={event.transferEnabled ? 'lime' : 'muted'}
            />
            <Badge
              label={t('eventDetail.policy.qr', {
                hours: event.defaultQrVisibleHoursBefore ?? 24,
              })}
              color="magenta"
            />
          </div>
        </div>

        {/* RIGHT — ticket picker (or past-event card when the event is over) */}
        <aside className={Styles.aside}>
          {data.isPast ? (
            <div className={Styles.asideInner}>
              <div className={Styles.pastEventCard}>
                <div className={Styles.pastEventEyebrow}>
                  ◆ {t('eventDetail.past.eyebrow')}
                </div>
                <div className={Styles.pastEventTitle}>
                  {t('eventDetail.past.title')}
                </div>
                <div className={Styles.pastEventBody}>
                  {t('eventDetail.past.body')}
                </div>
                <Link to="/events" className={Styles.pastEventCta}>
                  {t('eventDetail.past.exploreCta')} →
                </Link>
              </div>
            </div>
          ) : (
          <div className={Styles.asideInner}>
            <div className={Styles.asideEyebrow}>
              ◆ {t('eventDetail.selectSession')}
            </div>
            <div className={Styles.sessionList}>
              {sessions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`${Styles.sessionBtn} ${selectedSessionId === s.id ? Styles.sessionBtnActive : ''}`}
                  onClick={() => {
                    setSelectedSessionId(s.id);
                    setSelectedSectionId(s.sections[0]?.id ?? null);
                  }}
                >
                  <div className={Styles.sessionBtnDate}>
                    {new Date(s.startsAt).toLocaleString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: '2-digit',
                    })}
                  </div>
                  <div className={Styles.sessionBtnName}>
                    {s.name ?? t('organizer.events.sessions.untitled')}
                  </div>
                </button>
              ))}
            </div>

            {selectedSession && (
              <>
                <div className={Styles.asideEyebrow}>
                  ◆ {t('eventDetail.selectTier')}
                </div>
                <div className={Styles.sectionList}>
                  {selectedSession.sections.length === 0 && (
                    <div className={Styles.sectionEmpty}>
                      {t('eventDetail.noSections')}
                    </div>
                  )}
                  {selectedSession.sections.map((sec) => {
                    const active = sec.currentPhase;
                    const fallback = sec.phases.find((p) => p.isActive);
                    const visible = active ?? fallback;
                    const isSelected = selectedSectionId === sec.id;
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        className={`${Styles.sectionBtn} ${isSelected ? Styles.sectionBtnActive : ''}`}
                        onClick={() => setSelectedSectionId(sec.id)}
                        disabled={!visible}
                      >
                        <div className={Styles.sectionTopRow}>
                          <div className={Styles.sectionName}>{sec.name}</div>
                          <div className={Styles.sectionPrice}>
                            {visible
                              ? formatCOP(visible.price, visible.currency)
                              : t('eventDetail.soldOut')}
                          </div>
                        </div>
                        {sec.description && (
                          <div className={Styles.sectionDesc}>
                            {sec.description}
                          </div>
                        )}
                        <div className={Styles.sectionPhase}>
                          {visible
                            ? `${visible.name}${active ? '' : ` · ${t('eventDetail.upcoming')}`}`
                            : t('eventDetail.notOnSale')}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedSection &&
                  selectedSection.phases.length > 0 && (
                    <div className={Styles.phaseLadder}>
                      <div className={Styles.phaseLadderHead}>
                        ◆ {t('eventDetail.phasesTitle')}
                      </div>
                      {[...selectedSection.phases]
                        .sort(
                          (a, b) =>
                            new Date(a.startsAt).getTime() -
                            new Date(b.startsAt).getTime(),
                        )
                        .map((p) => {
                          const now = Date.now();
                          const start = new Date(p.startsAt).getTime();
                          const end = new Date(p.endsAt).getTime();
                          const isOpen =
                            p.isActive && start <= now && end > now;
                          const isPast = end <= now;
                          const isUpcoming = start > now;
                          return (
                            <div
                              key={p.id}
                              className={`${Styles.phaseRow} ${
                                isOpen
                                  ? Styles.phaseRowActive
                                  : isPast
                                    ? Styles.phaseRowDim
                                    : ''
                              }`}
                            >
                              <div className={Styles.phaseLeft}>
                                <div className={Styles.phaseName}>
                                  {p.name}
                                  {isOpen && (
                                    <span className={Styles.phaseStatusActive}>
                                      {t('eventDetail.phaseActive')}
                                    </span>
                                  )}
                                  {isUpcoming && (
                                    <span
                                      className={Styles.phaseStatusUpcoming}
                                    >
                                      {t('eventDetail.phaseUpcoming')}
                                    </span>
                                  )}
                                  {isPast && (
                                    <span className={Styles.phaseStatusPast}>
                                      {t('eventDetail.phasePast')}
                                    </span>
                                  )}
                                </div>
                                <div className={Styles.phaseDate}>
                                  {isOpen
                                    ? t('eventDetail.phaseUntil', {
                                        date: new Date(
                                          p.endsAt,
                                        ).toLocaleString(undefined, {
                                          day: '2-digit',
                                          month: 'short',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        }),
                                      })
                                    : isUpcoming
                                      ? t('eventDetail.phaseFrom', {
                                          date: new Date(
                                            p.startsAt,
                                          ).toLocaleString(undefined, {
                                            day: '2-digit',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                          }),
                                        })
                                      : `${new Date(
                                          p.startsAt,
                                        ).toLocaleDateString(undefined, {
                                          day: '2-digit',
                                          month: 'short',
                                        })} → ${new Date(
                                          p.endsAt,
                                        ).toLocaleDateString(undefined, {
                                          day: '2-digit',
                                          month: 'short',
                                        })}`}
                                </div>
                              </div>
                              <div className={Styles.phasePrice}>
                                {formatCOP(p.price, p.currency)}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}

                <div className={Styles.asideEyebrow}>
                  ◆ {t('eventDetail.quantity')}
                </div>
                <div className={Styles.qtyRow}>
                  <button
                    type="button"
                    className={Styles.qtyBtn}
                    onClick={() =>
                      setQty(
                        Math.max(
                          selectedSection?.minPerOrder ?? 1,
                          qty - 1,
                        ),
                      )
                    }
                  >
                    −
                  </button>
                  <div className={Styles.qtyValue}>{qty}</div>
                  <button
                    type="button"
                    className={Styles.qtyBtn}
                    onClick={() =>
                      setQty(
                        Math.min(
                          selectedSection?.maxPerOrder ?? 8,
                          qty + 1,
                        ),
                      )
                    }
                  >
                    +
                  </button>
                </div>

                <div className={Styles.summary}>
                  <Row
                    label={`${qty} × ${formatCOP(unitPrice, displayPhase?.currency ?? event.currency)}`}
                    value={formatCOP(
                      subtotal,
                      displayPhase?.currency ?? event.currency,
                    )}
                  />
                  <Row
                    label={t('eventDetail.serviceFee')}
                    value={formatCOP(
                      serviceFee * qty,
                      displayPhase?.currency ?? event.currency,
                    )}
                  />
                  <Row
                    label={t('eventDetail.total')}
                    value={formatCOP(
                      total,
                      displayPhase?.currency ?? event.currency,
                    )}
                    bold
                  />
                </div>

                <PulseButton
                  variant="primary"
                  fullWidth
                  onClick={handleCheckout}
                  disabled={!displayPhase || !activePhase}
                >
                  {activePhase
                    ? t('eventDetail.continueCheckout')
                    : t('eventDetail.notOnSale')}
                </PulseButton>

                <div className={Styles.protected}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="#d7ff3a"
                    strokeWidth="1.5"
                  >
                    <path d="M7 1l5 2v4c0 3-2.5 5-5 6-2.5-1-5-3-5-6V3l5-2z" />
                  </svg>
                  <div>
                    <strong>{t('eventDetail.protected.title')}</strong>{' '}
                    {t('eventDetail.protected.body')}
                  </div>
                </div>
              </>
            )}
          </div>
          )}
        </aside>
      </div>
    </div>
  );
};

const Row: React.FC<{ label: string; value: string; bold?: boolean }> = ({
  label,
  value,
  bold,
}) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '6px 0',
      fontSize: bold ? 15 : 13,
      fontWeight: bold ? 600 : 400,
      color: bold ? '#faf7f0' : '#bfbab1',
    }}
  >
    <span>{label}</span>
    <span
      style={{
        fontFamily: bold ? 'Bebas Neue, Impact, sans-serif' : undefined,
        fontSize: bold ? 22 : 13,
        color: bold ? '#d7ff3a' : undefined,
      }}
    >
      {value}
    </span>
  </div>
);

const Badge: React.FC<{
  label: string;
  color: 'lime' | 'magenta' | 'muted';
}> = ({ label, color }) => {
  const bg =
    color === 'lime'
      ? 'rgba(215,255,58,0.12)'
      : color === 'magenta'
        ? 'rgba(255,46,147,0.15)'
        : 'rgba(144,139,131,0.15)';
  const border =
    color === 'lime'
      ? 'rgba(215,255,58,0.4)'
      : color === 'magenta'
        ? 'rgba(255,46,147,0.4)'
        : 'rgba(144,139,131,0.4)';
  const text =
    color === 'lime'
      ? '#d7ff3a'
      : color === 'magenta'
        ? '#ff2e93'
        : '#bfbab1';
  return (
    <span
      style={{
        display: 'inline-flex',
        padding: '5px 10px',
        background: bg,
        border: `1px solid ${border}`,
        color: text,
        borderRadius: 2,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10,
        letterSpacing: '0.12em',
        fontWeight: 600,
        textTransform: 'uppercase',
      }}
    >
      {label}
    </span>
  );
};

function buildEventJsonLd(data: PublicEventDetail) {
    const firstSession = data.sessions?.[0];
    const prices =
        firstSession?.sections
            ?.flatMap((sec) => sec.phases?.map((p) => p.price) ?? [])
            ?.filter((p): p is number => typeof p === 'number') ?? [];
    const currency = firstSession?.sections?.[0]?.phases?.[0]?.currency ?? 'COP';
    const offers =
        prices.length > 0
            ? {
                  '@type': 'AggregateOffer',
                  priceCurrency: currency,
                  lowPrice: (Math.min(...prices) / 100).toFixed(2),
                  highPrice: (Math.max(...prices) / 100).toFixed(2),
                  availability: 'https://schema.org/InStock',
                  url:
                      typeof window !== 'undefined'
                          ? window.location.href
                          : undefined,
              }
            : undefined;

    return {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: data.event.title,
        description: data.event.shortDescription ?? data.event.description ?? '',
        image: [data.event.coverImageUrl, data.event.bannerImageUrl].filter(
            Boolean,
        ),
        startDate: firstSession?.startsAt,
        endDate: firstSession?.endsAt,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: data.venue
            ? {
                  '@type': 'Place',
                  name: data.venue.name,
                  address: {
                      '@type': 'PostalAddress',
                      addressLocality: data.venue.city,
                      addressCountry: data.venue.country,
                  },
              }
            : undefined,
        offers,
    };
}

export default EventDetail;
