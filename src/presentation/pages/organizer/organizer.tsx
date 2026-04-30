import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Styles from './organizer-styles.scss';
import { PulseButton } from '@/presentation/components';
import {
  OrganizerCompanies,
  OrganizerEvents,
} from '@/domain/usecases';
import {
  CompanyModel,
  EventModel,
  MyCompanyView,
} from '@/domain/models';
import { Validation } from '@/presentation/protocols/validation';
import { CreateCompanyForm } from './components/create-company-form';

type Props = {
  companies: OrganizerCompanies;
  events: OrganizerEvents;
  createCompanyValidation: Validation;
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  draft: { label: 'DRAFT', className: 'draft' },
  pending_review: { label: 'EN REVISIÓN', className: 'pending' },
  approved: { label: 'APROBADO', className: 'approved' },
  rejected: { label: 'RECHAZADO', className: 'rejected' },
  published: { label: 'PUBLICADO', className: 'published' },
  unpublished: { label: 'DESPUBLICADO', className: 'draft' },
  cancelled: { label: 'CANCELADO', className: 'rejected' },
  ended: { label: 'TERMINADO', className: 'draft' },
};

const COMPANY_STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: 'EN REVISIÓN', className: 'pending' },
  active: { label: 'ACTIVA', className: 'approved' },
  rejected: { label: 'RECHAZADA', className: 'rejected' },
  suspended: { label: 'SUSPENDIDA', className: 'rejected' },
};

