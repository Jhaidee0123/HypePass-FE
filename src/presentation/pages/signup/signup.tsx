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
import Styles from './signup-styles.scss';
import { signUpState, Input, SubmitButton, FormStatus } from './components';
import { FeedbackModal, currentAccountState } from '@/presentation/components';
import { Validation } from '@/presentation/protocols/validation';
import { Authentication } from '@/domain/usecases';
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';

type Props = {
  validation: Validation;
  authentication: Authentication;
};

const SignUp: React.FC<Props> = ({ validation, authentication }: Props) => {
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
    setState(prev => ({
      ...prev,
      [`${field}Error`]: validation.validate(field, formData)
    }));
    setState(prev => ({
      ...prev,
      isFormInvalid: !!prev.nameError || !!prev.emailError || !!prev.passwordError || !!prev.passwordConfirmationError
    }));
  };

  useEffect(() => resetSignUpState(), []);
  useEffect(() => validate('name'), [state.name]);
  useEffect(() => validate('email'), [state.email]);
  useEffect(() => validate('password'), [state.password]);
  useEffect(() => validate('passwordConfirmation'), [state.passwordConfirmation]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (state.isLoading || state.isFormInvalid) return;
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const account = await authentication.signUp({
        name: state.name,
        email: state.email,
        password: state.password,
      });
      setCurrentAccount(account);
      setShowSuccessModal(true);
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      setErrorMessage(error.message || 'Signup failed. Please try again.');
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
        <title>Sign Up | App</title>
        <meta name="description" content="Create a new account." />
      </Helmet>

      <div className={Styles.formSide}>
        <div className={Styles.formContainer}>
          <Link to="/" className={Styles.backLink}>
            &larr; Back to home
          </Link>

          <h2 className={Styles.formTitle}>CREATE ACCOUNT</h2>
          <p className={Styles.formSubtitle}>Fill in the details to get started</p>

          <form data-testid="form" className={Styles.form} onSubmit={handleSubmit}>
            <Input type="text" name="name" label="Full Name" placeholder="John Doe" />
            <Input type="email" name="email" label="Email" placeholder="your@email.com" />
            <Input type="password" name="password" label="Password" placeholder="Min. 8 characters" />
            <Input type="password" name="passwordConfirmation" label="Confirm Password" placeholder="Re-enter your password" />
            <SubmitButton text="CREATE ACCOUNT" />
            <FormStatus />
          </form>

          <div className={Styles.divider}>
            <span>or</span>
          </div>

          <p className={Styles.loginText}>
            Already have an account?{' '}
            <Link data-testid="login-link" to="/login" className={Styles.loginLink}>
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <FeedbackModal
        open={showSuccessModal}
        onClose={handleSuccessClose}
        variant="success"
        title="Account created!"
        body="Your account has been created. Redirecting..."
        autoCloseMs={1500}
      />
      <FeedbackModal
        open={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        variant="error"
        title="Signup failed"
        body={errorMessage}
      />
    </div>
  );
};

export default SignUp;
