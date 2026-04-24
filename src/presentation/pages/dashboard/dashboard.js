/**
 * Dashboard Page (Protected)
 *
 * Example page only accessible to authenticated users. Will evolve into
 * the user/organizer/admin landing inside the shell (Iteration 3+).
 */
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import Styles from './dashboard-styles.scss';
import { currentAccountState } from "../../components";
import { useRecoilValue } from 'recoil';
const Dashboard = () => {
    var _a, _b;
    const { t } = useTranslation();
    const { getCurrentAccount } = useRecoilValue(currentAccountState);
    const account = getCurrentAccount();
    const name = (_b = (_a = account === null || account === void 0 ? void 0 : account.user) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : '';
    return (React.createElement("div", { className: Styles.dashboardPage },
        React.createElement(Helmet, null,
            React.createElement("title", null,
                "HypePass \u2014 ",
                t('dashboard.title'))),
        React.createElement("div", { className: Styles.inner },
            React.createElement("div", { className: Styles.eyebrow }, t('dashboard.title')),
            React.createElement("h1", { className: Styles.title }, t('dashboard.welcome', { name })),
            React.createElement("p", { className: Styles.subtitle }, t('dashboard.gettingStartedBody')),
            React.createElement("div", { className: Styles.card },
                React.createElement("h3", { className: Styles.cardTitle }, t('dashboard.gettingStartedTitle')),
                React.createElement("p", { className: Styles.cardText }, t('dashboard.gettingStartedBody'))))));
};
export default Dashboard;
