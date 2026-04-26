import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import Styles from './support-form-styles.scss';
import { PublicSupport, SupportTicketKind } from '@/domain/usecases';

type Props = {
  support: PublicSupport;
};

const SupportForm: React.FC<Props> = ({ support }) => {
  const { t } = useTranslation();
  const [kind, setKind] = useState<SupportTicketKind>('support');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [okId, setOkId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (subject.trim().length < 4) {
      setError(t('public.support.subjectMin'));
      return;
    }
    if (body.trim().length < 10) {
      setError(t('public.support.bodyMin'));
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t('public.support.emailInvalid'));
      return;
    }
    setBusy(true);
    try {
      const ticket = await support.open({
        kind,
        subject: subject.trim(),
        body: body.trim(),
        guestEmail: email.trim(),
      });
      setOkId(ticket.id);
      setSubject('');
      setBody('');
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? t('errors.unexpected'),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={Styles.page}>
      <Helmet>
        <title>HypePass — {t('public.support.title')}</title>
      </Helmet>
      <div className={Styles.eyebrow}>◆ HELP</div>
      <h1 className={Styles.title}>{t('public.support.title')}</h1>
      <p className={Styles.intro}>{t('public.support.intro')}</p>

      {okId ? (
        <div className={Styles.success}>
          <strong>{t('public.support.thanks')}</strong>
          <p>
            {t('public.support.ticketIdLabel')}{' '}
            <code>{okId.slice(0, 8)}</code>
          </p>
          <button
            type="button"
            className={Styles.secondary}
            onClick={() => {
              setOkId(null);
              setKind('support');
            }}
          >
            {t('public.support.openAnother')}
          </button>
        </div>
      ) : (
        <form className={Styles.form} onSubmit={submit}>
          <label>
            <span>{t('public.support.kind')}</span>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as SupportTicketKind)}
            >
              <option value="support">{t('public.support.kinds.support')}</option>
              <option value="dispute">{t('public.support.kinds.dispute')}</option>
              <option value="kyc">{t('public.support.kinds.kyc')}</option>
            </select>
          </label>
          <label>
            <span>{t('public.support.email')}</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            <span>{t('public.support.subject')}</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </label>
          <label>
            <span>{t('public.support.body')}</span>
            <textarea
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </label>
          {error && <div className={Styles.error}>{error}</div>}
          <button type="submit" className={Styles.primary} disabled={busy}>
            {busy ? t('common.loading') : t('public.support.submit')}
          </button>
        </form>
      )}
    </div>
  );
};

export default SupportForm;
