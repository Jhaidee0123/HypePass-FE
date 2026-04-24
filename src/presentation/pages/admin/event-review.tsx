import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Styles from './admin-styles.scss';
import Review from './event-review-styles.scss';
import { ConfirmModal, PromptModal, PulseButton } from '@/presentation/components';
import { AdminReview } from '@/domain/usecases';
import { EventForReview } from '@/domain/models';

type Props = {
  review: AdminReview;
};

const EventReview: React.FC<Props> = ({ review }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const [data, setData] = useState<EventForReview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [unpublishOpen, setUnpublishOpen] = useState(false);

  const load = useCallback(async () => {
    if (!eventId) return;
    setError(null);
    try {
      const d = await review.getEvent(eventId);
      setData(d);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          t('errors.unexpected'),
      );
    }
  }, [eventId, review, t]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!data) {
    return (
      <div className={Styles.page}>
        {error ?? t('common.loading')}
      </div>
    );
  }

  const { event, sessions, media, reviews } = data;

  const doApprove = async (notes: string) => {
    if (!eventId) return;
    setBusy(true);
    try {
      await review.approveEvent(eventId, notes.trim() || undefined);
      setApproveOpen(false);
      navigate('/admin');
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          t('errors.unexpected'),
      );
      setBusy(false);
    }
  };

  const doReject = async (notes: string) => {
    if (!eventId) return;
    if (notes.trim().length < 10) {
      setRejectError(t('admin.events.rejectMinLength'));
      return;
    }
    setRejectError(null);
    setBusy(true);
    try {
      await review.rejectEvent(eventId, notes.trim());
      setRejectOpen(false);
      navigate('/admin');
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          t('errors.unexpected'),
      );
      setBusy(false);
    }
  };

  const doPublish = async () => {
    if (!eventId) return;
    setBusy(true);
    try {
      await review.publishEvent(eventId);
      setPublishOpen(false);
      await load();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          t('errors.unexpected'),
      );
    } finally {
      setBusy(false);
    }
  };

  const doUnpublish = async () => {
    if (!eventId) return;
    setBusy(true);
    try {
      await review.unpublishEvent(eventId);
      setUnpublishOpen(false);
      await load();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          t('errors.unexpected'),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={Styles.page}>
      <Helmet>
        <title>HypePass — {event.title}</title>
      </Helmet>

      <div style={{ marginBottom: 16 }}>
        <Link
          to="/admin"
          className={Review.backLink}
        >
          ← {t('common.back')}
        </Link>
      </div>

      <header className={Review.header}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className={Review.status}>◆ {event.status.toUpperCase()}</div>
          <h1 className={Review.title}>{event.title}</h1>
          <div className={Review.meta}>
            /{event.slug}{' '}
            {event.publicationSubmittedAt && (
              <>
                · submitted{' '}
                {new Date(event.publicationSubmittedAt).toLocaleString()}
              </>
            )}
          </div>
        </div>
        <div className={Review.actions}>
          {event.status === 'pending_review' && (
            <>
              <PulseButton
                variant="secondary"
                onClick={() => setRejectOpen(true)}
                disabled={busy}
              >
                {t('admin.events.reject')}
              </PulseButton>
              <PulseButton
                variant="primary"
                onClick={() => setApproveOpen(true)}
                disabled={busy}
              >
                {t('admin.events.approve')}
              </PulseButton>
            </>
          )}
          {event.status === 'approved' && (
            <PulseButton
              variant="primary"
              onClick={() => setPublishOpen(true)}
              disabled={busy}
            >
              {t('admin.events.publish')}
            </PulseButton>
          )}
          {event.status === 'published' && (
            <PulseButton
              variant="secondary"
              onClick={() => setUnpublishOpen(true)}
              disabled={busy}
            >
              {t('admin.events.unpublish')}
            </PulseButton>
          )}
          {event.status === 'unpublished' && (
            <PulseButton
              variant="primary"
              onClick={() => setPublishOpen(true)}
              disabled={busy}
            >
              {t('admin.events.publish')}
            </PulseButton>
          )}
        </div>
      </header>

      {error && <div className={Styles.error}>{error}</div>}

      <section className={Review.panel}>
        <h2 className={Review.panelTitle}>
          {t('admin.events.sections.basics')}
        </h2>

        <div className={Review.imgRow}>
          {event.coverImageUrl ? (
            <img
              src={event.coverImageUrl}
              alt="Cover"
              className={Review.cover}
            />
          ) : (
            <div className={`${Review.cover} ${Review.imgEmpty}`}>no cover</div>
          )}
          {event.bannerImageUrl ? (
            <img
              src={event.bannerImageUrl}
              alt="Banner"
              className={Review.banner}
            />
          ) : (
            <div className={`${Review.banner} ${Review.imgEmpty}`}>
              no banner
            </div>
          )}
        </div>

        <Kv k={t('organizer.events.fields.title')} v={event.title} />
        <Kv k={t('organizer.events.fields.slug')} v={`/${event.slug}`} />
        {event.shortDescription && (
          <Kv
            k={t('organizer.events.fields.shortDescription')}
            v={event.shortDescription}
          />
        )}
        {event.description && (
          <Kv
            k={t('organizer.events.fields.description')}
            v={event.description}
            multiline
          />
        )}
        <Kv
          k={t('organizer.events.fields.resaleEnabled')}
          v={event.resaleEnabled ? 'SI' : 'NO'}
        />
        <Kv
          k={t('organizer.events.fields.transferEnabled')}
          v={event.transferEnabled ? 'SI' : 'NO'}
        />
        <Kv
          k={t('organizer.events.fields.qrHours')}
          v={
            event.defaultQrVisibleHoursBefore !== null &&
            event.defaultQrVisibleHoursBefore !== undefined
              ? `${event.defaultQrVisibleHoursBefore}h`
              : t('admin.events.platformDefault')
          }
        />
      </section>

      <section className={Review.panel}>
        <h2 className={Review.panelTitle}>
          {t('admin.events.sections.sessions')}
        </h2>
        {sessions.length === 0 && (
          <div className={Styles.empty}>{t('admin.events.noSessions')}</div>
        )}
        {sessions.map((s) => (
          <div key={s.id} className={Review.sessionCard}>
            <div className={Review.sessionHeader}>
              <div>
                <div className={Review.sessionDate}>
                  {new Date(s.startsAt).toLocaleString()}
                </div>
                <div className={Review.sessionName}>
                  {s.name ?? t('organizer.events.sessions.untitled')}
                </div>
              </div>
              <div className={Review.sessionMeta}>
                TZ {s.timezone}
                <br />
                ENDS {new Date(s.endsAt).toLocaleString()}
              </div>
            </div>

            {s.sections.length === 0 && (
              <div className={Review.sessionEmpty}>
                {t('organizer.events.sections.empty')}
              </div>
            )}

            {s.sections.map((sec) => (
              <div key={sec.id} className={Review.section}>
                <div className={Review.sectionTop}>
                  <div className={Review.sectionName}>{sec.name}</div>
                  <div className={Review.sectionMeta}>
                    INV {sec.totalInventory} · MIN {sec.minPerOrder} · MAX{' '}
                    {sec.maxPerOrder} ·{' '}
                    {sec.resaleAllowed ? 'RESALE OK' : 'NO RESALE'} ·{' '}
                    {sec.transferAllowed ? 'XFER OK' : 'NO XFER'}
                  </div>
                </div>
                {sec.phases.map((p) => (
                  <div key={p.id} className={Review.phase}>
                    <div>
                      <div className={Review.phaseName}>{p.name}</div>
                      <div className={Review.phaseWindow}>
                        {new Date(p.startsAt).toLocaleString()} →{' '}
                        {new Date(p.endsAt).toLocaleString()}
                      </div>
                    </div>
                    <div className={Review.phasePrice}>
                      ${(p.price / 100).toLocaleString('es-CO')}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </section>

      {media.length > 0 && (
        <section className={Review.panel}>
          <h2 className={Review.panelTitle}>
            {t('admin.events.sections.media')}
          </h2>
          <div className={Review.mediaGrid}>
            {media.map((m) => (
              <img
                key={m.id}
                src={m.url}
                alt={m.alt ?? ''}
                className={Review.mediaItem}
              />
            ))}
          </div>
        </section>
      )}

      {reviews.length > 0 && (
        <section className={Review.panel}>
          <h2 className={Review.panelTitle}>
            {t('admin.events.sections.history')}
          </h2>
          {reviews.map((r) => (
            <div key={r.id} className={Review.historyRow}>
              <div className={Review.historyStatus}>
                {r.status.toUpperCase()}
              </div>
              <div className={Review.historyMeta}>
                submitted{' '}
                {new Date(r.submittedAt).toLocaleString()}
                {r.reviewedAt &&
                  ` · reviewed ${new Date(r.reviewedAt).toLocaleString()}`}
              </div>
              {r.reviewNotes && (
                <div className={Review.historyNotes}>{r.reviewNotes}</div>
              )}
            </div>
          ))}
        </section>
      )}

      <PromptModal
        open={approveOpen}
        eyebrow={t('admin.events.approve')}
        title={t('admin.events.approvePromptTitle')}
        body={t('admin.events.approvePromptBody')}
        label={t('admin.events.notesLabel')}
        placeholder={t('admin.events.approvePlaceholder')}
        multiline
        busy={busy}
        confirmLabel={t('admin.events.approve')}
        onConfirm={doApprove}
        onCancel={() => setApproveOpen(false)}
      />

      <PromptModal
        open={rejectOpen}
        eyebrow={t('admin.events.reject')}
        title={t('admin.events.rejectPromptTitle')}
        body={t('admin.events.rejectPromptBody')}
        label={t('admin.events.notesLabel')}
        placeholder={t('admin.events.rejectPlaceholder')}
        multiline
        required
        busy={busy}
        variant="danger"
        confirmLabel={t('admin.events.reject')}
        error={rejectError}
        onConfirm={doReject}
        onCancel={() => {
          setRejectOpen(false);
          setRejectError(null);
        }}
      />

      <ConfirmModal
        open={publishOpen}
        eyebrow={t('admin.events.publish')}
        title={t('admin.events.publishConfirmTitle')}
        body={t('admin.events.publishConfirmBody')}
        confirmLabel={t('admin.events.publish')}
        busy={busy}
        onConfirm={doPublish}
        onCancel={() => setPublishOpen(false)}
      />

      <ConfirmModal
        open={unpublishOpen}
        eyebrow={t('admin.events.unpublish')}
        title={t('admin.events.unpublishConfirmTitle')}
        body={t('admin.events.unpublishConfirmBody')}
        confirmLabel={t('admin.events.unpublish')}
        variant="danger"
        busy={busy}
        onConfirm={doUnpublish}
        onCancel={() => setUnpublishOpen(false)}
      />
    </div>
  );
};

const Kv: React.FC<{ k: string; v: string; multiline?: boolean }> = ({
  k,
  v,
  multiline,
}) => (
  <div style={{ marginBottom: 12 }}>
    <div
      style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10,
        letterSpacing: '0.12em',
        color: '#6b6760',
        textTransform: 'uppercase',
        marginBottom: 4,
      }}
    >
      {k}
    </div>
    <div
      style={{
        color: '#faf7f0',
        fontSize: 14,
        lineHeight: 1.6,
        whiteSpace: multiline ? 'pre-wrap' : 'normal',
      }}
    >
      {v}
    </div>
  </div>
);

export default EventReview;
