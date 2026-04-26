import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Styles from './reset-password-styles.scss';
import { authClient } from '@/lib/auth-client';

const MIN_PASSWORD = 8;

const ResetPassword: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = useMemo(() => params.get('token') ?? '', [params]);

  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      const id = window.setTimeout(() => navigate('/login'), 2500);
      return () => window.clearTimeout(id);
    }
  }, [success, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError(t('resetPassword.errors.missingToken'));
      return;
    }
    if (pwd.length < MIN_PASSWORD) {
      setError(t('resetPassword.errors.tooShort', { min: MIN_PASSWORD }));
      return;
    }
    if (pwd !== confirm) {
      setError(t('resetPassword.errors.mismatch'));
      return;
    }
    setBusy(true);
    try {
      const res = await authClient.resetPassword({
        newPassword: pwd,
        token,
      });
      const errMsg = (res as any)?.error?.message;
      if (errMsg) {
        setError(errMsg);
        setBusy(false);
        return;
      }
      setSuccess(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? t('errors.unexpected'),
      );
      setBusy(false);
    }
  };

  return (
    <div className={Styles.page}>
      <Helmet>
        <title>HypePass — {t('resetPassword.title')}</title>
      </Helmet>
      <div className={Styles.formSide}>
        <div className={Styles.container}>
          <Link to="/login" className={Styles.back}>
            ← {t('common.back')}
          </Link>

          {success ? (
            <>
              <h1 className={Styles.title}>{t('resetPassword.successTitle')}</h1>
              <p className={Styles.subtitle}>
                {t('resetPassword.successBody')}
              </p>
              <Link to="/login" className={Styles.cta}>
                {t('resetPassword.goToLogin')}
              </Link>
            </>
          ) : (
            <>
              <h1 className={Styles.title}>{t('resetPassword.title')}</h1>
              <p className={Styles.subtitle}>
                {t('resetPassword.subtitle')}
              </p>

              {!token && (
                <div className={Styles.error}>
                  {t('resetPassword.errors.missingToken')}
                </div>
              )}

              <form onSubmit={submit} className={Styles.form}>
                <label className={Styles.field}>
                  <span>{t('resetPassword.newPassword')}</span>
                  <input
                    type="password"
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    minLength={MIN_PASSWORD}
                  />
                </label>
                <label className={Styles.field}>
                  <span>{t('resetPassword.confirmPassword')}</span>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    minLength={MIN_PASSWORD}
                  />
                </label>

                {error && <div className={Styles.error}>{error}</div>}

                <button type="submit" disabled={busy || !token}>
                  {busy ? t('common.loading') : t('resetPassword.submit')}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
