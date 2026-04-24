import React, { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import Styles from './checkin-styles.scss';
import { PulseButton } from '@/presentation/components';
import { Checkin } from '@/domain/usecases';
import { ScanResult } from '@/domain/models';
import QrScanner from './qr-scanner';

type Props = {
  checkin: Checkin;
};

const CheckinPage: React.FC<Props> = ({ checkin }) => {
  const { t } = useTranslation();
  const [token, setToken] = useState('');
  const [expectedSessionId, setExpectedSessionId] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const runScan = useCallback(
    async (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      setBusy(true);
      setError(null);
      setResult(null);
      try {
        const res = await checkin.scan({
          token: trimmed,
          expectedSessionId: expectedSessionId.trim() || undefined,
        });
        setResult(res);
        if (res.result === 'accepted') setToken('');
      } catch (err: any) {
        // Map the BE's typed error codes to user-friendly messages. The
        // fallback is the raw `message` field so we don't swallow new
        // errors we haven't explicitly mapped yet.
        const code = err?.response?.data?.errorCode;
        const friendly =
          code === 'NOT_EVENT_STAFF'
            ? t('checkin.errors.notEventStaff')
            : undefined;
        setError(
          friendly ??
            err?.response?.data?.message ??
            err?.message ??
            t('errors.unexpected'),
        );
      } finally {
        setBusy(false);
      }
    },
    [checkin, expectedSessionId, t],
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await runScan(token);
  };

  const handleCameraDecode = useCallback(
    (value: string) => {
      setCameraOn(false);
      setToken(value);
      void runScan(value);
    },
    [runScan],
  );

  return (
    <div className={Styles.page}>
      <Helmet>
        <title>HypePass — {t('checkin.title')}</title>
      </Helmet>

      <header className={Styles.header}>
        <div className={Styles.eyebrow}>◆ CHECK-IN</div>
        <h1 className={Styles.title}>{t('checkin.title')}</h1>
        <p className={Styles.subtitle}>{t('checkin.subtitle')}</p>
      </header>

      <div style={{ marginBottom: 12 }}>
        <PulseButton
          type="button"
          variant={cameraOn ? 'secondary' : 'primary'}
          onClick={() => {
            setCameraError(null);
            setCameraOn((v) => !v);
          }}
          disabled={busy}
        >
          {cameraOn ? t('checkin.cameraStop') : t('checkin.cameraStart')}
        </PulseButton>
      </div>

      {cameraError && <div className={Styles.error}>{cameraError}</div>}

      <QrScanner
        active={cameraOn}
        onDecode={handleCameraDecode}
        onError={(msg) => {
          setCameraOn(false);
          setCameraError(t('checkin.cameraError', { reason: msg }));
        }}
      />

      <form onSubmit={submit} className={Styles.form}>
        <div className={Styles.field}>
          <label className={Styles.label}>{t('checkin.fields.token')}</label>
          <textarea
            className={Styles.textarea}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="eyJ0aWQiOiI..."
            rows={3}
          />
        </div>

        <div className={Styles.field}>
          <label className={Styles.label}>
            {t('checkin.fields.expectedSession')}
          </label>
          <input
            className={Styles.input}
            value={expectedSessionId}
            onChange={(e) => setExpectedSessionId(e.target.value)}
            placeholder="(opcional) uuid de la sesión esperada"
          />
        </div>

        <PulseButton
          type="submit"
          variant="primary"
          fullWidth
          disabled={busy || !token.trim()}
        >
          {busy ? t('common.loading') : t('checkin.scan')}
        </PulseButton>
      </form>

      {error && <div className={Styles.error}>{error}</div>}

      {result && (
        <div
          className={`${Styles.result} ${
            result.result === 'accepted' ? Styles.resultOk : Styles.resultFail
          }`}
        >
          <div className={Styles.resultBadge}>
            {result.result === 'accepted'
              ? t('checkin.result.accepted')
              : t('checkin.result.rejected')}
          </div>
          {result.result === 'accepted' && result.ticket && (
            <>
              <h3 className={Styles.resultTitle}>
                {result.ticket.eventTitle}
              </h3>
              <div className={Styles.resultMeta}>
                {result.ticket.sessionName ??
                  t('organizer.events.sessions.untitled')}
              </div>
            </>
          )}
          {result.result === 'rejected' && result.reason && (
            <div className={Styles.resultMeta}>
              <strong>{t(`checkin.reason.${result.reason}`)}</strong>
            </div>
          )}
          <div className={Styles.resultStamp}>
            {new Date(result.scannedAt).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckinPage;