const Organizer: React.FC<Props> = ({
  companies,
  events,
  createCompanyValidation,
}) => {
  const { t } = useTranslation();
  const [myCompanies, setMyCompanies] = useState<MyCompanyView[] | null>(
    null,
  );
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null,
  );
  const [eventList, setEventList] = useState<EventModel[]>([]);
  const [isCreatingCompany, setCreatingCompany] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    companies
      .listMine()
      .then((list) => {
        setMyCompanies(list);
        const firstActive = list.find((c) => c.company.status === 'active');
        setSelectedCompanyId(
          firstActive?.company.id ?? list[0]?.company.id ?? null,
        );
      })
      .catch((err) => setError(err?.message ?? 'Error'));
  }, [companies]);

  const selectedCompany: CompanyModel | null = useMemo(() => {
    if (!selectedCompanyId || !myCompanies) return null;
    return (
      myCompanies.find((c) => c.company.id === selectedCompanyId)?.company ??
      null
    );
  }, [selectedCompanyId, myCompanies]);

  useEffect(() => {
    if (!selectedCompany || selectedCompany.status !== 'active') {
      setEventList([]);
      return;
    }
    setLoadingEvents(true);
    events
      .list(selectedCompany.id)
      .then((list) => setEventList(list))
      .catch((err) => setError(err?.message ?? 'Error'))
      .finally(() => setLoadingEvents(false));
  }, [selectedCompany, events]);

  const handleCompanyCreated = (created: CompanyModel) => {
    setMyCompanies((prev) => [
      { company: created, role: 'owner' as const },
      ...(prev ?? []),
    ]);
    setSelectedCompanyId(created.id);
    setCreatingCompany(false);
  };

  return (
    <div className={Styles.page}>
      <Helmet>
        <title>HypePass — {t('organizer.title')}</title>
      </Helmet>

      <header className={Styles.header}>
        <div>
          <div className={Styles.eyebrow}>◆ {t('nav.organizer').toUpperCase()}</div>
          <h1 className={Styles.title}>{t('organizer.title')}</h1>
        </div>
        <PulseButton
          variant="primary"
          onClick={() => setCreatingCompany(true)}
        >
          + {t('organizer.newCompany')}
        </PulseButton>
      </header>

      {error && <div className={Styles.error}>{error}</div>}

      {isCreatingCompany && (
        <div className={Styles.card}>
          <CreateCompanyForm
            companies={companies}
            validation={createCompanyValidation}
            onCreated={handleCompanyCreated}
            onCancel={() => setCreatingCompany(false)}
          />
        </div>
      )}

      {myCompanies === null && (
        <div className={Styles.card}>{t('common.loading')}</div>
      )}

      {myCompanies && myCompanies.length === 0 && !isCreatingCompany && (
        <div className={Styles.emptyCard}>
          <h3 className={Styles.emptyTitle}>
            {t('organizer.empty.title')}
          </h3>
          <p className={Styles.emptyBody}>{t('organizer.empty.body')}</p>
          <PulseButton
            variant="primary"
            onClick={() => setCreatingCompany(true)}
          >
            {t('organizer.empty.cta')}
          </PulseButton>
        </div>
      )}

      {myCompanies && myCompanies.length > 0 && (
        <section className={Styles.companies}>
          <div className={Styles.companyList}>
            {myCompanies.map(({ company, role }) => {
              const badge = COMPANY_STATUS[company.status];
              return (
                <button
                  key={company.id}
                  type="button"
                  className={`${Styles.companyItem} ${selectedCompanyId === company.id ? Styles.companyItemActive : ''}`}
                  onClick={() => setSelectedCompanyId(company.id)}
                >
                  <div>
                    <div className={Styles.companyName}>{company.name}</div>
                    <div className={Styles.companyMeta}>
                      @{company.slug} · {role.toUpperCase()}
                    </div>
                  </div>
                  <span
                    className={`${Styles.badge} ${Styles[badge.className]}`}
                  >
                    {badge.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className={Styles.companyDetail}>
            {selectedCompany && (
              <>
                {selectedCompany.status === 'pending' && (
                  <div className={Styles.notice}>
                    <strong>{t('organizer.pending.title')}</strong>
                    <p>{t('organizer.pending.body')}</p>
                  </div>
                )}
                {selectedCompany.status === 'rejected' && (
                  <div className={`${Styles.notice} ${Styles.noticeDanger}`}>
                    <strong>{t('organizer.rejected.title')}</strong>
                    <p>
                      {selectedCompany.reviewNotes ??
                        t('organizer.rejected.body')}
                    </p>
                  </div>
                )}
                {selectedCompany.status === 'active' && (
                  <>
                    <div className={Styles.shortcutGrid}>
                      <Link
                        to={`/organizer/companies/${selectedCompany.id}/members`}
                        className={Styles.shortcut}
                      >
                        <div className={Styles.shortcutIcon}>
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                        </div>
                        <div className={Styles.shortcutBody}>
                          <div className={Styles.shortcutTitle}>
                            {t('organizer.shortcuts.members.title')}
                          </div>
                          <div className={Styles.shortcutDesc}>
                            {t('organizer.shortcuts.members.desc')}
                          </div>
                        </div>
                        <span className={Styles.shortcutArrow}>→</span>
                      </Link>

                      <Link
                        to={`/organizer/companies/${selectedCompany.id}/venues`}
                        className={Styles.shortcut}
                      >
                        <div className={Styles.shortcutIcon}>
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                        </div>
                        <div className={Styles.shortcutBody}>
                          <div className={Styles.shortcutTitle}>
                            {t('organizer.shortcuts.places.title')}
                          </div>
                          <div className={Styles.shortcutDesc}>
                            {t('organizer.shortcuts.places.desc')}
                          </div>
                        </div>
                        <span className={Styles.shortcutArrow}>→</span>
                      </Link>

                      <Link
                        to="/organizer/payouts"
                        className={Styles.shortcut}
                      >
                        <div className={Styles.shortcutIcon}>
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <rect x="2" y="6" width="20" height="12" rx="2" />
                            <line x1="2" y1="10" x2="22" y2="10" />
                            <line x1="6" y1="14" x2="10" y2="14" />
                          </svg>
                        </div>
                        <div className={Styles.shortcutBody}>
                          <div className={Styles.shortcutTitle}>
                            {t('organizer.shortcuts.payouts.title')}
                          </div>
                          <div className={Styles.shortcutDesc}>
                            {t('organizer.shortcuts.payouts.desc')}
                          </div>
                        </div>
                        <span className={Styles.shortcutArrow}>→</span>
                      </Link>
                    </div>
                    <div className={Styles.sectionHeader}>
                      <h2 className={Styles.sectionTitle}>
                        {t('organizer.events.title')}
                      </h2>
                      <Link
                        to={`/organizer/companies/${selectedCompany.id}/events/new`}
                      >
                        <PulseButton variant="primary">
                          + {t('organizer.events.new')}
                        </PulseButton>
                      </Link>
                    </div>

                    {loadingEvents && (
                      <div className={Styles.card}>
                        {t('common.loading')}
                      </div>
                    )}

                    {!loadingEvents && eventList.length === 0 && (
                      <div className={Styles.emptyCard}>
                        <h3 className={Styles.emptyTitle}>
                          {t('organizer.events.empty.title')}
                        </h3>
                        <p className={Styles.emptyBody}>
                          {t('organizer.events.empty.body')}
                        </p>
                      </div>
                    )}

                    {!loadingEvents && eventList.length > 0 && (
                      <div className={Styles.eventGrid}>
                        {eventList.map((ev) => {
                          const badge =
                            STATUS_BADGE[ev.status] ?? STATUS_BADGE.draft;
                          return (
                            <Link
                              key={ev.id}
                              to={`/organizer/companies/${selectedCompany.id}/events/${ev.id}`}
                              className={Styles.eventCard}
                            >
                              <div className={Styles.eventCardTop}>
                                {ev.coverImageUrl ? (
                                  <img
                                    src={ev.coverImageUrl}
                                    alt={ev.title}
                                    className={Styles.eventCover}
                                  />
                                ) : (
                                  <div className={Styles.eventCoverEmpty}>
                                    NO COVER
                                  </div>
                                )}
                                <span
                                  className={`${Styles.badge} ${Styles[badge.className]}`}
                                >
                                  {badge.label}
                                </span>
                              </div>
                              <div className={Styles.eventCardBottom}>
                                <div className={Styles.eventTitle}>
                                  {ev.title}
                                </div>
                                <div className={Styles.eventSlug}>
                                  /{ev.slug}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default Organizer;
