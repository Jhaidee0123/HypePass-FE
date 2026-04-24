var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Styles from './admin-styles.scss';
import { PulseButton } from "../../components";
const Admin = ({ review }) => {
    const { t } = useTranslation();
    const [tab, setTab] = useState('events');
    const [events, setEvents] = useState(null);
    const [companies, setCompanies] = useState(null);
    const [error, setError] = useState(null);
    const [busyId, setBusyId] = useState(null);
    const loadEvents = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        setError(null);
        try {
            const list = yield review.listEvents('pending_review');
            setEvents(list);
        }
        catch (err) {
            setError((_d = (_c = (_b = (_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) !== null && _c !== void 0 ? _c : err === null || err === void 0 ? void 0 : err.message) !== null && _d !== void 0 ? _d : t('errors.unexpected'));
        }
    });
    const loadCompanies = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        setError(null);
        try {
            const list = yield review.listCompanies('pending');
            setCompanies(list);
        }
        catch (err) {
            setError((_d = (_c = (_b = (_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) !== null && _c !== void 0 ? _c : err === null || err === void 0 ? void 0 : err.message) !== null && _d !== void 0 ? _d : t('errors.unexpected'));
        }
    });
    useEffect(() => {
        void loadEvents();
        void loadCompanies();
    }, []);
    const handleApproveCompany = (id) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        setBusyId(id);
        try {
            yield review.approveCompany(id);
            yield loadCompanies();
        }
        catch (err) {
            alert((_d = (_c = (_b = (_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) !== null && _c !== void 0 ? _c : err === null || err === void 0 ? void 0 : err.message) !== null && _d !== void 0 ? _d : t('errors.unexpected'));
        }
        finally {
            setBusyId(null);
        }
    });
    const handleRejectCompany = (id) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const notes = window.prompt(t('admin.companies.rejectPrompt'));
        if (notes === null)
            return;
        setBusyId(id);
        try {
            yield review.rejectCompany(id, notes);
            yield loadCompanies();
        }
        catch (err) {
            alert((_d = (_c = (_b = (_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) !== null && _c !== void 0 ? _c : err === null || err === void 0 ? void 0 : err.message) !== null && _d !== void 0 ? _d : t('errors.unexpected'));
        }
        finally {
            setBusyId(null);
        }
    });
    const counts = useMemo(() => {
        var _a, _b;
        return ({
            events: (_a = events === null || events === void 0 ? void 0 : events.length) !== null && _a !== void 0 ? _a : 0,
            companies: (_b = companies === null || companies === void 0 ? void 0 : companies.length) !== null && _b !== void 0 ? _b : 0,
        });
    }, [events, companies]);
    return (React.createElement("div", { className: Styles.page },
        React.createElement(Helmet, null,
            React.createElement("title", null,
                "HypePass \u2014 ",
                t('admin.title'))),
        React.createElement("header", { className: Styles.header },
            React.createElement("div", { className: Styles.eyebrow }, "\u25C6 ADMIN"),
            React.createElement("h1", { className: Styles.title }, t('admin.title'))),
        React.createElement("div", { className: Styles.tabs },
            React.createElement("button", { type: "button", className: `${Styles.tab} ${tab === 'events' ? Styles.tabActive : ''}`, onClick: () => setTab('events') },
                t('admin.tabs.events'),
                " \u00B7 ",
                counts.events),
            React.createElement("button", { type: "button", className: `${Styles.tab} ${tab === 'companies' ? Styles.tabActive : ''}`, onClick: () => setTab('companies') },
                t('admin.tabs.companies'),
                " \u00B7 ",
                counts.companies)),
        error && React.createElement("div", { className: Styles.error }, error),
        tab === 'events' && (React.createElement("section", null, events === null ? (React.createElement("div", { className: Styles.loading }, t('common.loading'))) : events.length === 0 ? (React.createElement("div", { className: Styles.empty }, t('admin.events.empty'))) : (React.createElement("div", { className: Styles.list }, events.map((ev) => (React.createElement(Link, { key: ev.id, to: `/admin/events/${ev.id}`, className: Styles.row },
            React.createElement("div", { className: Styles.rowLeft },
                ev.coverImageUrl ? (React.createElement("img", { src: ev.coverImageUrl, alt: ev.title, className: Styles.thumb })) : (React.createElement("div", { className: Styles.thumbEmpty }, "\u2014")),
                React.createElement("div", null,
                    React.createElement("div", { className: Styles.itemTitle }, ev.title),
                    React.createElement("div", { className: Styles.itemMeta },
                        "/",
                        ev.slug,
                        " \u00B7",
                        ' ',
                        ev.publicationSubmittedAt
                            ? new Date(ev.publicationSubmittedAt).toLocaleString()
                            : ''))),
            React.createElement("span", { className: Styles.rowCta },
                t('admin.events.open').toUpperCase(),
                " \u2192")))))))),
        tab === 'companies' && (React.createElement("section", null, companies === null ? (React.createElement("div", { className: Styles.loading }, t('common.loading'))) : companies.length === 0 ? (React.createElement("div", { className: Styles.empty }, t('admin.companies.empty'))) : (React.createElement("div", { className: Styles.list }, companies.map((c) => (React.createElement("div", { key: c.id, className: Styles.row },
            React.createElement("div", { className: Styles.rowLeft },
                React.createElement("div", { className: Styles.thumbEmpty }, c.name.slice(0, 2).toUpperCase()),
                React.createElement("div", null,
                    React.createElement("div", { className: Styles.itemTitle }, c.name),
                    React.createElement("div", { className: Styles.itemMeta },
                        "@",
                        c.slug,
                        c.legalName ? ` · ${c.legalName}` : '',
                        c.contactEmail ? ` · ${c.contactEmail}` : ''))),
            React.createElement("div", { className: Styles.actions },
                React.createElement(PulseButton, { variant: "secondary", onClick: () => handleRejectCompany(c.id), disabled: busyId === c.id }, t('admin.companies.reject')),
                React.createElement(PulseButton, { variant: "primary", onClick: () => handleApproveCompany(c.id), disabled: busyId === c.id }, busyId === c.id
                    ? t('common.loading')
                    : t('admin.companies.approve'))))))))))));
};
export default Admin;
