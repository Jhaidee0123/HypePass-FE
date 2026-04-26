import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Styles from './events-orders-master-styles.scss';
import {
  AdminEventsMaster,
  AdminOrderDetail,
  AdminOrderRow,
  AdminOrders,
} from '@/domain/usecases';
import { EventModel, EventStatus } from '@/domain/models';
import { ConfirmModal } from '@/presentation/components';

type Props = {
  events: AdminEventsMaster;
  orders: AdminOrders;
};

type Mode = 'events' | 'orders';

const EVENT_STATUSES: Array<'' | EventStatus> = [
  '',
  'draft',
  'pending_review',
  'approved',
  'published',
  'unpublished',
  'rejected',
  'cancelled',
  'ended',
];

const ORDER_STATUSES = [
  '',
  'pending',
  'paid',
  'cancelled',
  'expired',
  'failed',
];

const PAGE_SIZE = 50;

const EventsOrdersMasterPage: React.FC<Props> = ({ events, orders }) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('events');

  // Events
  const [evStatus, setEvStatus] = useState<'' | EventStatus>('');
  const [evSearch, setEvSearch] = useState('');
  const [evList, setEvList] = useState<EventModel[] | null>(null);
  const [evError, setEvError] = useState<string | null>(null);
  const [evLoading, setEvLoading] = useState(false);

  // Orders
  const [orStatus, setOrStatus] = useState('');
  const [orType, setOrType] = useState<'' | 'primary' | 'resale'>('');
  const [orQ, setOrQ] = useState('');
  const [orRecon, setOrRecon] = useState<'' | 'true' | 'false'>('');
  const [orItems, setOrItems] = useState<AdminOrderRow[]>([]);
  const [orTotal, setOrTotal] = useState(0);
  const [orOffset, setOrOffset] = useState(0);
  const [orLoading, setOrLoading] = useState(false);
  const [orError, setOrError] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminOrderDetail | null>(null);
  const [reconcileTarget, setReconcileTarget] = useState<AdminOrderRow | null>(
    null,
  );
  const [reconcileBusy, setReconcileBusy] = useState(false);

  const loadEvents = async () => {
    setEvLoading(true);
    setEvError(null);
    try {
      const list = await events.list({
        status: evStatus || undefined,
        search: evSearch,
      });
      setEvList(list);
    } catch (err: any) {
      setEvError(
        err?.response?.data?.message ?? err?.message ?? t('errors.unexpected'),
      );
    } finally {
      setEvLoading(false);
    }
  };

  const loadOrders = async (offset = orOffset) => {
    setOrLoading(true);
    setOrError(null);
    try {
      const res = await orders.list({
        status: orStatus || undefined,
        type: orType || undefined,
        q: orQ || undefined,
        needsReconciliation:
          orRecon === '' ? undefined : orRecon === 'true',
        limit: PAGE_SIZE,
        offset,
      });
      setOrItems(res.items);
      setOrTotal(res.total);
      setOrOffset(offset);
    } catch (err: any) {
      setOrError(
        err?.response?.data?.message ?? err?.message ?? t('errors.unexpected'),
      );
    } finally {
      setOrLoading(false);
    }
  };

  useEffect(() => {
    if (mode === 'events') void loadEvents();
    else void loadOrders(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleReconcile = async () => {
    if (!reconcileTarget) return;
    setReconcileBusy(true);
    try {
      const updated = await orders.markReconciled(reconcileTarget.id);
      setOrItems((prev) =>
        prev.map((o) => (o.id === updated.id ? updated : o)),
      );
      setReconcileTarget(null);
    } catch (err: any) {
      setOrError(
        err?.response?.data?.message ?? err?.message ?? t('errors.unexpected'),
      );
    } finally {
      setReconcileBusy(false);
    }
  };

  const lastOffset = useMemo(
    () => Math.max(0, Math.floor((orTotal - 1) / PAGE_SIZE) * PAGE_SIZE),
    [orTotal],
  );

  return (
    <div className={Styles.wrap}>
      <div className={Styles.modeRow}>
        <button
          type="button"
          className={`${Styles.modeBtn} ${mode === 'events' ? Styles.modeBtnActive : ''}`}
          onClick={() => setMode('events')}
        >
          {t('admin.evMaster.mode.events')}
        </button>
        <button
          type="button"
          className={`${Styles.modeBtn} ${mode === 'orders' ? Styles.modeBtnActive : ''}`}
          onClick={() => setMode('orders')}
        >
          {t('admin.evMaster.mode.orders')}
        </button>
      </div>

      {mode === 'events' && (
        <>
          <div className={Styles.filters}>
            <input
              type="search"
              className={Styles.search}
              placeholder={t('admin.evMaster.events.searchPlaceholder')}
              value={evSearch}
              onChange={(e) => setEvSearch(e.target.value)}
            />
            <select
              value={evStatus}
              onChange={(e) => setEvStatus(e.target.value as '' | EventStatus)}
            >
              {EVENT_STATUSES.map((s) => (
                <option key={s || 'all'} value={s}>
                  {s || t('admin.evMaster.events.allStatuses')}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={Styles.applyBtn}
              onClick={loadEvents}
              disabled={evLoading}
            >
              {evLoading ? t('common.loading') : t('admin.evMaster.apply')}
            </button>
          </div>

          {evError && <div className={Styles.error}>{evError}</div>}

          {!evList ? (
            <div className={Styles.loading}>{t('common.loading')}</div>
          ) : evList.length === 0 ? (
            <div className={Styles.empty}>{t('admin.evMaster.events.empty')}</div>
          ) : (
            <ul className={Styles.list}>
              {evList.map((ev) => (
                <li key={ev.id} className={Styles.row}>
                  <div className={Styles.rowLeft}>
                    {ev.coverImageUrl ? (
                      <img
                        src={ev.coverImageUrl}
                        alt={ev.title}
                        className={Styles.thumb}
                      />
                    ) : (
                      <div className={Styles.thumbBlank}>—</div>
                    )}
                    <div>
                      <div className={Styles.title}>
                        {ev.title}{' '}
                        <span
                          className={`${Styles.statusPill} ${Styles[`pill_${ev.status}`]}`}
                        >
                          {ev.status}
                        </span>
                      </div>
                      <div className={Styles.meta}>
                        /{ev.slug} · {ev.companyId?.slice(0, 8)}
                      </div>
                    </div>
                  </div>
                  <Link to={`/admin/events/${ev.id}`} className={Styles.cta}>
                    {t('admin.evMaster.events.open')} →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {mode === 'orders' && (
        <>
          <div className={Styles.filters}>
            <input
              type="search"
              className={Styles.search}
              placeholder={t('admin.evMaster.orders.searchPlaceholder')}
              value={orQ}
              onChange={(e) => setOrQ(e.target.value)}
            />
            <select
              value={orStatus}
              onChange={(e) => setOrStatus(e.target.value)}
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s || 'all'} value={s}>
                  {s || t('admin.evMaster.orders.allStatuses')}
                </option>
              ))}
            </select>
            <select
              value={orType}
              onChange={(e) =>
                setOrType(e.target.value as '' | 'primary' | 'resale')
              }
            >
              <option value="">{t('admin.evMaster.orders.allTypes')}</option>
              <option value="primary">primary</option>
              <option value="resale">resale</option>
            </select>
            <select
              value={orRecon}
              onChange={(e) =>
                setOrRecon(e.target.value as '' | 'true' | 'false')
              }
            >
              <option value="">{t('admin.evMaster.orders.allRecon')}</option>
              <option value="true">{t('admin.evMaster.orders.needsRecon')}</option>
              <option value="false">{t('admin.evMaster.orders.cleanRecon')}</option>
            </select>
            <button
              type="button"
              className={Styles.applyBtn}
              onClick={() => void loadOrders(0)}
              disabled={orLoading}
            >
              {orLoading ? t('common.loading') : t('admin.evMaster.apply')}
            </button>
          </div>

          {orError && <div className={Styles.error}>{orError}</div>}

          <div className={Styles.summary}>
            <span>
              {t('admin.evMaster.orders.summary', {
                from: orTotal === 0 ? 0 : orOffset + 1,
                to: Math.min(orTotal, orOffset + orItems.length),
                total: orTotal,
              })}
            </span>
            <div className={Styles.pager}>
              <button
                onClick={() => void loadOrders(0)}
                disabled={orLoading || orOffset === 0}
              >
                «
              </button>
              <button
                onClick={() => void loadOrders(Math.max(0, orOffset - PAGE_SIZE))}
                disabled={orLoading || orOffset === 0}
              >
                ←
              </button>
              <button
                onClick={() => void loadOrders(orOffset + PAGE_SIZE)}
                disabled={orLoading || orOffset + PAGE_SIZE >= orTotal}
              >
                →
              </button>
              <button
                onClick={() => void loadOrders(lastOffset)}
                disabled={orLoading || orOffset >= lastOffset}
              >
                »
              </button>
            </div>
          </div>

          {orItems.length === 0 ? (
            <div className={Styles.empty}>{t('admin.evMaster.orders.empty')}</div>
          ) : (
            <ul className={Styles.list}>
              {orItems.map((o) => (
                <li
                  key={o.id}
                  className={`${Styles.row} ${o.needsReconciliation ? Styles.rowFlag : ''}`}
                >
                  <div className={Styles.rowLeft}>
                    <div>
                      <div className={Styles.title}>
                        {o.buyerFullName}{' '}
                        <span className={Styles.code}>{o.paymentReference}</span>
                      </div>
                      <div className={Styles.meta}>
                        {o.buyerEmail} · {o.type} ·{' '}
                        <span
                          className={`${Styles.statusPill} ${Styles[`pillOrder_${o.status}`]}`}
                        >
                          {o.status}
                        </span>{' '}
                        · {o.currency} {(o.grandTotal / 100).toLocaleString('es-CO')}
                        {o.needsReconciliation && (
                          <span className={Styles.reconBadge}>
                            ⚠ {o.reconciliationReason ?? 'NEEDS RECON'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={Styles.actions}>
                    <button
                      type="button"
                      className={Styles.linkBtn}
                      onClick={async () => {
                        try {
                          const d = await orders.detail(o.id);
                          setDetail(d);
                        } catch (err: any) {
                          setOrError(
                            err?.response?.data?.message ??
                              err?.message ??
                              t('errors.unexpected'),
                          );
                        }
                      }}
                    >
                      {t('admin.evMaster.orders.detail')}
                    </button>
                    {o.needsReconciliation && (
                      <button
                        type="button"
                        className={Styles.primary}
                        onClick={() => setReconcileTarget(o)}
                      >
                        {t('admin.evMaster.orders.reconcile')}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {detail && (
            <div
              className={Styles.detailModal}
              onClick={() => setDetail(null)}
            >
              <div
                className={Styles.detailBox}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={Styles.detailHead}>
                  <div className={Styles.detailTitle}>
                    {detail.order.paymentReference}
                  </div>
                  <button
                    type="button"
                    className={Styles.linkBtn}
                    onClick={() => setDetail(null)}
                  >
                    ×
                  </button>
                </div>
                <pre className={Styles.detailJson}>
                  {JSON.stringify(detail, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <ConfirmModal
            open={reconcileTarget !== null}
            eyebrow={t('admin.evMaster.orders.reconcile')}
            title={t('admin.evMaster.orders.reconcileTitle', {
              ref: reconcileTarget?.paymentReference ?? '',
            })}
            body={t('admin.evMaster.orders.reconcileBody')}
            confirmLabel={t('admin.evMaster.orders.reconcile')}
            busy={reconcileBusy}
            onConfirm={handleReconcile}
            onCancel={() => setReconcileTarget(null)}
          />
        </>
      )}
    </div>
  );
};

export default EventsOrdersMasterPage;
