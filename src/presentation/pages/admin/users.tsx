import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Styles from './users-styles.scss';
import {
  AdminUserRow,
  AdminUsers,
  AdminUsersQuery,
} from '@/domain/usecases';
import { ConfirmModal, PromptModal } from '@/presentation/components';

type Props = {
  users: AdminUsers;
};

const PAGE_SIZE = 50;

const AdminUsersPage: React.FC<Props> = ({ users }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState<AdminUsersQuery>({ limit: PAGE_SIZE, offset: 0 });
  const [items, setItems] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [banTarget, setBanTarget] = useState<AdminUserRow | null>(null);
  const [unbanTarget, setUnbanTarget] = useState<AdminUserRow | null>(null);
  const [promoteTarget, setPromoteTarget] = useState<AdminUserRow | null>(null);
  const [demoteTarget, setDemoteTarget] = useState<AdminUserRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserRow | null>(null);
  const [resetTarget, setResetTarget] = useState<AdminUserRow | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = async (next = query) => {
    setLoading(true);
    setError(null);
    try {
      const res = await users.list(next);
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

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = (patch: Partial<AdminUsersQuery>) => {
    setQuery((prev) => ({ ...prev, ...patch, offset: 0 }));
  };

  const apply = () => void load(query);

  const goToPage = (offset: number) => {
    const next = { ...query, offset };
    setQuery(next);
    void load(next);
  };

  const replaceItem = (row: AdminUserRow) => {
    setItems((prev) => prev.map((u) => (u.id === row.id ? row : u)));
  };

  const handlePromote = async () => {
    if (!promoteTarget) return;
    setBusyId(promoteTarget.id);
    setActionError(null);
    try {
      const updated = await users.setRole(promoteTarget.id, 'platform_admin');
      replaceItem(updated);
      setPromoteTarget(null);
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message ?? err?.message ?? t('errors.unexpected'),
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleDemote = async () => {
    if (!demoteTarget) return;
    setBusyId(demoteTarget.id);
    setActionError(null);
    try {
      const updated = await users.setRole(demoteTarget.id, 'user');
      replaceItem(updated);
      setDemoteTarget(null);
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message ?? err?.message ?? t('errors.unexpected'),
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleBan = async (reason: string) => {
    if (!banTarget) return;
    if (reason.trim().length < 5) {
      setActionError(t('admin.users.ban.minLength'));
      return;
    }
    setBusyId(banTarget.id);
    setActionError(null);
    try {
      const updated = await users.ban(banTarget.id, { reason: reason.trim() });
      replaceItem(updated);
      setBanTarget(null);
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message ?? err?.message ?? t('errors.unexpected'),
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleUnban = async () => {
    if (!unbanTarget) return;
    setBusyId(unbanTarget.id);
    setActionError(null);
    try {
      const updated = await users.unban(unbanTarget.id);
      replaceItem(updated);
      setUnbanTarget(null);
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message ?? err?.message ?? t('errors.unexpected'),
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    setActionError(null);
    try {
      const updated = await users.delete(deleteTarget.id);
      replaceItem(updated);
      setDeleteTarget(null);
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message ?? err?.message ?? t('errors.unexpected'),
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleSendReset = async () => {
    if (!resetTarget) return;
    setBusyId(resetTarget.id);
    setActionError(null);
    try {
      const res = await users.sendPasswordReset(resetTarget.id);
      setResetSuccess(res.email);
      setResetTarget(null);
      window.setTimeout(() => setResetSuccess(null), 4000);
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message ?? err?.message ?? t('errors.unexpected'),
      );
    } finally {
      setBusyId(null);
    }
  };

  const limit = query.limit ?? PAGE_SIZE;
  const offset = query.offset ?? 0;
  const lastOffset = useMemo(
    () => Math.max(0, Math.floor((total - 1) / limit) * limit),
    [total, limit],
  );

  return (
    <div className={Styles.wrap}>
      <div className={Styles.filters}>
        <input
          type="search"
          className={Styles.search}
          placeholder={t('admin.users.searchPlaceholder')}
          value={query.q ?? ''}
          onChange={(e) => setField({ q: e.target.value })}
        />
        <select
          value={query.role ?? ''}
          onChange={(e) =>
            setField({
              role: (e.target.value || undefined) as
                | 'user'
                | 'platform_admin'
                | undefined,
            })
          }
        >
          <option value="">{t('admin.users.filter.allRoles')}</option>
          <option value="user">user</option>
          <option value="platform_admin">platform_admin</option>
        </select>
        <select
          value={
            query.banned === undefined ? '' : query.banned ? 'banned' : 'active'
          }
          onChange={(e) =>
            setField({
              banned:
                e.target.value === ''
                  ? undefined
                  : e.target.value === 'banned',
            })
          }
        >
          <option value="">{t('admin.users.filter.allStatus')}</option>
          <option value="active">{t('admin.users.filter.active')}</option>
          <option value="banned">{t('admin.users.filter.banned')}</option>
        </select>
        <button
          type="button"
          className={Styles.applyBtn}
          onClick={apply}
          disabled={loading}
        >
          {loading ? t('common.loading') : t('admin.users.filter.apply')}
        </button>
      </div>

      {error && <div className={Styles.error}>{error}</div>}

      <div className={Styles.summary}>
        <span>
          {t('admin.users.summary', {
            from: total === 0 ? 0 : offset + 1,
            to: Math.min(total, offset + items.length),
            total,
          })}
        </span>
        <div className={Styles.pager}>
          <button onClick={() => goToPage(0)} disabled={loading || offset === 0}>
            «
          </button>
          <button
            onClick={() => goToPage(Math.max(0, offset - limit))}
            disabled={loading || offset === 0}
          >
            ←
          </button>
          <button
            onClick={() => goToPage(offset + limit)}
            disabled={loading || offset + limit >= total}
          >
            →
          </button>
          <button
            onClick={() => goToPage(lastOffset)}
            disabled={loading || offset >= lastOffset}
          >
            »
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className={Styles.empty}>{t('admin.users.empty')}</div>
      ) : (
        <ul className={Styles.list}>
          {items.map((u) => (
            <li
              key={u.id}
              className={`${Styles.row} ${u.banned ? Styles.rowBanned : ''}`}
            >
              <div className={Styles.identity}>
                {u.image ? (
                  <img src={u.image} alt={u.name} className={Styles.avatar} />
                ) : (
                  <div className={Styles.avatarBlank}>
                    {u.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className={Styles.identityText}>
                  <div className={Styles.name}>
                    {u.name}{' '}
                    {u.role === 'platform_admin' && (
                      <span className={Styles.adminBadge}>ADMIN</span>
                    )}
                    {u.banned && u.banReason === 'ACCOUNT_DELETED' && (
                      <span className={Styles.deletedBadge}>DELETED</span>
                    )}
                    {u.banned && u.banReason !== 'ACCOUNT_DELETED' && (
                      <span className={Styles.banBadge}>BANNED</span>
                    )}
                  </div>
                  <div className={Styles.email}>{u.email}</div>
                  <div className={Styles.meta}>
                    {u.id.slice(0, 8)} · {new Date(u.createdAt).toLocaleDateString()}
                    {u.banned && u.banReason ? ` · ${u.banReason}` : ''}
                  </div>
                </div>
              </div>
              <div className={Styles.actions}>
                {u.role === 'platform_admin' ? (
                  <button
                    type="button"
                    className={Styles.secondary}
                    disabled={busyId === u.id}
                    onClick={() => {
                      setDemoteTarget(u);
                      setActionError(null);
                    }}
                  >
                    {t('admin.users.action.demote')}
                  </button>
                ) : (
                  <button
                    type="button"
                    className={Styles.secondary}
                    disabled={busyId === u.id}
                    onClick={() => {
                      setPromoteTarget(u);
                      setActionError(null);
                    }}
                  >
                    {t('admin.users.action.promote')}
                  </button>
                )}
                {u.banned && u.banReason !== 'ACCOUNT_DELETED' && (
                  <button
                    type="button"
                    className={Styles.primary}
                    disabled={busyId === u.id}
                    onClick={() => {
                      setUnbanTarget(u);
                      setActionError(null);
                    }}
                  >
                    {t('admin.users.action.unban')}
                  </button>
                )}
                {!u.banned && (
                  <button
                    type="button"
                    className={Styles.danger}
                    disabled={busyId === u.id}
                    onClick={() => {
                      setBanTarget(u);
                      setActionError(null);
                    }}
                  >
                    {t('admin.users.action.ban')}
                  </button>
                )}
                {u.banReason !== 'ACCOUNT_DELETED' && (
                  <>
                    <button
                      type="button"
                      className={Styles.secondary}
                      disabled={busyId === u.id}
                      onClick={() => {
                        setResetTarget(u);
                        setActionError(null);
                      }}
                    >
                      {t('admin.users.action.sendReset')}
                    </button>
                    <button
                      type="button"
                      className={Styles.danger}
                      disabled={busyId === u.id}
                      onClick={() => {
                        setDeleteTarget(u);
                        setActionError(null);
                      }}
                    >
                      {t('admin.users.action.delete')}
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <PromptModal
        open={banTarget !== null}
        eyebrow={t('admin.users.action.ban')}
        title={t('admin.users.ban.title', { name: banTarget?.name ?? '' })}
        body={t('admin.users.ban.body')}
        label={t('admin.users.ban.label')}
        placeholder={t('admin.users.ban.placeholder')}
        multiline
        required
        variant="danger"
        busy={busyId === banTarget?.id}
        confirmLabel={t('admin.users.action.ban')}
        error={actionError}
        onConfirm={handleBan}
        onCancel={() => {
          setBanTarget(null);
          setActionError(null);
        }}
      />

      <ConfirmModal
        open={unbanTarget !== null}
        eyebrow={t('admin.users.action.unban')}
        title={t('admin.users.unban.title', { name: unbanTarget?.name ?? '' })}
        body={t('admin.users.unban.body')}
        confirmLabel={t('admin.users.action.unban')}
        busy={busyId === unbanTarget?.id}
        onConfirm={handleUnban}
        onCancel={() => setUnbanTarget(null)}
      />

      <ConfirmModal
        open={promoteTarget !== null}
        eyebrow={t('admin.users.action.promote')}
        title={t('admin.users.promote.title', { name: promoteTarget?.name ?? '' })}
        body={t('admin.users.promote.body')}
        confirmLabel={t('admin.users.action.promote')}
        busy={busyId === promoteTarget?.id}
        onConfirm={handlePromote}
        onCancel={() => setPromoteTarget(null)}
      />

      <ConfirmModal
        open={demoteTarget !== null}
        eyebrow={t('admin.users.action.demote')}
        title={t('admin.users.demote.title', { name: demoteTarget?.name ?? '' })}
        body={t('admin.users.demote.body')}
        confirmLabel={t('admin.users.action.demote')}
        variant="danger"
        busy={busyId === demoteTarget?.id}
        onConfirm={handleDemote}
        onCancel={() => setDemoteTarget(null)}
      />

      <ConfirmModal
        open={resetTarget !== null}
        eyebrow={t('admin.users.action.sendReset')}
        title={t('admin.users.reset.title', { name: resetTarget?.name ?? '' })}
        body={t('admin.users.reset.body', { email: resetTarget?.email ?? '' })}
        confirmLabel={t('admin.users.action.sendReset')}
        busy={busyId === resetTarget?.id}
        onConfirm={handleSendReset}
        onCancel={() => setResetTarget(null)}
      />

      <ConfirmModal
        open={deleteTarget !== null}
        eyebrow={t('admin.users.action.delete')}
        title={t('admin.users.delete.title', {
          name: deleteTarget?.name ?? '',
        })}
        body={t('admin.users.delete.body', {
          email: deleteTarget?.email ?? '',
        })}
        confirmLabel={t('admin.users.action.delete')}
        variant="danger"
        busy={busyId === deleteTarget?.id}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {resetSuccess && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            padding: '12px 18px',
            background: 'rgba(94, 234, 199, 0.15)',
            border: '1px solid #5eeac7',
            color: '#5eeac7',
            borderRadius: 6,
            fontSize: 13,
            zIndex: 100,
          }}
        >
          ✓ {t('admin.users.reset.success', { email: resetSuccess })}
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
