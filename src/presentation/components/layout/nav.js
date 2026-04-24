import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import Styles from './nav-styles.scss';
import Logo from '../logo/logo';
import LanguageSwitcher from '../language-switcher/language-switcher';
import { currentAccountState } from '../atoms/atoms';
import { useLogout } from "../../hooks";
const Nav = () => {
    var _a, _b, _c, _d, _e;
    const { t } = useTranslation();
    const { getCurrentAccount } = useRecoilValue(currentAccountState);
    const account = getCurrentAccount();
    const isAuth = !!(account === null || account === void 0 ? void 0 : account.session);
    const role = (_a = account === null || account === void 0 ? void 0 : account.user) === null || _a === void 0 ? void 0 : _a.role;
    const logout = useLogout();
    const navigate = useNavigate();
    return (React.createElement("nav", { className: Styles.nav },
        React.createElement("div", { className: Styles.left },
            React.createElement(Link, { to: "/", className: Styles.brand, "aria-label": "HypePass" },
                React.createElement(Logo, null)),
            React.createElement("div", { className: Styles.links },
                React.createElement(NavLink, { to: "/", end: true, className: ({ isActive }) => `${Styles.link} ${isActive ? Styles.linkActive : ''}` }, t('nav.discover')),
                React.createElement(NavLink, { to: "/marketplace", className: ({ isActive }) => `${Styles.link} ${isActive ? Styles.linkActive : ''}` }, t('nav.marketplace')),
                isAuth && (React.createElement(NavLink, { to: "/wallet", className: ({ isActive }) => `${Styles.link} ${isActive ? Styles.linkActive : ''}` }, t('nav.wallet'))),
                isAuth && (React.createElement(NavLink, { to: "/organizer", className: ({ isActive }) => `${Styles.link} ${isActive ? Styles.linkActive : ''}` }, t('nav.organizer'))),
                role === 'platform_admin' && (React.createElement(NavLink, { to: "/admin", className: ({ isActive }) => `${Styles.link} ${isActive ? Styles.linkActive : ''}` }, t('nav.admin'))))),
        React.createElement("div", { className: Styles.right },
            React.createElement(LanguageSwitcher, null),
            isAuth ? (React.createElement("div", { className: Styles.userCluster },
                React.createElement("div", { className: Styles.avatar, "aria-hidden": true, title: (_c = (_b = account === null || account === void 0 ? void 0 : account.user) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : '' }, ((_e = (_d = account === null || account === void 0 ? void 0 : account.user) === null || _d === void 0 ? void 0 : _d.name) !== null && _e !== void 0 ? _e : 'U').slice(0, 2).toUpperCase()),
                React.createElement("button", { type: "button", className: Styles.logout, onClick: () => logout() }, t('nav.logout')))) : (React.createElement("div", { className: Styles.authCluster },
                React.createElement("button", { type: "button", className: Styles.ghostBtn, onClick: () => navigate('/login') }, t('nav.login')),
                React.createElement("button", { type: "button", className: Styles.primaryBtn, onClick: () => navigate('/signup') }, t('nav.signup')))))));
};
export default Nav;
