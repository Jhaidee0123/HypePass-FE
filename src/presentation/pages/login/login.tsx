/**
 * Login Page
 *
 * Clean login form with email + password.
 * Dependencies (authentication, validation) are injected via props
 * from the factory — the page never imports concrete implementations.
 */
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router';
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
  const resetLoginState = useResetRecoilState(loginState);
  const [state, setState] = useRecoilState(loginState);
  const { setCurrentAccount } = useRecoilValue(currentAccountState);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const validate = (field: string): void => {
    const { email, password } = state;
    const formData = { email, password };
    setState(prev => ({
      ...prev,
      [`${field}Error`]: validation.validate(field, formData)
    }));
    setState(prev => ({
      ...prev,
      isFormInvalid: !!prev.emailError || !!prev.passwordError
    }));
  };

  useEffect(() => resetLoginState(), []);
  useEffect(() => validate('email'), [state.email]);
  useEffect(() => validate('password'), [state.password]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (state.isLoading || state.isFormInvalid) return;
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const account = await authentication.auth({
        email: state.email,
        password: state.password,
      });
      setCurrentAccount(account);
      setShowSuccessModal(true);
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      setErrorMessage(error.message || 'Invalid email or password.');
      setShowErrorModal(true);
    }
  };

  const handleSuccessClose = (): void => {
    setShowSuccessModal(false);
    navigate('/dashboard');
  };

  return (
    <div className={Styles.loginPage}>
      <Helmet>
        <title>Sign In | App</title>
        <meta name="description" content="Sign in to your account." />
      </Helmet>

      <div className={Styles.formSide}>
        <div className={Styles.formContainer}>
          <Link to="/" className={Styles.backLink}>
            &larr; Back to home
          </Link>

          <h2 className={Styles.formTitle}>WELCOME BACK</h2>
          <p className={Styles.formSubtitle}>Sign in to access your account</p>

          <form data-testid="form" className={Styles.form} onSubmit={handleSubmit}>
            <Input type="email" name="email" label="Email" placeholder="your@email.com" />
            <Input type="password" name="password" label="Password" placeholder="Enter your password" />
            <SubmitButton text="SIGN IN" />
            <FormStatus />
          </form>

          <div className={Styles.divider}>
            <span>or</span>
          </div>

          <p className={Styles.signupText}>
            Don't have an account?{' '}
            <Link data-testid="signup-link" to="/signup" className={Styles.signupLink}>
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <FeedbackModal
        open={showSuccessModal}
        onClose={handleSuccessClose}
        variant="success"
        title="Welcome!"
        body="You have signed in successfully. Redirecting..."
        autoCloseMs={1000}
      />
      <FeedbackModal
        open={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        variant="error"
        title="Sign in failed"
        body={errorMessage}
      />
    </div>
  );
};

export default Login;
