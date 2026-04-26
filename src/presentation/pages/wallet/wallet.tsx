import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Styles from './wallet-styles.scss';
import { Marketplace, Transfer, Wallet } from '@/domain/usecases';
import {
  ResaleListing,
  TransferList,
  WalletTicketView,
} from '@/domain/models';

type Props = {
  wallet: Wallet;
  marketplace: Marketplace;
  transfer: Transfer;
};

type Tab = 'upcoming' | 'past' | 'sales' | 'transfers';

const fmt = (minor: number, currency: string) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(minor / 100);

const WalletPage: React.FC<Props> = ({ wallet, marketplace, transfer }) => {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState<WalletTicketView[] | null>(null);
  const [listings, setListings] = useState<ResaleListing[] | null>(null);
  const [transfers, setTransfers] = useState<TransferList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('upcoming');

  useEffect(() => {
    wallet
      .list()
      .then(setTickets)
      .catch((err) =>
        setError(
          err?.response?.data?.message ??
            err?.message ??
            t('errors.unexpected'),
        ),
      );
  }, [wallet, t]);

  useEffect(() => {
    if (tab === 'sales' && listings === null) {
      marketplace.listMine().then(setListings).catch(() => undefined);
    }
    if (tab === 'transfers' && transfers === null) {
      transfer.list().then(setTransfers).catch(() => undefined);
    }
  }, [tab, marketplace, transfer, listings, transfers]);

  const now = Date.now();
  const { upcoming, past } = useMemo(() => {
    const up: WalletTicketView[] = [];
    const pa: WalletTicketView[] = [];
    for (const tk of tickets ?? []) {
      const endsAt = new Date(tk.session.endsAt).getTime();
      const isPast =
        endsAt < now ||
        tk.ticket.status === 'checked_in' ||
        tk.ticket.status === 'refunded' ||
        tk.ticket.status === 'voided' ||
        tk.ticket.status === 'expired';
      (isPast ? pa : up).push(tk);
    }
    return { upcoming: up, past: pa };
  }, [tickets, now]);

  return (
    <div className={Styles.page}>
      <Helmet>
        <title>HypePass — {t('wallet.title')}</title>
      </Helmet>

      <header className={Styles.header}>
        <div className={Styles.eyebrow}>◆ {t('wallet.eyebrow')}</div>
        <h1 className={Styles.title}>{t('wallet.title')}</h1>
      </header>

      <div className={Styles.tabs}>
        {(['upcoming', 'past', 'sales', 'transfers'] as const).map((t_) => (
          <button
            key={t_}
            type="button"
            className={`${Styles.tab} ${tab === t_ ? Styles.tabActive : ''}`}
            onClick={() => setTab(t_)}
          >
            {t(`wallet.tabs.${t_}`)}
            {t_ === 'upcoming' && ` · ${upcoming.length}`}
            {t_ === 'past' && ` · ${past.length}`}
            {t_ === 'sales' && listings !== null && ` · ${listings.length}`}
            {t_ === 'transfers' &&
              transfers !== null &&
              ` · ${transfers.sent.length + transfers.received.length}`}
          </button>
        ))}
      </div>

      {error && <div className={Styles.error}>{error}</div>}

      {(tab === 'upcoming' || tab === 'past') && (
        <>
          {tickets === null && (
            <div className={Styles.empty}>{t('common.loading')}</div>
          )}
          {tickets !== null &&
            (tab === 'upcoming' ? upcoming : past).length === 0 && (
              <div className={Styles.empty}>
                <h3 className={Styles.emptyTitle}>
                  {t(`wallet.empty.${tab}.title`)}
                </h3>
                <p className={Styles.emptyBody}>
                  {t(`wallet.empty.${tab}.body`)}
                </p>
              </div>
            )}
          {tickets !== null &&
            (tab === 'upcoming' ? upcoming : past).length > 0 && (
              <div className={Styles.grid}>
                {(tab === 'upcoming' ? upcoming : past).map((tk) => (
                  <TicketCard key={tk.ticket.id} view={tk} />
                ))}
              </div>
            )}
        </>
      )}

      {tab === 'sales' && (
        <SalesTab listings={listings} />
      )}

      {tab === 'transfers' && (
        <TransfersTab transfers={transfers} />
      )}
    </div>
  );
};

