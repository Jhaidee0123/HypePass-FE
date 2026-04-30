import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Styles from './organizer-styles.scss';
import Editor from './event-editor-styles.scss';
import { PulseButton, ConfirmModal } from '@/presentation/components';
import {
  OrganizerEvents,
  UploadImage,
  CreateSessionParams,
  CreateSectionParams,
  CreatePhaseParams,
  EventStaffMember,
  OrganizerCompanies,
} from '@/domain/usecases';
import { CompanyMembershipRole } from '@/domain/models';
import { EventWithChildren } from '@/domain/models';
import { ImageUpload } from './components/image-upload';
import {
  BANNER_IMAGE_SPEC,
  COVER_IMAGE_SPEC,
} from './components/image-specs';
import { BasicField } from './components/basic-field';
import { ToggleField } from './components/toggle-field';
import { SalesSummaryPanel } from './components/sales-summary-panel';
import { EventStaffPanel } from './components/event-staff-panel';
import { AssignStaffModal } from './components/assign-staff-modal';
import { EventPromotersPanel } from './components/event-promoters-panel';
import { AssignPromotersModal } from './components/assign-promoters-modal';
import { EventPromoterRow, EventPromoters } from '@/domain/usecases';
import LocationPicker from './components/location-picker';
import { AttendeesPanel } from './components/attendees-panel';

type Props = {
  events: OrganizerEvents;
  uploader: UploadImage;
  promoters: EventPromoters;
  companies: OrganizerCompanies;
};

const EMPTY_SESSION: CreateSessionParams = {
  name: '',
  startsAt: '',
  endsAt: '',
  timezone: 'America/Bogota',
};

const EMPTY_SECTION: CreateSectionParams = {
  name: '',
  totalInventory: 100,
  minPerOrder: 1,
  maxPerOrder: 8,
  resaleAllowed: true,
  transferAllowed: true,
};

const EMPTY_PHASE: Omit<CreatePhaseParams, 'startsAt' | 'endsAt'> & {
  startsAt: string;
  endsAt: string;
} = {
  name: 'PREVENTA',
  startsAt: '',
  endsAt: '',
  price: 0,
  currency: 'COP',
  isActive: true,
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'DRAFT',
  pending_review: 'EN REVISIÓN',
  approved: 'APROBADO',
  rejected: 'RECHAZADO',
  published: 'PUBLICADO',
  unpublished: 'DESPUBLICADO',
  cancelled: 'CANCELADO',
  ended: 'TERMINADO',
};

