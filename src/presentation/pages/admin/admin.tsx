import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Styles from './admin-styles.scss';
import { PromptModal, PulseButton } from '@/presentation/components';
import { AdminReview } from '@/domain/usecases';
import { CompanyModel, EventModel } from '@/domain/models';

type Props = {
  review: AdminReview;
};

type Tab = 'events' | 'companies';

const Admin: React.FC<Props> = ({ review }) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('events');
  const [events, setEvents] = useState<EventModel[] | null>(null);
  const [companies, setCompanies] = useState<CompanyModel[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [rejectTarget, setRejectTarget] = useState<CompanyModel | null>(null);
  const [rejectError, setRejectError] = useState<string | null>(null);

  const loadEvents = async () => {
    setError(null);
    try {
      const list = await review.listEvents('pending_review');
      setEvents(list);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          t('errors.unexpected'),
      );
    }
  };

  const loadCompanies = async () => {
    setError(null);
    try {
      const list = await review.listCompanies('pending');
      setCompanies(list);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          t('errors.unexpected'),
      );
    }
  };

  useEffect(() => {
    void loadEvents();
    void loadCompanies();
  }, []);

  const handleApproveCompany = async (id: string) => {
    setBusyId(id);
    try {
      await review.approveCompany(id);
      await loadCompanies();
    } catch (err: any) {
      alert(
        err?.response?.data?.message ??
          err?.message ??
          t('errors.unexpected'),
      );
    } finally {
      setBusyId(null);
    }
  };

  const confirmRejectCompany = async (notes: string) => {
    if (!rejectTarget) return;
    if (notes.trim().length < 10) {
      setRejectError(t('admin.companies.rejectMinLength'));
      return;
    }
    setRejectError(null);
    const id = rejectTarget.id;
    setBusyId(id);
    try {
      await review.rejectCompany(id, notes.trim());
      setRejectTarget(null);
      await loadCompanies();
    } catch (err: any) {
      setRejectError(
        err?.response?.data?.message ??
          err?.message ??
          t('errors.unexpected'),
      );
    } finally {
      setBusyId(null);
    }
  };

  const filteredEvents = useMemo(() => {
    if (!events) return null;
    if (!search.trim()) return events;
    const q = search.trim().toLowerCase();
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.slug.toLowerCase().includes(q),
    );
  }, [events, search]);

  const filteredCompanies = useMemo(() => {
    if (!companies) return null;
    if (!search.trim()) return companies;
    const q = search.trim().toLowerCase();
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.legalName?.toLowerCase() ?? '').includes(q) ||
        (c.contactEmail?.toLowerCase() ?? '').includes(q),
    );
  }, [companies, search]);

  const counts = useMemo(
    () => ({
      events: events?.length ?? 0,
      companies: companies?.length ?? 0,
    }),
    [events, companies],
  );

  return (
    <div className={Styles.page}>
      <Helmet>
        <title>HypePass — {t('admin.title')}</title>
      </Helmet>

      <header className={Styles.header}>
        <div className={Styles.eyebrow}>◆ ADMIN</div>
        <h1 className={Styles.title}>{t('admin.title')}</h1>
        <div style={{ marginTop: 12 }}>
          <Link
            to="/admin/payouts"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#d7ff3a',
              textDecoration: 'none',
            }}
          >
            {t('admin.payouts.title')} →
          </Link>
        </div>
      </header>

      <div className={Styles.tabs}>
        <button
          type="button"
          className={`${Styles.tab} ${tab === 'events' ? Styles.tabActive : ''}`}
          onClick={() => setTab('events')}
        >
          {t('admin.tabs.events')} · {counts.events}
        </button>
        <button
          type="button"
          className={`${Styles.tab} ${tab === 'companies' ? Styles.tabActive : ''}`}
          onClick={() => setTab('companies')}
        >
          {t('admin.tabs.companies')} · {counts.companies}
        </button>
      </div>

      {error && <div className={Styles.error}>{error}</div>}

      <div className={Styles.filterRow}>
        <input
          type="search"
          className={Styles.search}
          placeholder={t('admin.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {tab === 'events' && (
        <section>
          {filteredEvents === null ? (
            <div className={Styles.loading}>{t('common.loading')}</div>
          ) : filteredEvents.length === 0 ? (
            <div className={Styles.empty}>
              {search ? t('admin.noMatches') : t('admin.events.empty')}
            </div>
          ) : (
            <div className={Styles.list}>
              {filteredEvents.map((ev) => (
                <Link
                  key={ev.id}
                  to={`/admin/events/${ev.id}`}
                  className={Styles.row}
                >
                  <div className={Styles.rowLeft}>
                    {ev.coverImageUrl ? (
                      <img
                        src={ev.coverImageUrl}
                        alt={ev.title}
                        className={Styles.thumb}
                      />
                    ) : (
                      <div className={Styles.thumbEmpty}>—</div>
                    )}
                    <div>
                      <div className={Styles.itemTitle}>{ev.title}</div>
                      <div className={Styles.itemMeta}>
                        /{ev.slug} ·{' '}
                        {ev.publicationSubmittedAt
                          ? new Date(
                              ev.publicationSubmittedAt,
                            ).toLocaleString()
                          : ''}
                      </div>
                    </div>
                  </div>
                  <span className={Styles.rowCta}>
                    {t('admin.events.open').toUpperCase()} →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === 'companies' && (
        <section>
          {filteredCompanies === null ? (
            <div className={Styles.loading}>{t('common.loading')}</div>
          ) : filteredCompanies.length === 0 ? (
            <div className={Styles.empty}>
              {search ? t('admin.noMatches') : t('admin.companies.empty')}
            </div>
          ) : (
            <div className={Styles.list}>
              {filteredCompanies.map((c) => (
                <div key={c.id} className={Styles.row}>
                  <div className={Styles.rowLeft}>
                    <div className={Styles.thumbEmpty}>
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className={Styles.itemTitle}>{c.name}</div>
                      <div className={Styles.itemMeta}>
                        @{c.slug}
                        {c.legalName ? ` · ${c.legalName}` : ''}
                        {c.contactEmail ? ` · ${c.contactEmail}` : ''}
                      </div>
                    </div>
                  </div>
                  <div className={Styles.actions}>
                    <PulseButton
                      variant="secondary"
                      onClick={() => {
                        setRejectTarget(c);
                        setRejectError(null);
                      }}
                      disabled={busyId === c.id}
                    >
                      {t('admin.companies.reject')}
                    </PulseButton>
                    <PulseButton
                      variant="primary"
                      onClick={() => handleApproveCompany(c.id)}
                      disabled={busyId === c.id}
                    >
                      {busyId === c.id
                        ? t('common.loading')
                        : t('admin.companies.approve')}
                    </PulseButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <PromptModal
        open={rejectTarget !== null}
        eyebrow={t('admin.companies.reject')}
        title={t('admin.companies.rejectTitle', {
          name: rejectTarget?.name ?? '',
        })}
        body={t('admin.companies.rejectBody')}
        label={t('admin.companies.rejectNotesLabel')}
        placeholder={t('admin.companies.rejectPlaceholder')}
        multiline
        required
        variant="danger"
        busy={busyId === rejectTarget?.id}
        confirmLabel={t('admin.companies.reject')}
        error={rejectError}
        onConfirm={confirmRejectCompany}
        onCancel={() => {
          setRejectTarget(null);
          setRejectError(null);
        }}
      />
    </div>
  );
};

export default Admin;