const TicketCard: React.FC<{ view: WalletTicketView }> = ({ view }) => {
  const { t } = useTranslation();
  const { ticket, event, session, section, qrVisibleNow } = view;

  const statusBadge: { label: string; cls: string } =
    ticket.status === 'checked_in'
      ? { label: t('wallet.status.checkedIn'), cls: Styles.badgeMuted }
      : ticket.status === 'transferred'
        ? { label: t('wallet.status.transferred'), cls: Styles.badgeMuted }
        : ticket.status === 'listed'
          ? { label: t('wallet.status.listed'), cls: Styles.badgeMagenta }
          : qrVisibleNow
            ? { label: t('wallet.status.qrReady'), cls: Styles.badgeLime }
            : { label: t('wallet.status.qrSoon'), cls: Styles.badgeWarn };

  return (
    <Link to={`/wallet/tickets/${ticket.id}`} className={Styles.card}>
      <div className={Styles.cardTop}>
        {event.coverImageUrl ? (
          <img
            src={event.coverImageUrl}
            alt={event.title}
            className={Styles.cover}
          />
        ) : (
          <div className={`${Styles.cover} ${Styles.coverEmpty}`} />
        )}
        <div className={Styles.cardDate}>
          {new Date(session.startsAt).toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: '2-digit',
          })}
        </div>
        <span className={`${Styles.badge} ${statusBadge.cls}`}>
          {statusBadge.label}
        </span>
      </div>
      <div className={Styles.cardBottom}>
        <div className={Styles.cardTitle}>{event.title}</div>
        <div className={Styles.cardMeta}>
          {section.name}
          {view.venue
            ? ` · ${view.venue.name}, ${view.venue.city}`
            : event.locationName
              ? ` · ${event.locationName}`
              : ''}
        </div>
      </div>
    </Link>
  );
};

const SalesTab: React.FC<{ listings: ResaleListing[] | null }> = ({
  listings,
}) => {
  const { t } = useTranslation();
  if (listings === null)
    return <div className={Styles.empty}>{t('common.loading')}</div>;
  if (listings.length === 0)
    return (
      <div className={Styles.empty}>
        <h3 className={Styles.emptyTitle}>
          {t('wallet.sales.emptyTitle')}
        </h3>
        <p className={Styles.emptyBody}>{t('wallet.sales.emptyBody')}</p>
      </div>
    );
  return (
    <div className={Styles.listRows}>
      {listings.map((l) => (
        <div key={l.id} className={Styles.listingRow}>
          <div className={Styles.listingLeft}>
            <div className={Styles.listingStatus}>
              {t(`wallet.sales.status.${l.status}`)}
            </div>
            <div className={Styles.listingMeta}>
              {new Date(l.createdAt).toLocaleString()} · ticket{' '}
              {l.ticketId.slice(0, 8)}
              {l.soldAt ? ` · vendido ${new Date(l.soldAt).toLocaleString()}` : ''}
              {l.cancelledAt
                ? ` · cancelado ${new Date(l.cancelledAt).toLocaleString()}`
                : ''}
            </div>
          </div>
          <div className={Styles.listingRight}>
            <div className={Styles.listingPrice}>
              {fmt(l.askPrice, l.currency)}
            </div>
            <div className={Styles.listingNet}>
              {t('wallet.sales.net')}: {fmt(l.sellerNetAmount, l.currency)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const TransfersTab: React.FC<{ transfers: TransferList | null }> = ({
  transfers,
}) => {
  const { t } = useTranslation();
  if (transfers === null)
    return <div className={Styles.empty}>{t('common.loading')}</div>;
  if (transfers.sent.length === 0 && transfers.received.length === 0)
    return (
      <div className={Styles.empty}>
        <h3 className={Styles.emptyTitle}>
          {t('wallet.transfersEmpty.title')}
        </h3>
        <p className={Styles.emptyBody}>
          {t('wallet.transfersEmpty.body')}
        </p>
      </div>
    );
  return (
    <div className={Styles.listRows}>
      {transfers.sent.map((tr) => (
        <div key={tr.id} className={Styles.listingRow}>
          <div className={Styles.listingLeft}>
            <div className={Styles.listingStatus}>
              ↗ {t('wallet.transfers.sent')} · {tr.status.toUpperCase()}
            </div>
            <div className={Styles.listingMeta}>
              ticket {tr.ticketId.slice(0, 8)} · → {tr.toUserId.slice(0, 8)}
              {tr.completedAt
                ? ` · ${new Date(tr.completedAt).toLocaleString()}`
                : ''}
            </div>
            {tr.note && <div className={Styles.listingNote}>"{tr.note}"</div>}
          </div>
        </div>
      ))}
      {transfers.received.map((tr) => (
        <div key={tr.id} className={Styles.listingRow}>
          <div className={Styles.listingLeft}>
            <div
              className={Styles.listingStatus}
              style={{ color: '#d7ff3a' }}
            >
              ↘ {t('wallet.transfers.received')} · {tr.status.toUpperCase()}
            </div>
            <div className={Styles.listingMeta}>
              ticket {tr.ticketId.slice(0, 8)} · ← {tr.fromUserId.slice(0, 8)}
              {tr.completedAt
                ? ` · ${new Date(tr.completedAt).toLocaleString()}`
                : ''}
            </div>
            {tr.note && <div className={Styles.listingNote}>"{tr.note}"</div>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WalletPage;
