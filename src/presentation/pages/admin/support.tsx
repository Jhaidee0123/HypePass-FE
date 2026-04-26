import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Styles from './support-styles.scss';
import {
  AdminSupport,
  SupportTicketDetail,
  SupportTicketKind,
  SupportTicketRow,
  SupportTicketStatus,
} from '@/domain/usecases';

type Props = {
  support: AdminSupport;
};

const KINDS: Array<'' | SupportTicketKind> = ['', 'support', 'dispute', 'kyc'];
const STATUSES: Array<'' | SupportTicketStatus> = [
  '',
  'open',
  'in_progress',
  'resolved',
  'closed',
];

const AdminSupportPage: React.FC<Props> = ({ support }) => {
  const { t } = useTranslation();
  const [items, setItems] = useState<SupportTicketRow[]>([]);
  const [kind, setKind] = useState<'' | SupportTicketKind>('');
  const [status, setStatus] = useState<'' | SupportTicketStatus>('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SupportTicketDetail | null>(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await support.list({
        kind: kind || undefined,
        status: status || undefined,
        q: q || undefined,
        limit: 100,
      });
      setItems(res.items);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? t('errors.unexpected'),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openDetail = async (id: string) => {
    setBusy(true);
    setError(null);
    try {
      const detail = await support.detail(id);
      setSelected(detail);
      setReplyDraft('');
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? t('errors.unexpected'),
      );
    } finally {
      setBusy(false);
    }
  };

  const handleReply = async () => {
    if (!selected || replyDraft.trim().length === 0) return;
    setBusy(true);
    try {
      const msg = await support.reply(selected.ticket.id, replyDraft.trim());
      setSelected({
        ticket: selected.ticket,
        messages: [...selected.messages, msg],
      });
      setReplyDraft('');
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? t('errors.unexpected'),
      );
    } finally {
      setBusy(false);
    }
  };

  const handleStatus = async (next: SupportTicketStatus) => {
    if (!selected) return;
    setBusy(true);
    try {
      const updated = await support.setStatus(selected.ticket.id, next);
      setSelected({ ticket: updated, messages: selected.messages });
      setItems((prev) =>
        prev.map((row) => (row.id === updated.id ? updated : row)),
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? t('errors.unexpected'),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={Styles.wrap}>
      <div className={Styles.filters}>
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as '' | SupportTicketKind)}
        >
          {KINDS.map((k) => (
            <option key={k || 'all'} value={k}>
              {k || t('admin.support.allKinds')}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as '' | SupportTicketStatus)
          }
        >
          {STATUSES.map((s) => (
            <option key={s || 'all'} value={s}>
              {s || t('admin.support.allStatuses')}
            </option>
          ))}
        </select>
        <input
          type="search"
          className={Styles.search}
          placeholder={t('admin.support.searchPlaceholder')}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          type="button"
          className={Styles.applyBtn}
          onClick={load}
          disabled={loading}
        >
          {loading ? t('common.loading') : t('admin.support.apply')}
        </button>
      </div>

      {error && <div className={Styles.error}>{error}</div>}

      <div className={Styles.split}>
        <ul className={Styles.list}>
          {items.length === 0 && !loading && (
            <li className={Styles.empty}>{t('admin.support.empty')}</li>
          )}
          {items.map((tk) => (
            <li
              key={tk.id}
              className={`${Styles.row} ${selected?.ticket.id === tk.id ? Styles.rowActive : ''} ${Styles[`status_${tk.status}`]}`}
            >
              <button type="button" onClick={() => openDetail(tk.id)}>
                <div className={Styles.rowHead}>
                  <span className={`${Styles.kindPill} ${Styles[`kind_${tk.kind}`]}`}>
                    {tk.kind}
                  </span>
                  <span className={`${Styles.statusPill} ${Styles[`statusPill_${tk.status}`]}`}>
                    {tk.status}
                  </span>
                  <span className={Styles.time}>
                    {new Date(tk.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className={Styles.subject}>{tk.subject}</div>
                <div className={Styles.from}>
                  {tk.guestEmail ?? tk.userId?.slice(0, 8) ?? '—'}
                </div>
              </button>
            </li>
          ))}
        </ul>

        <div className={Styles.detail}>
          {!selected ? (
            <div className={Styles.detailEmpty}>
              {t('admin.support.selectHint')}
            </div>
          ) : (
            <>
              <div className={Styles.detailHead}>
                <div>
                  <div className={Styles.detailSubject}>
                    {selected.ticket.subject}
                  </div>
                  <div className={Styles.detailMeta}>
                    {selected.ticket.kind} ·{' '}
                    {new Date(selected.ticket.createdAt).toLocaleString()}
                    {selected.ticket.guestEmail
                      ? ` · ${selected.ticket.guestEmail}`
                      : ''}
                  </div>
                </div>
                <div className={Styles.statusActions}>
                  {(['open', 'in_progress', 'resolved', 'closed'] as const).map(
                    (s) => (
                      <button
                        key={s}
                        type="button"
                        className={`${Styles.statusBtn} ${selected.ticket.status === s ? Styles.statusBtnActive : ''}`}
                        disabled={busy || selected.ticket.status === s}
                        onClick={() => handleStatus(s)}
                      >
                        {s}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div className={Styles.thread}>
                <div className={`${Styles.message} ${Styles.messageUser}`}>
                  <div className={Styles.messageHead}>
                    <span>USER</span>
                    <span>{new Date(selected.ticket.createdAt).toLocaleString()}</span>
                  </div>
                  <div className={Styles.messageBody}>{selected.ticket.body}</div>
                </div>
                {selected.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`${Styles.message} ${m.authorKind === 'admin' ? Styles.messageAdmin : Styles.messageUser}`}
                  >
                    <div className={Styles.messageHead}>
                      <span>{m.authorKind.toUpperCase()}</span>
                      <span>{new Date(m.createdAt).toLocaleString()}</span>
                    </div>
                    <div className={Styles.messageBody}>{m.body}</div>
                  </div>
                ))}
              </div>

              <div className={Styles.composer}>
                <textarea
                  rows={3}
                  className={Styles.textarea}
                  placeholder={t('admin.support.replyPlaceholder')}
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                />
                <button
                  type="button"
                  className={Styles.sendBtn}
                  disabled={busy || replyDraft.trim().length === 0}
                  onClick={handleReply}
                >
                  {busy ? t('common.loading') : t('admin.support.send')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSupportPage;
