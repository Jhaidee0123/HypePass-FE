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
                    <div
                      style={{
                        display: 'flex',
                        gap: 12,
                        flexWrap: 'wrap',
                        marginBottom: 20,
                      }}
                    >
                      <Link
                        to={`/organizer/companies/${selectedCompany.id}/venues`}
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: 11,
                          letterSpacing: '0.12em',
                          color: '#d7ff3a',
                          textDecoration: 'none',
                          textTransform: 'uppercase',
                        }}
                      >
                        {t('organizer.venues.title')} →
                      </Link>
                      <Link
                        to={`/organizer/companies/${selectedCompany.id}/members`}
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: 11,
                          letterSpacing: '0.12em',
                          color: '#d7ff3a',
                          textDecoration: 'none',
                          textTransform: 'uppercase',
                        }}
                      >
                        {t('organizer.members.title')} →
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
