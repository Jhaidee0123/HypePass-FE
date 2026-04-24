import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import Styles from './profile-styles.scss';
import {
  PulseButton,
  SeoHelmet,
  currentAccountState,
} from '@/presentation/components';
import { authClient } from '@/lib/auth-client';
import { PayoutMethods } from '@/domain/usecases';
import { PayoutMethodsSection } from './components/payout-methods-section';

type Props = {
  payoutMethods: PayoutMethods;
};

const Profile: React.FC<Props> = ({ payoutMethods }) => {
  const { t } = useTranslation();
  const { getCurrentAccount } = useRecoilValue(currentAccountState);
  const account = getCurrentAccount();
  const user = account?.user;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const initials = useMemo(() => {
    if (!user?.name) return 'U';
    return user.name
      .split(/\s+/)
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [user?.name]);

  const fieldErrors = useMemo(() => {
    const errs: Record<string, string | null> = {
      currentPassword: null,
      newPassword: null,
      confirmPassword: null,
    };
    if (newPassword && newPassword.length < 8) {
      errs.newPassword = t('profile.password.minLength');
    }
    if (confirmPassword && confirmPassword !== newPassword) {
      errs.confirmPassword = t('profile.password.mustMatch');
    }
    return errs;
  }, [newPassword, confirmPassword, t]);

  const canSubmit =
    !busy &&
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    confirmPassword === newPassword &&
    currentPassword !== newPassword;

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const { error: authError } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });
      if (authError) {
        setError(authError.message ?? t('errors.unexpected'));
        return;
      }
      setSuccess(t('profile.password.success'));
      resetForm();
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

  if (!user) return null;

  return (
    <div className={Styles.page}>
      <SeoHelmet
        title={`HypePass — ${t('profile.title')}`}
        description={t('profile.subtitle')}
      />

      <div className={Styles.eyebrow}>◆ {t('profile.eyebrow')}</div>
      <h1 className={Styles.title}>{t('profile.title')}</h1>

      <section className={Styles.card}>
        <div className={Styles.identity}>
          <div className={Styles.avatar} aria-hidden>
            {initials}
          </div>
          <div className={Styles.identityCol}>
            <div className={Styles.name}>{user.name}</div>
            <div className={Styles.email}>{user.email}</div>
            <div className={Styles.badges}>
              {user.emailVerified ? (
                <span className={`${Styles.badge} ${Styles.badgeLime}`}>
                  {t('profile.badges.verified')}
                </span>
              ) : (
                <span className={Styles.badge}>
                  {t('profile.badges.unverified')}
                </span>
              )}
              {user.role === 'platform_admin' && (
                <span className={`${Styles.badge} ${Styles.badgeMagenta}`}>
                  {t('profile.badges.admin')}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className={Styles.card}>
        <div className={Styles.cardTitle}>
          ◆ {t('profile.details.title')}
        </div>
        <div className={Styles.kvRow}>
          <span className={Styles.kvKey}>{t('profile.details.userId')}</span>
          <span className={Styles.kvValue}>{user.id.slice(0, 16)}…</span>
        </div>
        <div className={Styles.kvRow}>
          <span className={Styles.kvKey}>
            {t('profile.details.memberSince')}
          </span>
          <span className={Styles.kvValue}>
            {user.createdAt
              ? new Date(user.createdAt).toLocaleDateString()
              : '—'}
          </span>
        </div>
        <div className={Styles.kvRow}>
          <span className={Styles.kvKey}>{t('profile.details.role')}</span>
          <span className={Styles.kvValue}>
            {user.role === 'platform_admin'
              ? t('profile.badges.admin')
              : t('profile.details.userRole')}
          </span>
        </div>
      </section>

      <PayoutMethodsSection payoutMethods={payoutMethods} />

      <section className={Styles.card}>
        <div className={Styles.cardTitle}>
          ◆ {t('profile.password.title')}
        </div>
        <form onSubmit={handleSubmit} className={Styles.form}>
          <div className={Styles.field}>
            <label className={Styles.label}>
              {t('profile.password.current')}
            </label>
            <input
              type="password"
              className={Styles.input}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              disabled={busy}
              required
            />
          </div>

          <div className={Styles.field}>
            <label className={Styles.label}>
              {t('profile.password.new')}
            </label>
            <input
              type="password"
              className={Styles.input}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              disabled={busy}
              minLength={8}
              required
            />
            {fieldErrors.newPassword ? (
              <span className={Styles.fieldError}>
                {fieldErrors.newPassword}
              </span>
            ) : (
              <span className={Styles.fieldHint}>
                {t('profile.password.hint')}
              </span>
            )}
          </div>

          <div className={Styles.field}>
            <label className={Styles.label}>
              {t('profile.password.confirm')}
            </label>
            <input
              type="password"
              className={Styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              disabled={busy}
              required
            />
            {fieldErrors.confirmPassword && (
              <span className={Styles.fieldError}>
                {fieldErrors.confirmPassword}
              </span>
            )}
          </div>

          {error && <div className={Styles.error}>{error}</div>}
          {success && <div className={Styles.success}>{success}</div>}

          <div className={Styles.actions}>
            <PulseButton
              type="submit"
              variant="primary"
              disabled={!canSubmit}
            >
              {busy
                ? t('common.loading')
                : t('profile.password.submit')}
            </PulseButton>
          </div>
          <p className={Styles.fieldHint}>{t('profile.password.note')}</p>
        </form>
      </section>
    </div>
  );
};

export default Profile;
