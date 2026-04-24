/**
 * Application Router
 *
 * - <HelmetProvider> for SEO <head /> control.
 * - <RecoilRoot> seeded with the current account adapters.
 * - <BrowserRouter> + <Routes>.
 *
 * Routes split into two groups:
 *   - Shell routes (wrapped in <Layout>): home, dashboard, organizer, admin, etc.
 *   - Fullscreen routes (no shell): login, signup.
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { RecoilRoot } from 'recoil';
import { useTranslation } from 'react-i18next';
import { HomeFactory, LoginFactory, SignUpFactory, DashboardFactory, OrganizerFactory, EventCreateFactory, EventEditorFactory, AdminFactory, EventReviewFactory, EventDetailFactory, } from "../factories/pages";
import { getCurrentAccountAdapter, setCurrentAccountAdapter, } from "../adapters/current-account-adapter";
import { PrivateRoute, AdminRoute } from "../proxies";
import { currentAccountState, Layout } from "../../presentation/components";
const ShellOutlet = () => (React.createElement(Layout, null,
    React.createElement(Outlet, null)));
const Placeholder = ({ titleKey }) => {
    const { t } = useTranslation();
    return (React.createElement("div", { style: { padding: '72px 48px', color: '#ece8e0' } },
        React.createElement("div", { style: {
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                letterSpacing: '0.14em',
                color: '#6b6760',
                marginBottom: 8,
            } }, "\u25C6 HYPEPASS"),
        React.createElement("h1", { style: {
                fontFamily: 'Bebas Neue, Impact, sans-serif',
                fontSize: 64,
                lineHeight: 0.92,
                letterSpacing: '0.02em',
            } }, t(titleKey)),
        React.createElement("p", { style: { color: '#908b83', marginTop: 12 } }, t('common.loading'))));
};
const Router = () => {
    const state = {
        setCurrentAccount: setCurrentAccountAdapter,
        getCurrentAccount: getCurrentAccountAdapter,
    };
    return (React.createElement(HelmetProvider, null,
        React.createElement(RecoilRoot, { initializeState: ({ set }) => set(currentAccountState, state) },
            React.createElement(BrowserRouter, null,
                React.createElement(Routes, null,
                    React.createElement(Route, { path: "/login", element: React.createElement(LoginFactory, null) }),
                    React.createElement(Route, { path: "/signup", element: React.createElement(SignUpFactory, null) }),
                    React.createElement(Route, { element: React.createElement(ShellOutlet, null) },
                        React.createElement(Route, { path: "/", element: React.createElement(HomeFactory, null) }),
                        React.createElement(Route, { path: "/events/:slug", element: React.createElement(EventDetailFactory, null) }),
                        React.createElement(Route, { path: "/marketplace", element: React.createElement(Placeholder, { titleKey: "nav.marketplace" }) }),
                        React.createElement(Route, { path: "/wallet", element: React.createElement(PrivateRoute, null,
                                React.createElement(Placeholder, { titleKey: "nav.wallet" })) }),
                        React.createElement(Route, { path: "/organizer", element: React.createElement(PrivateRoute, null,
                                React.createElement(OrganizerFactory, null)) }),
                        React.createElement(Route, { path: "/organizer/companies/:companyId/events/new", element: React.createElement(PrivateRoute, null,
                                React.createElement(EventCreateFactory, null)) }),
                        React.createElement(Route, { path: "/organizer/companies/:companyId/events/:eventId", element: React.createElement(PrivateRoute, null,
                                React.createElement(EventEditorFactory, null)) }),
                        React.createElement(Route, { path: "/dashboard", element: React.createElement(PrivateRoute, null,
                                React.createElement(DashboardFactory, null)) }),
                        React.createElement(Route, { path: "/admin", element: React.createElement(AdminRoute, null,
                                React.createElement(AdminFactory, null)) }),
                        React.createElement(Route, { path: "/admin/events/:eventId", element: React.createElement(AdminRoute, null,
                                React.createElement(EventReviewFactory, null)) })),
                    React.createElement(Route, { path: "*", element: React.createElement(Navigate, { to: "/", replace: true }) }))))));
};
export default Router;
