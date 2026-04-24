/**
 * Signup Page
 *
 * Clean signup form: name, email, password, confirm password.
 * Same dependency injection pattern as Login.
 */
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Trans } from 'react-i18next';
import Styles from './signup-styles.scss';
import { signUpState, Input, SubmitButton, FormStatus } from './components';
import { FeedbackModal, currentAccountState } from '@/presentation/components';
import { Validation } from '@/presentation/protocols/validation';
import { Authentication, Consents } from '@/domain/usecases';
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';
import {
  CURRENT_TERMS_VERSION,
  CURRENT_PRIVACY_VERSION,
} from '@/presentation/pages/legal/legal-versions';

type Props = {
  validation: Validation;
  authentication: Authentication;
  consents: Consents;
};

const SignUp: React.FC<Props> = ({
  validation,
  authentication,
  consents,
}: Props) => {
  const { t } = useTranslation();
  const resetSignUpState = useResetRecoilState(signUpState);
  const [state, setState] = useRecoilState(signUpState);
  const { setCurrentAccount } = useRecoilValue(currentAccountState);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const validate = (field: string): void => {
    const { name, email, password, passwordConfirmation } = state;
    const formData = { name, email, password, passwordConfirmation };
    setState((prev) => ({
      ...prev,
      [`${field}Error`]: validation.validate(field, formData),
    }));
    setState((prev) => ({
      ...prev,
      isFormInvalid:
        !!prev.nameError ||
        !!prev.emailError ||
        !!prev.passwordError ||
        !!prev.passwordConfirmationError ||
        !prev.acceptedConsent,
    }));
  };

  useEffect(() => resetSignUpState(), []);
  useEffect(() => validate('name'), [state.name]);
  useEffect(() => validate('email'), [state.email]);
  useEffect(() => validate('password'), [state.password]);
  useEffect(
    () => validate('passwordConfirmation'),
    [state.passwordConfirmation],
  );
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      isFormInvalid:
        !!prev.nameError ||
        !!prev.emailError ||
        !!prev.passwordError ||
        !!prev.passwordConfirmationError ||
        !prev.acceptedConsent,
    }));
  }, [state.acceptedConsent]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    if (state.isLoading || state.isFormInvalid) return;
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const account = await authentication.signUp({
        name: state.name,
        email: state.email,
        password: state.password,
      });
      setCurrentAccount(account);
      consents
        .record({
          termsVersion: CURRENT_TERMS_VERSION,
          privacyVersion: CURRENT_PRIVACY_VERSION,
        })
        .catch(() => undefined);
      setShowSuccessModal(true);
    } catch (error: any) {
      setState((prev) => ({ ...prev, isLoading: false }));
      setErrorMessage(error?.message ?? t('auth.signUpFailedDefault'));
      setShowErrorModal(true);
    }
  };

  const handleSuccessClose = (): void => {
    setShowSuccessModal(false);
    navigate('/dashboard');
  };

  return (
    <div className={Styles.signupPage}>
      <Helmet>
        <title>HypePass — {t('auth.createAccount')}</title>
        <meta name="description" content={t('auth.createAccountSubtitle')} />
      </Helmet>

      <div className={Styles.formSide}>
        <div className={Styles.formContainer}>
          <Link to="/" className={Styles.backLink}>
            {t('auth.backHome')}
          </Link>

          <h2 className={Styles.formTitle}>{t('auth.createAccount')}</h2>
          <p className={Styles.formSubtitle}>
            {t('auth.createAccountSubtitle')}
          </p>

          <form
            data-testid="form"
            className={Styles.form}
            onSubmit={handleSubmit}
          >
            <Input
              type="text"
              name="name"
              label={t('auth.fullName')}
              placeholder={t('auth.fullNamePlaceholder')}
            />
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
              placeholder={t('auth.passwordMinPlaceholder')}
            />
            <Input
              type="password"
              name="passwordConfirmation"
              label={t('auth.confirmPassword')}
              placeholder={t('auth.confirmPasswordPlaceholder')}
            />

            <label className={Styles.consent}>
              <input
                type="checkbox"
                checked={state.acceptedConsent}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    acceptedConsent: e.target.checked,
                  }))
                }
              />
              <span>
                <Trans
                  i18nKey="auth.consentLabel"
                  components={{
                    terms: (
                      <Link
                        to="/legal/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    ),
                    privacy: (
                      <Link
                        to="/legal/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    ),
                  }}
                />
              </span>
            </label>

            <SubmitButton text={t('auth.signUp')} />
            <FormStatus />
          </form>

          <div className={Styles.divider}>
            <span>{t('common.or')}</span>
          </div>

          <p className={Styles.loginText}>
            {t('auth.haveAccount')}
            <Link
              data-testid="login-link"
              to="/login"
              className={Styles.loginLink}
            >
              {t('auth.signInLink')}
            </Link>
          </p>
        </div>
      </div>

      <FeedbackModal
        open={showSuccessModal}
        onClose={handleSuccessClose}
        variant="success"
        title={t('auth.accountCreatedTitle')}
        body={t('auth.accountCreatedBody')}
        autoCloseMs={1500}
      />
      <FeedbackModal
        open={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        variant="error"
        title={t('auth.signUpFailed')}
        body={errorMessage}
        buttonText={t('common.close')}
      />
    </div>
  );
};

export default SignUp;
