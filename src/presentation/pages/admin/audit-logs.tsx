import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Styles from './audit-logs-styles.scss';
import {
  AdminAuditLogItem,
  AdminAuditLogs,
  AdminAuditLogsQuery,
  AdminSystemLogs,
  SystemLogEntry,
  SystemLogLevel,
} from '@/domain/usecases';

type Props = {
  auditLogs: AdminAuditLogs;
  systemLogs: AdminSystemLogs;
};

type Mode = 'audit' | 'system';

const PAGE_SIZE = 50;

const ACTION_GROUPS = [
  'company',
  'event',
  'payout',
  'order',
  'courtesy',
  'staff',
] as const;

const TARGET_TYPES = [
  'company',
  'event',
  'payout',
  'order',
  'ticket',
  'user',
] as const;

const ACTOR_KINDS: Array<'' | 'user' | 'system'> = ['', 'user', 'system'];

const SYSTEM_LEVELS: Array<'' | SystemLogLevel> = ['', 'debug', 'info', 'warn', 'error'];

const AdminAuditLogsPage: React.FC<Props> = ({ auditLogs, systemLogs }) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('audit');

  // Audit state
  const [query, setQuery] = useState<AdminAuditLogsQuery>({
    limit: PAGE_SIZE,
    offset: 0,
  });
  const [items, setItems] = useState<AdminAuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // System state
  const [sysLevel, setSysLevel] = useState<'' | SystemLogLevel>('');
  const [sysContains, setSysContains] = useState('');
  const [sysItems, setSysItems] = useState<SystemLogEntry[]>([]);
  const [sysNote, setSysNote] = useState('');
  const [sysLoading, setSysLoading] = useState(false);
  const [sysError, setSysError] = useState<string | null>(null);
  const [sysExpanded, setSysExpanded] = useState<Set<string>>(new Set());

  const loadAudit = async (next = query) => {
    setLoading(true);
    setError(null);
    try {
      const res = await auditLogs.list(next);
      setItems(res.items);
      setTotal(res.total);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? t('errors.unexpected'),
      );
    } finally {
      setLoading(false);
    }
  };

  const loadSystem = async () => {
    setSysLoading(true);
    setSysError(null);
    try {
      const res = await systemLogs.list({
        level: sysLevel || undefined,
        contains: sysContains || undefined,
        limit: 200,
      });
      setSysItems(res.items);
      setSysNote(res.note);
    } catch (err: any) {
      setSysError(
        err?.response?.data?.message ?? err?.message ?? t('errors.unexpected'),
      );
    } finally {
      setSysLoading(false);
    }
  };

  useEffect(() => {
    if (mode === 'audit') void loadAudit();
    else void loadSystem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const setQueryField = (patch: Partial<AdminAuditLogsQuery>) => {
    const next = { ...query, ...patch, offset: 0 };
    setQuery(next);
  };

  const applyAudit = () => void loadAudit(query);

  const resetAudit = () => {
    const next: AdminAuditLogsQuery = { limit: PAGE_SIZE, offset: 0 };
    setQuery(next);
    void loadAudit(next);
  };

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSys = (key: string) => {
    setSysExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const goToPage = (offset: number) => {
    const next = { ...query, offset };
    setQuery(next);
    void loadAudit(next);
  };

  const limit = query.limit ?? PAGE_SIZE;
  const offset = query.offset ?? 0;
  const lastOffset = useMemo(
    () => Math.max(0, Math.floor((total - 1) / limit) * limit),
    [total, limit],
  );

  return (
    <div className={Styles.wrap}>
      <div className={Styles.modeRow}>
        <button
          type="button"
          className={`${Styles.modeBtn} ${mode === 'audit' ? Styles.modeBtnActive : ''}`}
          onClick={() => setMode('audit')}
        >
          {t('admin.audit.mode.audit')}
        </button>
        <button
          type="button"
          className={`${Styles.modeBtn} ${mode === 'system' ? Styles.modeBtnActive : ''}`}
          onClick={() => setMode('system')}
        >
          {t('admin.audit.mode.system')}
        </button>
      </div>

      {mode === 'audit' && (
        <>
          <div className={Styles.filterPanel}>
            <div className={Styles.filterField}>
              <label>{t('admin.audit.filter.actorKind')}</label>
              <select
                value={query.actorKind ?? ''}
                onChange={(e) =>
                  setQueryField({
                    actorKind: (e.target.value || undefined) as
                      | 'user'
                      | 'system'
                      | undefined,
                  })
                }
              >
                {ACTOR_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {k ? t(`admin.audit.actorKind.${k}`) : t('admin.audit.filter.any')}
                  </option>
                ))}
              </select>
            </div>

            <div className={Styles.filterField}>
              <label>{t('admin.audit.filter.actorUserId')}</label>
              <input
                type="text"
                value={query.actorUserId ?? ''}
                onChange={(e) =>
                  setQueryField({ actorUserId: e.target.value || undefined })
                }
                placeholder="user uuid"
              />
            </div>

            <div className={Styles.filterField}>
              <label>{t('admin.audit.filter.targetType')}</label>
              <select
                value={query.targetType ?? ''}
                onChange={(e) =>
                  setQueryField({ targetType: e.target.value || undefined })
                }
              >
                <option value="">{t('admin.audit.filter.any')}</option>
                {TARGET_TYPES.map((tt) => (
                  <option key={tt} value={tt}>
                    {tt}
                  </option>
                ))}
              </select>
            </div>

            <div className={Styles.filterField}>
              <label>{t('admin.audit.filter.targetId')}</label>
              <input
                type="text"
                value={query.targetId ?? ''}
                onChange={(e) =>
                  setQueryField({ targetId: e.target.value || undefined })
                }
                placeholder="target id"
              />
            </div>

            <div className={Styles.filterField}>
              <label>{t('admin.audit.filter.action')}</label>
              <select
                value={query.actionPrefix ?? ''}
                onChange={(e) =>
                  setQueryField({
                    actionPrefix: e.target.value
                      ? `${e.target.value}.`
                      : undefined,
                    action: undefined,
                  })
                }
              >
                <option value="">{t('admin.audit.filter.any')}</option>
                {ACTION_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}.*
                  </option>
                ))}
              </select>
            </div>

            <div className={Styles.filterField}>
              <label>{t('admin.audit.filter.from')}</label>
              <input
                type="date"
                value={query.from ?? ''}
                onChange={(e) =>
                  setQueryField({ from: e.target.value || undefined })
                }
              />
            </div>

            <div className={Styles.filterField}>
              <label>{t('admin.audit.filter.to')}</label>
              <input
                type="date"
                value={query.to ?? ''}
                onChange={(e) =>
                  setQueryField({ to: e.target.value || undefined })
                }
              />
            </div>

            <div className={Styles.filterActions}>
              <button
                type="button"
                className={Styles.applyBtn}
                onClick={applyAudit}
                disabled={loading}
              >
                {loading ? t('common.loading') : t('admin.audit.filter.apply')}
              </button>
              <button
                type="button"
                className={Styles.resetBtn}
                onClick={resetAudit}
                disabled={loading}
              >
                {t('admin.audit.filter.reset')}
              </button>
            </div>
          </div>

          {error && <div className={Styles.error}>{error}</div>}

          <div className={Styles.summary}>
            <span>
              {t('admin.audit.summary', {
                from: total === 0 ? 0 : offset + 1,
                to: Math.min(total, offset + items.length),
                total,
              })}
            </span>
            <div className={Styles.pager}>
              <button
                type="button"
                onClick={() => goToPage(0)}
                disabled={loading || offset === 0}
              >
                «
              </button>
              <button
                type="button"
                onClick={() => goToPage(Math.max(0, offset - limit))}
                disabled={loading || offset === 0}
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => goToPage(offset + limit)}
                disabled={loading || offset + limit >= total}
              >
                →
              </button>
              <button
                type="button"
                onClick={() => goToPage(lastOffset)}
                disabled={loading || offset >= lastOffset}
              >
                »
              </button>
            </div>
          </div>

          {items.length === 0 ? (
            <div className={Styles.empty}>{t('admin.audit.empty')}</div>
          ) : (
            <ul className={Styles.list}>
              {items.map((row) => {
                const isOpen = expanded.has(row.id);
                return (
                  <li
                    key={row.id}
                    className={`${Styles.row} ${row.actorKind === 'system' ? Styles.rowSystem : ''}`}
                  >
                    <button
                      type="button"
                      className={Styles.rowHead}
                      onClick={() => toggle(row.id)}
                    >
                      <span className={Styles.time}>
                        {new Date(row.createdAt).toLocaleString()}
                      </span>
                      <span className={Styles.actionPill}>{row.action}</span>
                      <span className={Styles.target}>
                        {row.targetType}/{row.targetId.slice(0, 8)}
                      </span>
                      <span className={Styles.actor}>
                        {row.actorKind === 'system'
                          ? 'system'
                          : row.actorUserId
                            ? row.actorUserId.slice(0, 8)
                            : '—'}
                      </span>
                      <span className={Styles.chev}>{isOpen ? '▾' : '▸'}</span>
                    </button>
                    {isOpen && (
                      <pre className={Styles.metadata}>
                        {JSON.stringify(
                          {
                            id: row.id,
                            actorUserId: row.actorUserId,
                            targetId: row.targetId,
                            metadata: row.metadata,
                          },
                          null,
                          2,
                        )}
                      </pre>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      {mode === 'system' && (
        <>
          <div className={Styles.filterPanel}>
            <div className={Styles.filterField}>
              <label>{t('admin.audit.system.level')}</label>
              <select
                value={sysLevel}
                onChange={(e) =>
                  setSysLevel((e.target.value || '') as '' | SystemLogLevel)
                }
              >
                {SYSTEM_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl ? lvl.toUpperCase() : t('admin.audit.filter.any')}
                  </option>
                ))}
              </select>
            </div>

            <div className={Styles.filterField}>
              <label>{t('admin.audit.system.contains')}</label>
              <input
                type="text"
                value={sysContains}
                onChange={(e) => setSysContains(e.target.value)}
                placeholder="search msg/context…"
              />
            </div>

            <div className={Styles.filterActions}>
              <button
                type="button"
                className={Styles.applyBtn}
                onClick={() => void loadSystem()}
                disabled={sysLoading}
              >
                {sysLoading ? t('common.loading') : t('admin.audit.filter.apply')}
              </button>
            </div>
          </div>

          {sysError && <div className={Styles.error}>{sysError}</div>}

          <div className={Styles.summary}>
            <span>
              {t('admin.audit.system.count', { n: sysItems.length })}
            </span>
            <span className={Styles.note}>{sysNote}</span>
          </div>

          {sysItems.length === 0 ? (
            <div className={Styles.empty}>{t('admin.audit.system.empty')}</div>
          ) : (
            <ul className={Styles.list}>
              {sysItems.map((entry, i) => {
                const key = `${entry.time}-${i}`;
                const isOpen = sysExpanded.has(key);
                return (
                  <li
                    key={key}
                    className={`${Styles.row} ${Styles[`level${entry.levelLabel}`] ?? ''}`}
                  >
                    <button
                      type="button"
                      className={Styles.rowHead}
                      onClick={() => toggleSys(key)}
                    >
                      <span className={Styles.time}>
                        {new Date(entry.time).toLocaleTimeString()}
                      </span>
                      <span
                        className={`${Styles.levelPill} ${Styles[`pill${entry.levelLabel}`] ?? ''}`}
                      >
                        {entry.levelLabel.toUpperCase()}
                      </span>
                      <span className={Styles.msg}>
                        {entry.msg || (entry.context ?? '—')}
                      </span>
                      <span className={Styles.chev}>{isOpen ? '▾' : '▸'}</span>
                    </button>
                    {isOpen && (
                      <pre className={Styles.metadata}>
                        {JSON.stringify(entry.raw, null, 2)}
                      </pre>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default AdminAuditLogsPage;
