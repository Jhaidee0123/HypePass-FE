/**
 * Login Page
 *
 * Clean login form with email + password.
 * Dependencies (authentication, validation) are injected via props
 * from the factory — the page never imports concrete implementations.
 */
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import Styles from './login-styles.scss';
import { loginState, Input, SubmitButton, FormStatus } from './components';
import { FeedbackModal, currentAccountState } from '@/presentation/components';
import { Validation } from '@/presentation/protocols/validation';
import { Authentication } from '@/domain/usecases';
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';

type Props = {
  validation: Validation;
  authentication: Authentication;
};

const Login: React.FC<Props> = ({ validation, authentication }: Props) => {
  const { t } = useTranslation();
  const resetLoginState = useResetRecoilState(loginState);
  const [state, setState] = useRecoilState(loginState);
  const { setCurrentAccount } = useRecoilValue(currentAccountState);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextRaw = searchParams.get('next');
  const nextTarget =
    nextRaw && nextRaw.startsWith('/') && !nextRaw.startsWith('//')
      ? nextRaw
      : '/dashboard';

  const validate = (field: string): void => {
    const { email, password } = state;
    const formData = { email, password };
    setState((prev) => ({
      ...prev,
      [`${field}Error`]: validation.validate(field, formData),
    }));
    setState((prev) => ({
      ...prev,
      isFormInvalid: !!prev.emailError || !!prev.passwordError,
    }));
  };

  useEffect(() => resetLoginState(), []);
  useEffect(() => validate('email'), [state.email]);
  useEffect(() => validate('password'), [state.password]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    if (state.isLoading || state.isFormInvalid) return;
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const account = await authentication.auth({
        email: state.email,
        password: state.password,
      });
      setCurrentAccount(account);
      setShowSuccessModal(true);
    } catch (error: any) {
      setState((prev) => ({ ...prev, isLoading: false }));
      setErrorMessage(error?.message ?? t('auth.signInFailedDefault'));
      setShowErrorModal(true);
    }
  };

  const handleSuccessClose = (): void => {
    setShowSuccessModal(false);
    navigate(nextTarget);
  };

  return (
    <div className={Styles.loginPage}>
      <Helmet>
        <title>HypePass — {t('auth.welcomeBack')}</title>
        <meta name="description" content={t('auth.welcomeBackSubtitle')} />
      </Helmet>

      <div className={Styles.formSide}>
        <div className={Styles.formContainer}>
          <Link to="/" className={Styles.backLink}>
            {t('auth.backHome')}
          </Link>

          <h2 className={Styles.formTitle}>{t('auth.welcomeBack')}</h2>
          <p className={Styles.formSubtitle}>
            {t('auth.welcomeBackSubtitle')}
          </p>

          <form
            data-testid="form"
            className={Styles.form}
            onSubmit={handleSubmit}
          >
            <Input
              type="email"
              name="email"
              label={t('auth.email')}
              placeholder={t('auth.emailPlaceholder')}
            />
            <Input
              type="password"
              name="password"
              label={t('auth.password')}
              placeholder={t('auth.passwordPlaceholder')}
            />
            <SubmitButton text={t('auth.signIn')} />
            <FormStatus />
          </form>

          <div className={Styles.divider}>
            <span>{t('common.or')}</span>
          </div>

          <p className={Styles.signupText}>
            {t('auth.noAccount')}
            <Link
              data-testid="signup-link"
              to="/signup"
              className={Styles.signupLink}
            >
              {t('auth.signUpLink')}
            </Link>
          </p>
        </div>
      </div>

      <FeedbackModal
        open={showSuccessModal}
        onClose={handleSuccessClose}
        variant="success"
        title={t('auth.welcomeTitle')}
        body={t('auth.welcomeBody')}
        autoCloseMs={1000}
      />
      <FeedbackModal
        open={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        variant="error"
        title={t('auth.signInFailed')}
        body={errorMessage}
        buttonText={t('common.close')}
      />
    </div>
  );
};

export default Login;