const EventEditor: React.FC<Props> = ({
  events,
  uploader,
  promoters,
  companies,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { companyId, eventId } = useParams<{
    companyId: string;
    eventId: string;
  }>();

  const [data, setData] = useState<EventWithChildren | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingBasic, setSavingBasic] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [staffSnapshot, setStaffSnapshot] = useState<EventStaffMember[]>([]);
  const [staffRefresh, setStaffRefresh] = useState(0);
  const [promotersModalOpen, setPromotersModalOpen] = useState(false);
  const [promotersSnapshot, setPromotersSnapshot] = useState<EventPromoterRow[]>([]);
  const [promotersRefresh, setPromotersRefresh] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState(false);
  const [myRole, setMyRole] = useState<CompanyMembershipRole | null>(null);

  // Resolve the caller's role for this company once on mount. Used to gate
  // the "Delete event" button — only OWNER can delete.
  useEffect(() => {
    if (!companyId) return;
    let cancelled = false;
    companies
      .listMine()
      .then((mine) => {
        if (cancelled) return;
        const match = mine.find((m) => m.company.id === companyId);
        setMyRole(match?.role ?? null);
      })
      .catch(() => {
        if (cancelled) return;
        setMyRole(null);
      });
    return () => {
      cancelled = true;
    };
  }, [companyId, companies]);

  const refresh = useCallback(() => {
    if (!companyId || !eventId) return;
    events
      .get(companyId, eventId)
      .then((d) => setData(d))
      .catch((err) =>
        setError(
          err?.response?.data?.message ??
            err?.message ??
            t('errors.unexpected'),
        ),
      );
  }, [companyId, eventId, events, t]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!data) {
    return (
      <div className={Styles.page}>{error ?? t('common.loading')}</div>
    );
  }

  const { event } = data;

  const saveBasic = async (patch: Partial<typeof event>) => {
    if (!companyId || !eventId) return;
    setSavingBasic(true);
    try {
      await events.update(companyId, eventId, patch as any);
      await refresh();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          t('errors.unexpected'),
      );
    } finally {
      setSavingBasic(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!companyId || !eventId) return;
    setSubmitting(true);
    setError(null);
    try {
      await events.submitForReview(companyId, eventId);
      await refresh();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          t('errors.unexpected'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!companyId || !eventId) return;
    setDeletingEvent(true);
    setError(null);
    try {
      await events.delete(companyId, eventId);
      navigate('/organizer');
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          t('errors.unexpected'),
      );
      setDeleteModalOpen(false);
    } finally {
      setDeletingEvent(false);
    }
  };

  const isSubmittable =
    event.status === 'draft' || event.status === 'rejected';

  return (
    <div className={Styles.page}>
      <Helmet>
        <title>HypePass — {event.title}</title>
      </Helmet>

      <div style={{ marginBottom: 16 }}>
        <Link to="/organizer" className={Editor.backLink}>
          ← {t('common.back')}
        </Link>
      </div>

      <header className={Editor.header}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className={Editor.eyebrow}>◆ {STATUS_LABELS[event.status]}</div>
          <h1 className={Editor.title}>{event.title}</h1>
          <div className={Editor.slug}>/{event.slug}</div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {isSubmittable && (
            <PulseButton
              variant="primary"
              onClick={handleSubmitForReview}
              disabled={submitting}
            >
              {submitting
                ? t('common.loading')
                : t('organizer.events.submitReview')}
            </PulseButton>
          )}
          {myRole === 'owner' && (
            <PulseButton
              variant="secondary"
              onClick={() => setDeleteModalOpen(true)}
            >
              {t('organizer.events.delete')}
            </PulseButton>
          )}
        </div>
      </header>

      {error && <div className={Styles.error}>{error}</div>}

      {event.status === 'pending_review' && (
        <div className={Styles.notice}>
          <strong>{t('organizer.events.pendingReviewTitle')}</strong>
          <p>{t('organizer.events.pendingReviewBody')}</p>
        </div>
      )}
      {event.status === 'rejected' && (
        <div className={`${Styles.notice} ${Styles.noticeDanger}`}>
          <strong>{t('organizer.events.rejectedTitle')}</strong>
          <p>{t('organizer.events.rejectedBody')}</p>
        </div>
      )}

      {/* BASIC INFO */}
      <Panel title={t('organizer.events.sections.basics')}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
          }}
        >
          <ImageUpload
            uploader={uploader}
            value={event.coverImageUrl}
            onChange={(url) => saveBasic({ coverImageUrl: url || null })}
            label={t('organizer.events.fields.cover')}
            aspect={COVER_IMAGE_SPEC.aspect}
            minWidth={COVER_IMAGE_SPEC.minWidth}
            minHeight={COVER_IMAGE_SPEC.minHeight}
            targetRatio={COVER_IMAGE_SPEC.targetRatio}
          />
          <ImageUpload
            uploader={uploader}
            value={event.bannerImageUrl}
            onChange={(url) => saveBasic({ bannerImageUrl: url || null })}
            label={t('organizer.events.fields.banner')}
            aspect={BANNER_IMAGE_SPEC.aspect}
            minWidth={BANNER_IMAGE_SPEC.minWidth}
            minHeight={BANNER_IMAGE_SPEC.minHeight}
            targetRatio={BANNER_IMAGE_SPEC.targetRatio}
          />
        </div>

        <InlineTextField
          label={t('organizer.events.fields.title')}
          value={event.title}
          disabled={savingBasic}
          onSave={(v) => saveBasic({ title: v })}
        />
        <InlineTextField
          label={t('organizer.events.fields.shortDescription')}
          value={event.shortDescription ?? ''}
          disabled={savingBasic}
          onSave={(v) => saveBasic({ shortDescription: v || null })}
        />
        <InlineTextArea
          label={t('organizer.events.fields.description')}
          value={event.description ?? ''}
          disabled={savingBasic}
          onSave={(v) => saveBasic({ description: v || null })}
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 16,
          }}
        >
          <ToggleField
            label={t('organizer.events.fields.resaleEnabled')}
            hint={t('organizer.events.fields.resaleEnabledHint')}
            value={event.resaleEnabled}
            onChange={(v) => saveBasic({ resaleEnabled: v })}
            disabled={savingBasic}
          />
          <ToggleField
            label={t('organizer.events.fields.transferEnabled')}
            value={event.transferEnabled}
            onChange={(v) => saveBasic({ transferEnabled: v })}
            disabled={savingBasic}
          />
          <InlineTextField
            label={t('organizer.events.fields.qrHours')}
            value={
              event.defaultQrVisibleHoursBefore !== null &&
              event.defaultQrVisibleHoursBefore !== undefined
                ? String(event.defaultQrVisibleHoursBefore)
                : ''
            }
            disabled={savingBasic}
            onSave={(v) =>
              saveBasic({
                defaultQrVisibleHoursBefore:
                  v === '' ? null : parseInt(v, 10),
              })
            }
            placeholder="24"
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              letterSpacing: '0.12em',
              color: '#6b6760',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            {t('organizer.events.fields.location')}
          </div>
          <LocationPicker
            value={{
              name: event.locationName ?? null,
              address: event.locationAddress ?? null,
              latitude: event.locationLatitude ?? null,
              longitude: event.locationLongitude ?? null,
            }}
            countryCode="co"
            onChange={(loc) =>
              saveBasic({
                locationName: loc.name,
                locationAddress: loc.address,
                locationLatitude: loc.latitude,
                locationLongitude: loc.longitude,
              })
            }
          />
        </div>
      </Panel>

      {/* SALES SUMMARY */}
      <Panel title={t('organizer.events.sales.title')}>
        <SalesSummaryPanel
          events={events}
          companyId={companyId!}
          eventId={eventId!}
        />
      </Panel>

      {/* ATTENDEES */}
      <Panel title={t('organizer.events.attendees.title')}>
        <AttendeesPanel
          events={events}
          companyId={companyId!}
          eventId={eventId!}
          sessions={data.sessions}
        />
      </Panel>

      {/* STAFF */}
      <Panel title={t('organizer.events.staff.title')}>
        <EventStaffPanel
          events={events}
          companyId={companyId!}
          eventId={eventId!}
          refreshSignal={staffRefresh}
          onAssignClick={(current) => {
            setStaffSnapshot(current);
            setStaffModalOpen(true);
          }}
        />
      </Panel>

      <AssignStaffModal
        events={events}
        companyId={companyId!}
        eventId={eventId!}
        current={staffSnapshot}
        open={staffModalOpen}
        onClose={() => setStaffModalOpen(false)}
        onAssigned={() => {
          setStaffModalOpen(false);
          setStaffRefresh((n) => n + 1);
        }}
      />

      {/* PROMOTERS */}
      <Panel title={t('organizer.events.promoters.title')}>
        <EventPromotersPanel
          promoters={promoters}
          companyId={companyId!}
          eventId={eventId!}
          eventSlug={event.slug}
          sessions={data.sessions}
          refreshSignal={promotersRefresh}
          onAssignClick={(current) => {
            setPromotersSnapshot(current);
            setPromotersModalOpen(true);
          }}
        />
      </Panel>

      <AssignPromotersModal
        promoters={promoters}
        companyId={companyId!}
        eventId={eventId!}
        current={promotersSnapshot}
        open={promotersModalOpen}
        onClose={() => setPromotersModalOpen(false)}
        onAssigned={() => {
          setPromotersModalOpen(false);
          setPromotersRefresh((n) => n + 1);
        }}
      />

      {/* SESSIONS + SECTIONS + PHASES */}
      <Panel title={t('organizer.events.sections.sessions')}>
        <SessionsEditor
          events={events}
          data={data}
          companyId={companyId!}
          eventId={eventId!}
          onRefresh={refresh}
        />
      </Panel>

      <ConfirmModal
        open={deleteModalOpen}
        variant="danger"
        eyebrow={t('organizer.events.deleteModal.eyebrow')}
        title={t('organizer.events.deleteModal.title')}
        body={
          <>
            <p style={{ margin: '0 0 12px' }}>
              {t('organizer.events.deleteModal.body1', {
                title: event.title,
              })}
            </p>
            <p style={{ margin: '0 0 12px' }}>
              {t('organizer.events.deleteModal.body2')}
            </p>
            <p style={{ margin: 0, fontSize: 13, color: '#908b83' }}>
              {t('organizer.events.deleteModal.note')}
            </p>
          </>
        }
        confirmLabel={t('organizer.events.deleteModal.confirm')}
        cancelLabel={t('common.cancel')}
        busy={deletingEvent}
        onConfirm={handleDeleteEvent}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};

