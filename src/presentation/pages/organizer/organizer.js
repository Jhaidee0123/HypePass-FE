import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Styles from './organizer-styles.scss';
import { PulseButton } from "../../components";
import { CreateCompanyForm } from './components/create-company-form';
const STATUS_BADGE = {
    draft: { label: 'DRAFT', className: 'draft' },
    pending_review: { label: 'EN REVISIÓN', className: 'pending' },
    approved: { label: 'APROBADO', className: 'approved' },
    rejected: { label: 'RECHAZADO', className: 'rejected' },
    published: { label: 'PUBLICADO', className: 'published' },
    unpublished: { label: 'DESPUBLICADO', className: 'draft' },
    cancelled: { label: 'CANCELADO', className: 'rejected' },
    ended: { label: 'TERMINADO', className: 'draft' },
};
const COMPANY_STATUS = {
    pending: { label: 'EN REVISIÓN', className: 'pending' },
    active: { label: 'ACTIVA', className: 'approved' },
    rejected: { label: 'RECHAZADA', className: 'rejected' },
    suspended: { label: 'SUSPENDIDA', className: 'rejected' },
};
const Organizer = ({ companies, events }) => {
    var _a;
    const { t } = useTranslation();
    const [myCompanies, setMyCompanies] = useState(null);
    const [selectedCompanyId, setSelectedCompanyId] = useState(null);
    const [eventList, setEventList] = useState([]);
    const [isCreatingCompany, setCreatingCompany] = useState(false);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        companies
            .listMine()
            .then((list) => {
            var _a, _b, _c;
            setMyCompanies(list);
            const firstActive = list.find((c) => c.company.status === 'active');
            setSelectedCompanyId((_c = (_a = firstActive === null || firstActive === void 0 ? void 0 : firstActive.company.id) !== null && _a !== void 0 ? _a : (_b = list[0]) === null || _b === void 0 ? void 0 : _b.company.id) !== null && _c !== void 0 ? _c : null);
        })
            .catch((err) => { var _a; return setError((_a = err === null || err === void 0 ? void 0 : err.message) !== null && _a !== void 0 ? _a : 'Error'); });
    }, [companies]);
    const selectedCompany = useMemo(() => {
        var _a, _b;
        if (!selectedCompanyId || !myCompanies)
            return null;
        return ((_b = (_a = myCompanies.find((c) => c.company.id === selectedCompanyId)) === null || _a === void 0 ? void 0 : _a.company) !== null && _b !== void 0 ? _b : null);
    }, [selectedCompanyId, myCompanies]);
    useEffect(() => {
        if (!selectedCompany || selectedCompany.status !== 'active') {
            setEventList([]);
            return;
        }
        setLoadingEvents(true);
        events
            .list(selectedCompany.id)
            .then((list) => setEventList(list))
            .catch((err) => { var _a; return setError((_a = err === null || err === void 0 ? void 0 : err.message) !== null && _a !== void 0 ? _a : 'Error'); })
            .finally(() => setLoadingEvents(false));
    }, [selectedCompany, events]);
    const handleCompanyCreated = (created) => {
        setMyCompanies((prev) => [
            { company: created, role: 'owner' },
            ...(prev !== null && prev !== void 0 ? prev : []),
        ]);
        setSelectedCompanyId(created.id);
        setCreatingCompany(false);
    };
    return (React.createElement("div", { className: Styles.page },
        React.createElement(Helmet, null,
            React.createElement("title", null,
                "HypePass \u2014 ",
                t('organizer.title'))),
        React.createElement("header", { className: Styles.header },
            React.createElement("div", null,
                React.createElement("div", { className: Styles.eyebrow },
                    "\u25C6 ",
                    t('nav.organizer').toUpperCase()),
                React.createElement("h1", { className: Styles.title }, t('organizer.title'))),
            React.createElement(PulseButton, { variant: "primary", onClick: () => setCreatingCompany(true) },
                "+ ",
                t('organizer.newCompany'))),
        error && React.createElement("div", { className: Styles.error }, error),
        isCreatingCompany && (React.createElement("div", { className: Styles.card },
            React.createElement(CreateCompanyForm, { companies: companies, onCreated: handleCompanyCreated, onCancel: () => setCreatingCompany(false) }))),
        myCompanies === null && (React.createElement("div", { className: Styles.card }, t('common.loading'))),
        myCompanies && myCompanies.length === 0 && !isCreatingCompany && (React.createElement("div", { className: Styles.emptyCard },
            React.createElement("h3", { className: Styles.emptyTitle }, t('organizer.empty.title')),
            React.createElement("p", { className: Styles.emptyBody }, t('organizer.empty.body')),
            React.createElement(PulseButton, { variant: "primary", onClick: () => setCreatingCompany(true) }, t('organizer.empty.cta')))),
        myCompanies && myCompanies.length > 0 && (React.createElement("section", { className: Styles.companies },
            React.createElement("div", { className: Styles.companyList }, myCompanies.map(({ company, role }) => {
                const badge = COMPANY_STATUS[company.status];
                return (React.createElement("button", { key: company.id, type: "button", className: `${Styles.companyItem} ${selectedCompanyId === company.id ? Styles.companyItemActive : ''}`, onClick: () => setSelectedCompanyId(company.id) },
                    React.createElement("div", null,
                        React.createElement("div", { className: Styles.companyName }, company.name),
                        React.createElement("div", { className: Styles.companyMeta },
                            "@",
                            company.slug,
                            " \u00B7 ",
                            role.toUpperCase())),
                    React.createElement("span", { className: `${Styles.badge} ${Styles[badge.className]}` }, badge.label)));
            })),
            React.createElement("div", { className: Styles.companyDetail }, selectedCompany && (React.createElement(React.Fragment, null,
                selectedCompany.status === 'pending' && (React.createElement("div", { className: Styles.notice },
                    React.createElement("strong", null, t('organizer.pending.title')),
                    React.createElement("p", null, t('organizer.pending.body')))),
                selectedCompany.status === 'rejected' && (React.createElement("div", { className: `${Styles.notice} ${Styles.noticeDanger}` },
                    React.createElement("strong", null, t('organizer.rejected.title')),
                    React.createElement("p", null, (_a = selectedCompany.reviewNotes) !== null && _a !== void 0 ? _a : t('organizer.rejected.body')))),
                selectedCompany.status === 'active' && (React.createElement(React.Fragment, null,
                    React.createElement("div", { className: Styles.sectionHeader },
                        React.createElement("h2", { className: Styles.sectionTitle }, t('organizer.events.title')),
                        React.createElement(Link, { to: `/organizer/companies/${selectedCompany.id}/events/new` },
                            React.createElement(PulseButton, { variant: "primary" },
                                "+ ",
                                t('organizer.events.new')))),
                    loadingEvents && (React.createElement("div", { className: Styles.card }, t('common.loading'))),
                    !loadingEvents && eventList.length === 0 && (React.createElement("div", { className: Styles.emptyCard },
                        React.createElement("h3", { className: Styles.emptyTitle }, t('organizer.events.empty.title')),
                        React.createElement("p", { className: Styles.emptyBody }, t('organizer.events.empty.body')))),
                    !loadingEvents && eventList.length > 0 && (React.createElement("div", { className: Styles.eventGrid }, eventList.map((ev) => {
                        var _a;
                        const badge = (_a = STATUS_BADGE[ev.status]) !== null && _a !== void 0 ? _a : STATUS_BADGE.draft;
                        return (React.createElement(Link, { key: ev.id, to: `/organizer/companies/${selectedCompany.id}/events/${ev.id}`, className: Styles.eventCard },
                            React.createElement("div", { className: Styles.eventCardTop },
                                ev.coverImageUrl ? (React.createElement("img", { src: ev.coverImageUrl, alt: ev.title, className: Styles.eventCover })) : (React.createElement("div", { className: Styles.eventCoverEmpty }, "NO COVER")),
                                React.createElement("span", { className: `${Styles.badge} ${Styles[badge.className]}` }, badge.label)),
                            React.createElement("div", { className: Styles.eventCardBottom },
                                React.createElement("div", { className: Styles.eventTitle }, ev.title),
                                React.createElement("div", { className: Styles.eventSlug },
                                    "/",
                                    ev.slug))));
                    }))))))))))));
};
export default Organizer;
