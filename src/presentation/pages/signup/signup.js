var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
import Styles from './signup-styles.scss';
import { signUpState, Input, SubmitButton, FormStatus } from './components';
import { FeedbackModal, currentAccountState } from "../../components";
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';
const SignUp = ({ validation, authentication }) => {
    const { t } = useTranslation();
    const resetSignUpState = useResetRecoilState(signUpState);
    const [state, setState] = useRecoilState(signUpState);
    const { setCurrentAccount } = useRecoilValue(currentAccountState);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const validate = (field) => {
        const { name, email, password, passwordConfirmation } = state;
        const formData = { name, email, password, passwordConfirmation };
        setState((prev) => (Object.assign(Object.assign({}, prev), { [`${field}Error`]: validation.validate(field, formData) })));
        setState((prev) => (Object.assign(Object.assign({}, prev), { isFormInvalid: !!prev.nameError ||
                !!prev.emailError ||
                !!prev.passwordError ||
                !!prev.passwordConfirmationError })));
    };
    useEffect(() => resetSignUpState(), []);
    useEffect(() => validate('name'), [state.name]);
    useEffect(() => validate('email'), [state.email]);
    useEffect(() => validate('password'), [state.password]);
    useEffect(() => validate('passwordConfirmation'), [state.passwordConfirmation]);
    const handleSubmit = (event) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        event.preventDefault();
        if (state.isLoading || state.isFormInvalid)
            return;
        setState((prev) => (Object.assign(Object.assign({}, prev), { isLoading: true })));
        try {
            const account = yield authentication.signUp({
                name: state.name,
                email: state.email,
                password: state.password,
            });
            setCurrentAccount(account);
            setShowSuccessModal(true);
        }
        catch (error) {
            setState((prev) => (Object.assign(Object.assign({}, prev), { isLoading: false })));
            setErrorMessage((_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : t('auth.signUpFailedDefault'));
            setShowErrorModal(true);
        }
    });
    const handleSuccessClose = () => {
        setShowSuccessModal(false);
        navigate('/dashboard');
    };
    return (React.createElement("div", { className: Styles.signupPage },
        React.createElement(Helmet, null,
            React.createElement("title", null,
                "HypePass \u2014 ",
                t('auth.createAccount')),
            React.createElement("meta", { name: "description", content: t('auth.createAccountSubtitle') })),
        React.createElement("div", { className: Styles.formSide },
            React.createElement("div", { className: Styles.formContainer },
                React.createElement(Link, { to: "/", className: Styles.backLink }, t('auth.backHome')),
                React.createElement("h2", { className: Styles.formTitle }, t('auth.createAccount')),
                React.createElement("p", { className: Styles.formSubtitle }, t('auth.createAccountSubtitle')),
                React.createElement("form", { "data-testid": "form", className: Styles.form, onSubmit: handleSubmit },
                    React.createElement(Input, { type: "text", name: "name", label: t('auth.fullName'), placeholder: t('auth.fullNamePlaceholder') }),
                    React.createElement(Input, { type: "email", name: "email", label: t('auth.email'), placeholder: t('auth.emailPlaceholder') }),
                    React.createElement(Input, { type: "password", name: "password", label: t('auth.password'), placeholder: t('auth.passwordMinPlaceholder') }),
                    React.createElement(Input, { type: "password", name: "passwordConfirmation", label: t('auth.confirmPassword'), placeholder: t('auth.confirmPasswordPlaceholder') }),
                    React.createElement(SubmitButton, { text: t('auth.signUp') }),
                    React.createElement(FormStatus, null)),
                React.createElement("div", { className: Styles.divider },
                    React.createElement("span", null, t('common.or'))),
                React.createElement("p", { className: Styles.loginText },
                    t('auth.haveAccount'),
                    React.createElement(Link, { "data-testid": "login-link", to: "/login", className: Styles.loginLink }, t('auth.signInLink'))))),
        React.createElement(FeedbackModal, { open: showSuccessModal, onClose: handleSuccessClose, variant: "success", title: t('auth.accountCreatedTitle'), body: t('auth.accountCreatedBody'), autoCloseMs: 1500 }),
        React.createElement(FeedbackModal, { open: showErrorModal, onClose: () => setShowErrorModal(false), variant: "error", title: t('auth.signUpFailed'), body: errorMessage })));
};
export default SignUp;