// ---------- sub-components ----------

type PanelProps = {
  title: string;
  children: React.ReactNode;
};

const Panel: React.FC<PanelProps> = ({ title, children }) => (
  <section
    style={{
      background: '#0a0908',
      border: '1px solid #242320',
      borderRadius: 6,
      padding: 24,
      marginBottom: 20,
    }}
  >
    <h2
      style={{
        fontFamily: 'Bebas Neue, Impact, sans-serif',
        fontSize: 32,
        color: '#faf7f0',
        letterSpacing: '0.02em',
        marginBottom: 20,
      }}
    >
      {title}
    </h2>
    {children}
  </section>
);

type InlineTextProps = {
  label: string;
  value: string;
  onSave: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

const InlineTextField: React.FC<InlineTextProps> = ({
  label,
  value,
  onSave,
  disabled,
  placeholder,
}) => {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  return (
    <BasicField
      label={label}
      value={local}
      onChange={(v) => setLocal(v)}
      placeholder={placeholder}
      disabled={disabled}
      hint="Presiona Enter para guardar"
    />
  );
};

const InlineTextArea: React.FC<InlineTextProps> = ({
  label,
  value,
  onSave,
  disabled,
}) => {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  return (
    <BasicField
      label={label}
      value={local}
      onChange={(v) => setLocal(v)}
      textarea
      rows={5}
      disabled={disabled}
    />
  );
};


// ---------- Sessions editor ----------

type SessionsEditorProps = {
  events: OrganizerEvents;
  data: EventWithChildren;
  companyId: string;
  eventId: string;
  onRefresh: () => void;
};

const SessionsEditor: React.FC<SessionsEditorProps> = ({
  events,
  data,
  companyId,
  eventId,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState<CreateSessionParams>(EMPTY_SESSION);
  const [busy, setBusy] = useState(false);

  const handleAdd = async () => {
    setBusy(true);
    try {
      await events.addSession(companyId, eventId, {
        ...draft,
        name: draft.name || undefined,
      });
      setDraft(EMPTY_SESSION);
      setShowAdd(false);
      onRefresh();
    } catch (err: any) {
      alert(
        err?.response?.data?.message ??
          err?.message ??
          t('errors.unexpected'),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {data.sessions.length === 0 && (
        <div
          style={{
            padding: 20,
            background: '#121110',
            border: '1px dashed #34312c',
            borderRadius: 4,
            color: '#908b83',
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {t('organizer.events.sessions.empty')}
        </div>
      )}

      {data.sessions.map((s) => (
        <SessionCard
          key={s.id}
          session={s}
          events={events}
          companyId={companyId}
          eventId={eventId}
          onRefresh={onRefresh}
        />
      ))}

      {showAdd ? (
        <div
          style={{
            padding: 20,
            background: '#121110',
            border: '1px solid #d7ff3a',
            borderRadius: 4,
            marginTop: 12,
          }}
        >
          <BasicField
            label={t('organizer.events.sessions.name')}
            value={draft.name ?? ''}
            onChange={(v) => setDraft((p) => ({ ...p, name: v }))}
            placeholder="Día 1"
          />
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}
          >
            <BasicField
              label={t('organizer.events.sessions.startsAt')}
              type="datetime-local"
              value={draft.startsAt}
              onChange={(v) => setDraft((p) => ({ ...p, startsAt: v }))}
              required
            />
            <BasicField
              label={t('organizer.events.sessions.endsAt')}
              type="datetime-local"
              value={draft.endsAt}
              onChange={(v) => setDraft((p) => ({ ...p, endsAt: v }))}
              required
            />
          </div>
          <BasicField
            label={t('organizer.events.sessions.timezone')}
            value={draft.timezone}
            onChange={(v) => setDraft((p) => ({ ...p, timezone: v }))}
          />
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <PulseButton
              variant="primary"
              onClick={handleAdd}
              disabled={busy || !draft.startsAt || !draft.endsAt}
            >
              {busy ? t('common.loading') : t('common.save')}
            </PulseButton>
            <PulseButton
              variant="secondary"
              onClick={() => {
                setShowAdd(false);
                setDraft(EMPTY_SESSION);
              }}
            >
              {t('common.cancel')}
            </PulseButton>
          </div>
        </div>
      ) : (
        <PulseButton variant="secondary" onClick={() => setShowAdd(true)}>
          + {t('organizer.events.sessions.add')}
        </PulseButton>
      )}
    </>
  );
};

// ---------- Session card (with sections + phases) ----------

type SessionCardProps = {
  session: EventWithChildren['sessions'][number];
  events: OrganizerEvents;
  companyId: string;
  eventId: string;
  onRefresh: () => void;
};

const SessionCard: React.FC<SessionCardProps> = ({
  session,
  events,
  companyId,
  eventId,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);
  const [showAddSection, setShowAddSection] = useState(false);
  const [draftSection, setDraftSection] = useState<CreateSectionParams>(
    EMPTY_SECTION,
  );
  const [busy, setBusy] = useState(false);

  const startsDate = new Date(session.startsAt);

  const handleAddSection = async () => {
    setBusy(true);
    try {
      await events.addSection(companyId, eventId, session.id, draftSection);
      setDraftSection(EMPTY_SECTION);
      setShowAddSection(false);
      onRefresh();
    } catch (err: any) {
      alert(
        err?.response?.data?.message ??
          err?.message ??
          t('errors.unexpected'),
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!window.confirm(t('organizer.events.sessions.confirmDelete'))) return;
    try {
      await events.deleteSession(companyId, eventId, session.id);
      onRefresh();
    } catch (err: any) {
      alert(
        err?.response?.data?.message ??
          err?.message ??
          t('errors.unexpected'),
      );
    }
  };

  return (
    <div
      style={{
        border: '1px solid #242320',
        background: '#121110',
        borderRadius: 4,
        marginBottom: 12,
      }}
    >
      <button
        type="button"
        style={{
          width: '100%',
          padding: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
        onClick={() => setOpen((v) => !v)}
      >
        <div>
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              color: '#d7ff3a',
              letterSpacing: '0.12em',
              marginBottom: 4,
            }}
          >
            {startsDate.toLocaleString()}
          </div>
          <div
            style={{
              fontFamily: 'Bebas Neue, Impact, sans-serif',
              fontSize: 24,
              color: '#faf7f0',
              letterSpacing: '0.02em',
            }}
          >
            {session.name ?? t('organizer.events.sessions.untitled')}
          </div>
        </div>
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            color: '#6b6760',
            letterSpacing: '0.1em',
          }}
        >
          {open ? '▾' : '▸'}
        </span>
      </button>

      {open && (
        <div style={{ padding: '0 16px 16px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: 12,
            }}
          >
            <button
              type="button"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10,
                letterSpacing: '0.12em',
                color: '#ff4d5a',
              }}
              onClick={handleDeleteSession}
            >
              {t('organizer.events.sessions.delete').toUpperCase()}
            </button>
          </div>

          {session.sections.length === 0 && (
            <div
              style={{
                padding: 16,
                border: '1px dashed #34312c',
                borderRadius: 4,
                color: '#908b83',
                fontSize: 13,
                marginBottom: 12,
              }}
            >
              {t('organizer.events.sections.empty')}
            </div>
          )}

          {session.sections.map((sec) => (
            <SectionCard
              key={sec.id}
              section={sec}
              events={events}
              companyId={companyId}
              eventId={eventId}
              sessionId={session.id}
              onRefresh={onRefresh}
            />
          ))}

          {showAddSection ? (
            <div
              style={{
                padding: 16,
                background: '#0a0908',
                border: '1px solid #d7ff3a',
                borderRadius: 4,
                marginTop: 12,
              }}
            >
              <BasicField
                label={t('organizer.events.sectionForm.name')}
                value={draftSection.name}
                onChange={(v) =>
                  setDraftSection((p) => ({ ...p, name: v }))
                }
                placeholder="VIP"
                required
              />
              <BasicField
                label={t('organizer.events.sectionForm.totalInventory')}
                type="number"
                value={String(draftSection.totalInventory)}
                onChange={(v) =>
                  setDraftSection((p) => ({
                    ...p,
                    totalInventory: parseInt(v, 10) || 0,
                  }))
                }
                required
              />
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                }}
              >
                <BasicField
                  label={t('organizer.events.sectionForm.minPerOrder')}
                  type="number"
                  value={String(draftSection.minPerOrder ?? 1)}
                  onChange={(v) =>
                    setDraftSection((p) => ({
                      ...p,
                      minPerOrder: parseInt(v, 10) || 1,
                    }))
                  }
                />
                <BasicField
                  label={t('organizer.events.sectionForm.maxPerOrder')}
                  type="number"
                  value={String(draftSection.maxPerOrder ?? 8)}
                  onChange={(v) =>
                    setDraftSection((p) => ({
                      ...p,
                      maxPerOrder: parseInt(v, 10) || 8,
                    }))
                  }
                />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <PulseButton
                  variant="primary"
                  onClick={handleAddSection}
                  disabled={
                    busy ||
                    !draftSection.name ||
                    draftSection.totalInventory <= 0
                  }
                >
                  {busy ? t('common.loading') : t('common.save')}
                </PulseButton>
                <PulseButton
                  variant="secondary"
                  onClick={() => {
                    setShowAddSection(false);
                    setDraftSection(EMPTY_SECTION);
                  }}
                >
                  {t('common.cancel')}
                </PulseButton>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddSection(true)}
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                color: '#d7ff3a',
                letterSpacing: '0.1em',
                marginTop: 8,
              }}
            >
              + {t('organizer.events.sections.add').toUpperCase()}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ---------- Section card (with phases) ----------

type SectionCardProps = {
  section: EventWithChildren['sessions'][number]['sections'][number];
  events: OrganizerEvents;
  companyId: string;
  eventId: string;
  sessionId: string;
  onRefresh: () => void;
};

const SectionCard: React.FC<SectionCardProps> = ({
  section,
  events,
  companyId,
  eventId,
  sessionId,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const [showAddPhase, setShowAddPhase] = useState(false);
  const [draftPhase, setDraftPhase] = useState({ ...EMPTY_PHASE });
  const [busy, setBusy] = useState(false);

  const handleAddPhase = async () => {
    setBusy(true);
    try {
      // The price input is in pesos (what the organizer types). The BE
      // stores minor units (cents), so multiply by 100 here at the boundary.
      const priceInPesos = Number(draftPhase.price) || 0;
      await events.addPhase(companyId, eventId, sessionId, section.id, {
        ...draftPhase,
        price: Math.round(priceInPesos * 100),
      });
      setDraftPhase({ ...EMPTY_PHASE });
      setShowAddPhase(false);
      onRefresh();
    } catch (err: any) {
      alert(
        err?.response?.data?.message ??
          err?.message ??
          t('errors.unexpected'),
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteSection = async () => {
    if (!window.confirm(t('organizer.events.sections.confirmDelete'))) return;
    try {
      await events.deleteSection(companyId, eventId, sessionId, section.id);
      onRefresh();
    } catch (err: any) {
      alert(
        err?.response?.data?.message ??
          err?.message ??
          t('errors.unexpected'),
      );
    }
  };

  const handleDeletePhase = async (phaseId: string) => {
    if (!window.confirm(t('organizer.events.phases.confirmDelete'))) return;
    try {
      await events.deletePhase(
        companyId,
        eventId,
        sessionId,
        section.id,
        phaseId,
      );
      onRefresh();
    } catch (err: any) {
      alert(
        err?.response?.data?.message ??
          err?.message ??
          t('errors.unexpected'),
      );
    }
  };

  return (
    <div
      style={{
        background: '#0a0908',
        border: '1px solid #242320',
        borderRadius: 4,
        padding: 14,
        marginBottom: 10,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 12,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'Bebas Neue, Impact, sans-serif',
              fontSize: 22,
              color: '#faf7f0',
            }}
          >
            {section.name}
          </div>
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              color: '#6b6760',
              marginTop: 2,
            }}
          >
            INVENTARIO {section.totalInventory} · MIN {section.minPerOrder} · MAX {section.maxPerOrder}
          </div>
        </div>
        <button
          type="button"
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            color: '#ff4d5a',
            letterSpacing: '0.12em',
          }}
          onClick={handleDeleteSection}
        >
          {t('organizer.events.sections.delete').toUpperCase()}
        </button>
      </div>

      {section.phases.map((p) => (
        <PhaseRow
          key={p.id}
          phase={p}
          onUpdate={async (patch) => {
            await events.updatePhase(
              companyId,
              eventId,
              sessionId,
              section.id,
              p.id,
              patch,
            );
            onRefresh();
          }}
          onDelete={() => handleDeletePhase(p.id)}
        />
      ))}

      {showAddPhase ? (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            background: '#121110',
            border: '1px solid #d7ff3a',
            borderRadius: 4,
          }}
        >
          <BasicField
            label={t('organizer.events.phaseForm.name')}
            value={draftPhase.name}
            onChange={(v) => setDraftPhase((p) => ({ ...p, name: v }))}
            placeholder="PREVENTA"
            required
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}
          >
            <BasicField
              label={t('organizer.events.phaseForm.startsAt')}
              type="datetime-local"
              value={draftPhase.startsAt}
              onChange={(v) =>
                setDraftPhase((p) => ({ ...p, startsAt: v }))
              }
              required
            />
            <BasicField
              label={t('organizer.events.phaseForm.endsAt')}
              type="datetime-local"
              value={draftPhase.endsAt}
              onChange={(v) =>
                setDraftPhase((p) => ({ ...p, endsAt: v }))
              }
              required
            />
          </div>
          <BasicField
            label={t('organizer.events.phaseForm.price')}
            type="number"
            value={String(draftPhase.price)}
            onChange={(v) =>
              setDraftPhase((p) => ({ ...p, price: parseInt(v, 10) || 0 }))
            }
            hint={t('organizer.events.phaseForm.priceHint')}
            required
          />
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <PulseButton
              variant="primary"
              onClick={handleAddPhase}
              disabled={
                busy ||
                !draftPhase.name ||
                !draftPhase.startsAt ||
                !draftPhase.endsAt ||
                !draftPhase.price
              }
            >
              {busy ? t('common.loading') : t('common.save')}
            </PulseButton>
            <PulseButton
              variant="secondary"
              onClick={() => {
                setShowAddPhase(false);
                setDraftPhase({ ...EMPTY_PHASE });
              }}
            >
              {t('common.cancel')}
            </PulseButton>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAddPhase(true)}
          style={{
            marginTop: 10,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            color: '#d7ff3a',
            letterSpacing: '0.1em',
          }}
        >
          + {t('organizer.events.phases.add').toUpperCase()}
        </button>
      )}
    </div>
  );
};

