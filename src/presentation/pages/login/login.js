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
import { useTranslation } from 'react-i18next';
import Styles from './login-styles.scss';
import { loginState, Input, SubmitButton, FormStatus } from './components';
import { FeedbackModal, currentAccountState } from "../../components";
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';
const Login = ({ validation, authentication }) => {
    const { t } = useTranslation();
    const resetLoginState = useResetRecoilState(loginState);
    const [state, setState] = useRecoilState(loginState);
    const { setCurrentAccount } = useRecoilValue(currentAccountState);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const validate = (field) => {
        const { email, password } = state;
        const formData = { email, password };
        setState((prev) => (Object.assign(Object.assign({}, prev), { [`${field}Error`]: validation.validate(field, formData) })));
        setState((prev) => (Object.assign(Object.assign({}, prev), { isFormInvalid: !!prev.emailError || !!prev.passwordError })));
    };
    useEffect(() => resetLoginState(), []);
    useEffect(() => validate('email'), [state.email]);
    useEffect(() => validate('password'), [state.password]);
    const handleSubmit = (event) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        event.preventDefault();
        if (state.isLoading || state.isFormInvalid)
            return;
        setState((prev) => (Object.assign(Object.assign({}, prev), { isLoading: true })));
        try {
            const account = yield authentication.auth({
                email: state.email,
                password: state.password,
            });
            setCurrentAccount(account);
            setShowSuccessModal(true);
        }
        catch (error) {
            setState((prev) => (Object.assign(Object.assign({}, prev), { isLoading: false })));
            setErrorMessage((_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : t('auth.signInFailedDefault'));
            setShowErrorModal(true);
        }
    });
    const handleSuccessClose = () => {
        setShowSuccessModal(false);
        navigate('/dashboard');
    };
    return (React.createElement("div", { className: Styles.loginPage },
        React.createElement(Helmet, null,
            React.createElement("title", null,
                "HypePass \u2014 ",
                t('auth.welcomeBack')),
            React.createElement("meta", { name: "description", content: t('auth.welcomeBackSubtitle') })),
        React.createElement("div", { className: Styles.formSide },
            React.createElement("div", { className: Styles.formContainer },
                React.createElement(Link, { to: "/", className: Styles.backLink }, t('auth.backHome')),
                React.createElement("h2", { className: Styles.formTitle }, t('auth.welcomeBack')),
                React.createElement("p", { className: Styles.formSubtitle }, t('auth.welcomeBackSubtitle')),
                React.createElement("form", { "data-testid": "form", className: Styles.form, onSubmit: handleSubmit },
                    React.createElement(Input, { type: "email", name: "email", label: t('auth.email'), placeholder: t('auth.emailPlaceholder') }),
                    React.createElement(Input, { type: "password", name: "password", label: t('auth.password'), placeholder: t('auth.passwordPlaceholder') }),
                    React.createElement(SubmitButton, { text: t('auth.signIn') }),
                    React.createElement(FormStatus, null)),
                React.createElement("div", { className: Styles.divider },
                    React.createElement("span", null, t('common.or'))),
                React.createElement("p", { className: Styles.signupText },
                    t('auth.noAccount'),
                    React.createElement(Link, { "data-testid": "signup-link", to: "/signup", className: Styles.signupLink }, t('auth.signUpLink'))))),
        React.createElement(FeedbackModal, { open: showSuccessModal, onClose: handleSuccessClose, variant: "success", title: t('auth.welcomeTitle'), body: t('auth.welcomeBody'), autoCloseMs: 1000 }),
        React.createElement(FeedbackModal, { open: showErrorModal, onClose: () => setShowErrorModal(false), variant: "error", title: t('auth.signInFailed'), body: errorMessage })));
};
export default Login;
