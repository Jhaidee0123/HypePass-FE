import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Styles from './companies-master-styles.scss';
import { AdminReview } from '@/domain/usecases';
import { CompanyModel, CompanyStatus } from '@/domain/models';
import { ConfirmModal, PromptModal } from '@/presentation/components';

type Props = {
  review: AdminReview;
};

const STATUSES: Array<'' | CompanyStatus> = [
  '',
  'pending',
  'active',
  'rejected',
  'suspended',
];

const CompaniesMasterPage: React.FC<Props> = ({ review }) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<'' | CompanyStatus>('');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<CompanyModel[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<CompanyModel | null>(null);
  const [reinstateTarget, setReinstateTarget] = useState<CompanyModel | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await review.listCompanies(status || undefined, search);
      setItems(list);
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

  const apply = () => void load();

  const replace = (next: CompanyModel) => {
    setItems((prev) =>
      prev ? prev.map((c) => (c.id === next.id ? next : c)) : prev,
    );
  };

  const handleSuspend = async (reason: string) => {
    if (!suspendTarget) return;
    if (reason.trim().length < 5) {
      setActionError(t('admin.companiesMaster.suspend.minLength'));
      return;
    }
    setBusyId(suspendTarget.id);
    setActionError(null);
    try {
      const updated = await review.suspendCompany(
        suspendTarget.id,
        reason.trim(),
      );
      replace(updated);
      setSuspendTarget(null);
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message ?? err?.message ?? t('errors.unexpected'),
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleReinstate = async () => {
    if (!reinstateTarget) return;
    setBusyId(reinstateTarget.id);
    setActionError(null);
    try {
      const updated = await review.reinstateCompany(reinstateTarget.id);
      replace(updated);
      setReinstateTarget(null);
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message ?? err?.message ?? t('errors.unexpected'),
      );
    } finally {
      setBusyId(null);
    }
  };

  const counts = useMemo(() => {
    if (!items) return null;
    const map: Record<string, number> = {};
    for (const c of items) map[c.status] = (map[c.status] ?? 0) + 1;
    return map;
  }, [items]);

  return (
    <div className={Styles.wrap}>
      <div className={Styles.filters}>
        <input
          type="search"
          className={Styles.search}
          placeholder={t('admin.companiesMaster.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as '' | CompanyStatus)}
        >
          {STATUSES.map((s) => (
            <option key={s || 'all'} value={s}>
              {s ? t(`admin.companiesMaster.status.${s}`) : t('admin.companiesMaster.allStatuses')}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={Styles.applyBtn}
          onClick={apply}
          disabled={loading}
        >
          {loading ? t('common.loading') : t('admin.companiesMaster.apply')}
        </button>
      </div>

      {error && <div className={Styles.error}>{error}</div>}

      {counts && (
        <div className={Styles.counts}>
          {Object.entries(counts).map(([k, v]) => (
            <span key={k} className={`${Styles.countPill} ${Styles[`status_${k}`]}`}>
              {t(`admin.companiesMaster.status.${k}`)}: {v}
            </span>
          ))}
        </div>
      )}

      {!items ? (
        <div className={Styles.loading}>{t('common.loading')}</div>
      ) : items.length === 0 ? (
        <div className={Styles.empty}>{t('admin.companiesMaster.empty')}</div>
      ) : (
        <ul className={Styles.list}>
          {items.map((c) => (
            <li
              key={c.id}
              className={`${Styles.row} ${Styles[`row_${c.status}`]}`}
            >
              <div className={Styles.identity}>
                {c.logoUrl ? (
                  <img src={c.logoUrl} alt={c.name} className={Styles.logo} />
                ) : (
                  <div className={Styles.logoBlank}>
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className={Styles.name}>
                    {c.name}{' '}
                    <span
                      className={`${Styles.statusBadge} ${Styles[`status_${c.status}`]}`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <div className={Styles.meta}>
                    @{c.slug}
                    {c.legalName ? ` · ${c.legalName}` : ''}
                    {c.contactEmail ? ` · ${c.contactEmail}` : ''}
                  </div>
                  {c.status === 'suspended' && c.reviewNotes && (
                    <div className={Styles.suspendNote}>
                      ⚠ {c.reviewNotes}
                    </div>
                  )}
                </div>
              </div>
              <div className={Styles.actions}>
                <Link
                  to={`/organizer/companies/${c.id}/members`}
                  className={Styles.linkBtn}
                >
                  {t('admin.companiesMaster.action.members')}
                </Link>
                {c.status === 'active' && (
                  <button
                    type="button"
                    className={Styles.danger}
                    disabled={busyId === c.id}
                    onClick={() => {
                      setSuspendTarget(c);
                      setActionError(null);
                    }}
                  >
                    {t('admin.companiesMaster.action.suspend')}
                  </button>
                )}
                {c.status === 'suspended' && (
                  <button
                    type="button"
                    className={Styles.primary}
                    disabled={busyId === c.id}
                    onClick={() => {
                      setReinstateTarget(c);
                      setActionError(null);
                    }}
                  >
                    {t('admin.companiesMaster.action.reinstate')}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <PromptModal
        open={suspendTarget !== null}
        eyebrow={t('admin.companiesMaster.action.suspend')}
        title={t('admin.companiesMaster.suspend.title', {
          name: suspendTarget?.name ?? '',
        })}
        body={t('admin.companiesMaster.suspend.body')}
        label={t('admin.companiesMaster.suspend.label')}
        placeholder={t('admin.companiesMaster.suspend.placeholder')}
        multiline
        required
        variant="danger"
        busy={busyId === suspendTarget?.id}
        confirmLabel={t('admin.companiesMaster.action.suspend')}
        error={actionError}
        onConfirm={handleSuspend}
        onCancel={() => {
          setSuspendTarget(null);
          setActionError(null);
        }}
      />

      <ConfirmModal
        open={reinstateTarget !== null}
        eyebrow={t('admin.companiesMaster.action.reinstate')}
        title={t('admin.companiesMaster.reinstate.title', {
          name: reinstateTarget?.name ?? '',
        })}
        body={t('admin.companiesMaster.reinstate.body')}
        confirmLabel={t('admin.companiesMaster.action.reinstate')}
        busy={busyId === reinstateTarget?.id}
        onConfirm={handleReinstate}
        onCancel={() => setReinstateTarget(null)}
      />
    </div>
  );
};

export default CompaniesMasterPage;