// ---------- Phase row (read + inline edit) ----------

const toDatetimeLocal = (iso: string): string => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

type PhaseRowProps = {
  phase: EventWithChildren['sessions'][number]['sections'][number]['phases'][number];
  onUpdate: (patch: {
    name?: string;
    startsAt?: string;
    endsAt?: string;
    price?: number;
  }) => Promise<void>;
  onDelete: () => void;
};

const PhaseRow: React.FC<PhaseRowProps> = ({ phase, onUpdate, onDelete }) => {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(phase.name);
  const [startsAt, setStartsAt] = useState(toDatetimeLocal(phase.startsAt));
  const [endsAt, setEndsAt] = useState(toDatetimeLocal(phase.endsAt));
  const [pricePesos, setPricePesos] = useState(String(phase.price / 100));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName(phase.name);
    setStartsAt(toDatetimeLocal(phase.startsAt));
    setEndsAt(toDatetimeLocal(phase.endsAt));
    setPricePesos(String(phase.price / 100));
    setError(null);
  };

  const handleSave = async () => {
    setBusy(true);
    setError(null);
    try {
      const priceInCents = Math.round((Number(pricePesos) || 0) * 100);
      await onUpdate({
        name: name.trim(),
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        price: priceInCents,
      });
      setEditing(false);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? t('errors.unexpected'),
      );
    } finally {
      setBusy(false);
    }
  };

  if (!editing) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 120px',
          gap: 12,
          padding: '10px 0',
          borderTop: '1px solid #242320',
          alignItems: 'center',
          fontSize: 13,
          color: '#bfbab1',
        }}
      >
        <div>
          <div style={{ color: '#faf7f0', fontWeight: 600 }}>{phase.name}</div>
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              color: '#6b6760',
            }}
          >
            {phase.isActive ? 'ACTIVA' : 'INACTIVA'}
          </div>
        </div>
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            color: '#908b83',
          }}
        >
          {new Date(phase.startsAt).toLocaleString()} →{' '}
          {new Date(phase.endsAt).toLocaleString()}
        </div>
        <div
          style={{
            fontFamily: 'Bebas Neue, Impact, sans-serif',
            fontSize: 20,
            color: '#d7ff3a',
            textAlign: 'right',
          }}
        >
          ${(phase.price / 100).toLocaleString('es-CO')}
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            type="button"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              color: '#d7ff3a',
              letterSpacing: '0.12em',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={() => {
              reset();
              setEditing(true);
            }}
          >
            {t('organizer.events.phases.edit').toUpperCase()}
          </button>
          <button
            type="button"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              color: '#ff4d5a',
              letterSpacing: '0.12em',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={onDelete}
          >
            DEL
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: 8,
        padding: 12,
        background: '#121110',
        border: '1px solid #d7ff3a',
        borderRadius: 4,
      }}
    >
      <BasicField
        label={t('organizer.events.phaseForm.name')}
        value={name}
        onChange={setName}
        required
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
        }}
      >
        <BasicField
          label={t('organizer.events.phaseForm.startsAt')}
          type="datetime-local"
          value={startsAt}
          onChange={setStartsAt}
          required
        />
        <BasicField
          label={t('organizer.events.phaseForm.endsAt')}
          type="datetime-local"
          value={endsAt}
          onChange={setEndsAt}
          required
        />
      </div>
      <BasicField
        label={t('organizer.events.phaseForm.price')}
        type="number"
        value={pricePesos}
        onChange={setPricePesos}
        hint={t('organizer.events.phaseForm.priceHint')}
        required
      />
      {error && (
        <div style={{ color: '#ff4d5a', fontSize: 12, marginBottom: 8 }}>
          {error}
        </div>
      )}
      <div style={{ display: 'flex', gap: 10 }}>
        <PulseButton
          variant="primary"
          onClick={handleSave}
          disabled={
            busy ||
            !name.trim() ||
            !startsAt ||
            !endsAt ||
            !pricePesos
          }
        >
          {busy ? t('common.loading') : t('common.save')}
        </PulseButton>
        <PulseButton
          variant="secondary"
          onClick={() => {
            setEditing(false);
            reset();
          }}
        >
          {t('common.cancel')}
        </PulseButton>
      </div>
    </div>
  );
};

export default EventEditor;
