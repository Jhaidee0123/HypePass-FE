import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-qr-code';
import Styles from './ticket-detail-styles.scss';
import { PulseButton } from '@/presentation/components';
import {
  Marketplace,
  PayoutMethods,
  Transfer,
  Wallet,
} from '@/domain/usecases';
import { WalletQrResponse, WalletTicketView } from '@/domain/models';
import { TransferModal } from './components/transfer-modal';
import { ListForSaleModal } from './components/list-for-sale-modal';

type Props = {
  wallet: Wallet;
  transfer: Transfer;
  marketplace: Marketplace;
  payoutMethods: PayoutMethods;
};

const TicketDetail: React.FC<Props> = ({
  wallet,
  transfer,
  marketplace,
  payoutMethods,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { ticketId } = useParams<{ ticketId: string }>();
  const [view, setView] = useState<WalletTicketView | null>(null);
  const [qr, setQr] = useState<WalletQrResponse | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshQr = useCallback(async () => {
    if (!ticketId) return;
    try {
      const res = await wallet.getQr(ticketId);
      setQr(res);
      setQrError(null);
    } catch (err: any) {
      setQr(null);
      setQrError(
        err?.response?.data?.message ??
          err?.message ??
          t('errors.unexpected'),
      );
    }
  }, [ticketId, wallet, t]);

  useEffect(() => {
    if (!ticketId) return;
    wallet
      .get(ticketId)
      .then((v) => {
        setView(v);
        if (v.qrVisibleNow && v.ticket.status === 'issued') {
          void refreshQr();
        }
      })
      .catch((err) =>
        setError(
          err?.response?.data?.message ??
            err?.message ??
            t('errors.unexpected'),
        ),
      );
  }, [ticketId, wallet, t, refreshQr]);

  // Rotate the QR every 30s while visible (tokens expire after 60s).
  useEffect(() => {
    if (!qr) return;
    timer.current = setInterval(() => {
      void refreshQr();
    }, 30_000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [qr, refreshQr]);

  if (error) {
    return (
      <div className={Styles.page}>
        <div className={Styles.error}>{error}</div>
        <Link to="/wallet" className={Styles.backLink}>
          ← {t('common.back')}
        </Link>
      </div>
    );
  }
  if (!view) {
    return <div className={Styles.page}>{t('common.loading')}</div>;
  }

  const { event, session, section, venue, ticket, qrVisibleNow, checkedInAt } = view;

  const canTransfer = ticket.status === 'issued';

  return (
    <div className={Styles.page}>
      <Helmet>
        <title>HypePass — {event.title}</title>
      </Helmet>

      <div className={Styles.topBar}>
        <Link to="/wallet" className={Styles.backLink}>
          ← {t('wallet.title')}
        </Link>
        <span className={Styles.ticketCode}>{ticket.id.slice(0, 8).toUpperCase()}</span>
      </div>

      <div className={Styles.stub}>
        <div className={Styles.stubHero}>
          {event.coverImageUrl ? (
            <img
              src={event.coverImageUrl}
              alt={event.title}
              className={Styles.stubImage}
            />
          ) : (
            <div className={`${Styles.stubImage} ${Styles.stubImageEmpty}`} />
          )}
          <div className={Styles.stubOverlay}>
            <div className={Styles.stubArtist}>
              {new Date(session.startsAt).toLocaleString(undefined, {
                weekday: 'short',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
            <h1 className={Styles.stubTitle}>{event.title}</h1>
            <div className={Styles.stubMeta}>
              {venue ? `${venue.name} · ${venue.city}` : ''}
            </div>
          </div>
        </div>
        <div className={Styles.notch} />

        <div className={Styles.stubBody}>
          {checkedInAt && (
            <div className={Styles.checkedInBadge}>
              ✓ {t('ticket.checkedInAt', { date: new Date(checkedInAt).toLocaleString() })}
            </div>
          )}

          {ticket.status === 'issued' && qrVisibleNow && qr && (
            <div className={Styles.qrWrap}>
              <div className={Styles.qrBox}>
                <QRCode
                  value={qr.token}
                  size={220}
                  bgColor="#faf7f0"
                  fgColor="#000000"
                  level="M"
                />
              </div>
              <div className={Styles.qrFoot}>
                {t('ticket.qr.footer')}
              </div>
              <button
                type="button"
                onClick={() => void refreshQr()}
                className={Styles.qrRefresh}
              >
                ↻ {t('ticket.qr.refresh')}
              </button>
            </div>
          )}

          {ticket.status === 'issued' && qrVisibleNow && !qr && (
            <div className={Styles.qrWrap}>
              <div className={`${Styles.qrBox} ${Styles.qrBoxLoading}`}>
                {qrError ?? t('common.loading')}
              </div>
            </div>
          )}

          {ticket.status === 'issued' && !qrVisibleNow && (
            <div className={Styles.qrLocked}>
              <div className={Styles.qrLockedIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="4" y="10" width="16" height="11" rx="2" />
                  <path d="M8 10V7a4 4 0 018 0v3" />
                </svg>
              </div>
              <div className={Styles.qrLockedTitle}>
                {t('ticket.qrLocked.title')}
              </div>
              <div className={Styles.qrLockedBody}>
                {t('ticket.qrLocked.availableFrom', {
                  date: new Date(session.qrVisibleFrom).toLocaleString(),
                })}
              </div>
            </div>
          )}

          {ticket.status !== 'issued' && (
            <div className={Styles.qrLocked}>
              <div className={Styles.qrLockedTitle}>
                {t(`wallet.status.${ticket.status === 'checked_in' ? 'checkedIn' : ticket.status}`)}
              </div>
              <div className={Styles.qrLockedBody}>
                {t('ticket.notActive')}
              </div>
            </div>
          )}

          <div className={Styles.kvGrid}>
            <Kv k={t('ticket.kv.section')} v={section.name} />
            <Kv k={t('ticket.kv.date')} v={new Date(session.startsAt).toLocaleString()} />
            <Kv k={t('ticket.kv.venue')} v={venue ? venue.name : '—'} />
            <Kv
              k={t('ticket.kv.faceValue')}
              v={new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: ticket.currency,
                maximumFractionDigits: 0,
              }).format(ticket.faceValue / 100)}
            />
          </div>

          <div className={Styles.actions}>
            <PulseButton
              variant="secondary"
              onClick={() => setTransferOpen(true)}
              disabled={!canTransfer}
            >
              {t('ticket.actions.transfer')}
            </PulseButton>
            <PulseButton
              variant="secondary"
              onClick={() => setListOpen(true)}
              disabled={!canTransfer}
            >
              {t('ticket.actions.list')}
            </PulseButton>
          </div>
        </div>
      </div>

      <TransferModal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        onSuccess={() => {
          setTransferOpen(false);
          navigate('/wallet', { state: { transferred: true } });
        }}
        ticketId={ticket.id}
        eventTitle={event.title}
        transfer={transfer}
      />

      <ListForSaleModal
        open={listOpen}
        onClose={() => setListOpen(false)}
        onSuccess={() => {
          setListOpen(false);
          navigate('/wallet', { state: { listed: true } });
        }}
        ticketId={ticket.id}
        eventTitle={event.title}
        currency={ticket.currency}
        faceValue={ticket.faceValue}
        marketplace={marketplace}
        payoutMethods={payoutMethods}
      />
    </div>
  );
};

const Kv: React.FC<{ k: string; v: string }> = ({ k, v }) => (
  <div className={Styles.kv}>
    <div className={Styles.kvKey}>{k}</div>
    <div className={Styles.kvValue}>{v}</div>
  </div>
);

export default TicketDetail;
