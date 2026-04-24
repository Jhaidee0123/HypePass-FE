import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Styles from './event-detail-styles.scss';
import { PulseButton } from "../../components";
const formatCOP = (cents, currency = 'COP') => new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
}).format(cents / 100);
const EventDetail = ({ publicEvents }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { slug } = useParams();
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [selectedSectionId, setSelectedSectionId] = useState(null);
    const [qty, setQty] = useState(2);
    useEffect(() => {
        if (!slug)
            return;
        setError(null);
        publicEvents
            .getBySlug(slug)
            .then((d) => {
            setData(d);
            if (d.sessions.length > 0) {
                setSelectedSessionId(d.sessions[0].id);
                if (d.sessions[0].sections.length > 0) {
                    setSelectedSectionId(d.sessions[0].sections[0].id);
                }
            }
        })
            .catch((err) => {
            var _a, _b, _c, _d, _e;
            return setError(((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status) === 404
                ? t('eventDetail.notFound')
                : (_e = (_d = (_c = (_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) !== null && _d !== void 0 ? _d : err === null || err === void 0 ? void 0 : err.message) !== null && _e !== void 0 ? _e : t('errors.unexpected'));
        });
    }, [slug, publicEvents, t]);
    const selectedSession = useMemo(() => {
        var _a;
        return (_a = data === null || data === void 0 ? void 0 : data.sessions.find((s) => s.id === selectedSessionId)) !== null && _a !== void 0 ? _a : null;
    }, [data, selectedSessionId]);
    const selectedSection = useMemo(() => {
        var _a;
        return ((_a = selectedSession === null || selectedSession === void 0 ? void 0 : selectedSession.sections.find((s) => s.id === selectedSectionId)) !== null && _a !== void 0 ? _a : null);
    }, [selectedSession, selectedSectionId]);
    const activePhase = (_a = selectedSection === null || selectedSection === void 0 ? void 0 : selectedSection.currentPhase) !== null && _a !== void 0 ? _a : null;
    const fallbackPhase = (_b = selectedSection === null || selectedSection === void 0 ? void 0 : selectedSection.phases.find((p) => p.isActive)) !== null && _b !== void 0 ? _b : null;
    const displayPhase = activePhase !== null && activePhase !== void 0 ? activePhase : fallbackPhase;
    const unitPrice = (_c = displayPhase === null || displayPhase === void 0 ? void 0 : displayPhase.price) !== null && _c !== void 0 ? _c : 0;
    const subtotal = unitPrice * qty;
    const serviceFee = (_d = displayPhase === null || displayPhase === void 0 ? void 0 : displayPhase.serviceFee) !== null && _d !== void 0 ? _d : 0;
    const total = subtotal + serviceFee * qty;
    if (error) {
        return (React.createElement("div", { className: Styles.page },
            React.createElement("div", { className: Styles.error }, error),
            React.createElement(Link, { to: "/", className: Styles.backLink },
                "\u2190 ",
                t('common.back'))));
    }
    if (!data) {
        return React.createElement("div", { className: Styles.page }, t('common.loading'));
    }
    const { event, category, venue, sessions } = data;
    const handleCheckout = () => {
        if (!selectedSessionId || !selectedSectionId || !displayPhase)
            return;
        // Checkout flow is implemented in Iter 6. For now, we hand off the
        // parameters via URL so the checkout page can pick them up.
        navigate(`/checkout?event=${event.id}&session=${selectedSessionId}&section=${selectedSectionId}&phase=${displayPhase.id}&qty=${qty}`);
    };
    return (React.createElement("div", { className: Styles.page },
        React.createElement(Helmet, null,
            React.createElement("title", null,
                "HypePass \u2014 ",
                event.title),
            event.shortDescription && (React.createElement("meta", { name: "description", content: event.shortDescription }))),
        React.createElement("nav", { className: Styles.breadcrumb },
            React.createElement(Link, { to: "/", className: Styles.breadcrumbLink },
                "\u2190 ",
                t('common.back')),
            React.createElement("span", { className: Styles.breadcrumbSep }, "/"),
            React.createElement("span", { className: "mono", style: { fontSize: 10, letterSpacing: '0.1em' } }, t('nav.discover').toUpperCase()),
            category && (React.createElement(React.Fragment, null,
                React.createElement("span", { className: Styles.breadcrumbSep }, "/"),
                React.createElement("span", { className: "mono", style: { fontSize: 10, letterSpacing: '0.1em' } }, category.name.toUpperCase()))),
            React.createElement("span", { className: Styles.breadcrumbSep }, "/"),
            React.createElement("span", { className: Styles.breadcrumbActive }, event.title)),
        React.createElement("div", { className: Styles.layout },
            React.createElement("div", { className: Styles.left },
                React.createElement("div", { className: Styles.heroImageWrap }, event.bannerImageUrl ? (React.createElement("img", { src: event.bannerImageUrl, alt: event.title, className: Styles.heroImage })) : event.coverImageUrl ? (React.createElement("img", { src: event.coverImageUrl, alt: event.title, className: Styles.heroImage })) : (React.createElement("div", { className: Styles.heroImageEmpty }, "NO IMAGE"))),
                React.createElement("div", { className: Styles.titleRow },
                    selectedSession && (React.createElement("div", { className: Styles.dateCard },
                        React.createElement("div", { className: Styles.dateDow }, new Date(selectedSession.startsAt).toLocaleDateString(undefined, { weekday: 'short' })),
                        React.createElement("div", { className: Styles.dateDay }, new Date(selectedSession.startsAt).toLocaleDateString(undefined, { day: '2-digit' })),
                        React.createElement("div", { className: Styles.dateMonth },
                            new Date(selectedSession.startsAt).toLocaleDateString(undefined, { month: 'short' }),
                            ' · ',
                            new Date(selectedSession.startsAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })))),
                    React.createElement("div", { className: Styles.titleBlock },
                        category && (React.createElement("div", { className: Styles.categoryLabel }, category.name.toUpperCase())),
                        React.createElement("h1", { className: Styles.title }, event.title),
                        venue && (React.createElement("div", { className: Styles.venueLine },
                            venue.name,
                            " \u00B7 ",
                            venue.city)))),
                event.shortDescription && (React.createElement("p", { className: Styles.shortDescription }, event.shortDescription)),
                event.description && (React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "hr-label", style: { marginBottom: 16 } }, t('eventDetail.about')),
                    React.createElement("p", { className: Styles.description }, event.description))),
                venue && (React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "hr-label", style: { marginBottom: 16, marginTop: 32 } }, t('eventDetail.venue')),
                    React.createElement("div", { className: Styles.venueCard },
                        React.createElement("div", { className: Styles.venueName }, venue.name),
                        React.createElement("div", { className: Styles.venueMeta },
                            venue.addressLine,
                            venue.region ? `, ${venue.region}` : '',
                            " \u00B7 ",
                            venue.city,
                            ",",
                            ' ',
                            venue.country),
                        venue.capacity && (React.createElement("div", { className: Styles.venueCap },
                            "\u00B7 ",
                            venue.capacity.toLocaleString('es-CO'),
                            ' ',
                            t('eventDetail.capacity')))))),
                React.createElement("div", { className: Styles.policyRow },
                    React.createElement(Badge, { label: event.resaleEnabled
                            ? t('eventDetail.policy.resaleOn')
                            : t('eventDetail.policy.resaleOff'), color: event.resaleEnabled ? 'lime' : 'muted' }),
                    React.createElement(Badge, { label: event.transferEnabled
                            ? t('eventDetail.policy.transferOn')
                            : t('eventDetail.policy.transferOff'), color: event.transferEnabled ? 'lime' : 'muted' }),
                    React.createElement(Badge, { label: t('eventDetail.policy.qr', {
                            hours: (_e = event.defaultQrVisibleHoursBefore) !== null && _e !== void 0 ? _e : 24,
                        }), color: "magenta" }))),
            React.createElement("aside", { className: Styles.aside },
                React.createElement("div", { className: Styles.asideInner },
                    React.createElement("div", { className: Styles.asideEyebrow },
                        "\u25C6 ",
                        t('eventDetail.selectSession')),
                    React.createElement("div", { className: Styles.sessionList }, sessions.map((s) => {
                        var _a;
                        return (React.createElement("button", { key: s.id, type: "button", className: `${Styles.sessionBtn} ${selectedSessionId === s.id ? Styles.sessionBtnActive : ''}`, onClick: () => {
                                var _a, _b;
                                setSelectedSessionId(s.id);
                                setSelectedSectionId((_b = (_a = s.sections[0]) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null);
                            } },
                            React.createElement("div", { className: Styles.sessionBtnDate }, new Date(s.startsAt).toLocaleString(undefined, {
                                weekday: 'short',
                                month: 'short',
                                day: '2-digit',
                            })),
                            React.createElement("div", { className: Styles.sessionBtnName }, (_a = s.name) !== null && _a !== void 0 ? _a : t('organizer.events.sessions.untitled'))));
                    })),
                    selectedSession && (React.createElement(React.Fragment, null,
                        React.createElement("div", { className: Styles.asideEyebrow },
                            "\u25C6 ",
                            t('eventDetail.selectTier')),
                        React.createElement("div", { className: Styles.sectionList },
                            selectedSession.sections.length === 0 && (React.createElement("div", { className: Styles.sectionEmpty }, t('eventDetail.noSections'))),
                            selectedSession.sections.map((sec) => {
                                const active = sec.currentPhase;
                                const fallback = sec.phases.find((p) => p.isActive);
                                const visible = active !== null && active !== void 0 ? active : fallback;
                                const isSelected = selectedSectionId === sec.id;
                                return (React.createElement("button", { key: sec.id, type: "button", className: `${Styles.sectionBtn} ${isSelected ? Styles.sectionBtnActive : ''}`, onClick: () => setSelectedSectionId(sec.id), disabled: !visible },
                                    React.createElement("div", { className: Styles.sectionTopRow },
                                        React.createElement("div", { className: Styles.sectionName }, sec.name),
                                        React.createElement("div", { className: Styles.sectionPrice }, visible
                                            ? formatCOP(visible.price, visible.currency)
                                            : t('eventDetail.soldOut'))),
                                    sec.description && (React.createElement("div", { className: Styles.sectionDesc }, sec.description)),
                                    React.createElement("div", { className: Styles.sectionPhase }, visible
                                        ? `${visible.name}${active ? '' : ` · ${t('eventDetail.upcoming')}`}`
                                        : t('eventDetail.notOnSale'))));
                            })),
                        React.createElement("div", { className: Styles.asideEyebrow },
                            "\u25C6 ",
                            t('eventDetail.quantity')),
                        React.createElement("div", { className: Styles.qtyRow },
                            React.createElement("button", { type: "button", className: Styles.qtyBtn, onClick: () => {
                                    var _a;
                                    return setQty(Math.max((_a = selectedSection === null || selectedSection === void 0 ? void 0 : selectedSection.minPerOrder) !== null && _a !== void 0 ? _a : 1, qty - 1));
                                } }, "\u2212"),
                            React.createElement("div", { className: Styles.qtyValue }, qty),
                            React.createElement("button", { type: "button", className: Styles.qtyBtn, onClick: () => {
                                    var _a;
                                    return setQty(Math.min((_a = selectedSection === null || selectedSection === void 0 ? void 0 : selectedSection.maxPerOrder) !== null && _a !== void 0 ? _a : 8, qty + 1));
                                } }, "+")),
                        React.createElement("div", { className: Styles.summary },
                            React.createElement(Row, { label: `${qty} × ${formatCOP(unitPrice, (_f = displayPhase === null || displayPhase === void 0 ? void 0 : displayPhase.currency) !== null && _f !== void 0 ? _f : event.currency)}`, value: formatCOP(subtotal, (_g = displayPhase === null || displayPhase === void 0 ? void 0 : displayPhase.currency) !== null && _g !== void 0 ? _g : event.currency) }),
                            React.createElement(Row, { label: t('eventDetail.serviceFee'), value: formatCOP(serviceFee * qty, (_h = displayPhase === null || displayPhase === void 0 ? void 0 : displayPhase.currency) !== null && _h !== void 0 ? _h : event.currency) }),
                            React.createElement(Row, { label: t('eventDetail.total'), value: formatCOP(total, (_j = displayPhase === null || displayPhase === void 0 ? void 0 : displayPhase.currency) !== null && _j !== void 0 ? _j : event.currency), bold: true })),
                        React.createElement(PulseButton, { variant: "primary", fullWidth: true, onClick: handleCheckout, disabled: !displayPhase || !activePhase }, activePhase
                            ? t('eventDetail.continueCheckout')
                            : t('eventDetail.notOnSale')),
                        React.createElement("div", { className: Styles.protected },
                            React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", stroke: "#d7ff3a", strokeWidth: "1.5" },
                                React.createElement("path", { d: "M7 1l5 2v4c0 3-2.5 5-5 6-2.5-1-5-3-5-6V3l5-2z" })),
                            React.createElement("div", null,
                                React.createElement("strong", null, t('eventDetail.protected.title')),
                                ' ',
                                t('eventDetail.protected.body'))))))))));
};
const Row = ({ label, value, bold, }) => (React.createElement("div", { style: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '6px 0',
        fontSize: bold ? 15 : 13,
        fontWeight: bold ? 600 : 400,
        color: bold ? '#faf7f0' : '#bfbab1',
    } },
    React.createElement("span", null, label),
    React.createElement("span", { style: {
            fontFamily: bold ? 'Bebas Neue, Impact, sans-serif' : undefined,
            fontSize: bold ? 22 : 13,
            color: bold ? '#d7ff3a' : undefined,
        } }, value)));
const Badge = ({ label, color }) => {
    const bg = color === 'lime'
        ? 'rgba(215,255,58,0.12)'
        : color === 'magenta'
            ? 'rgba(255,46,147,0.15)'
            : 'rgba(144,139,131,0.15)';
    const border = color === 'lime'
        ? 'rgba(215,255,58,0.4)'
        : color === 'magenta'
            ? 'rgba(255,46,147,0.4)'
            : 'rgba(144,139,131,0.4)';
    const text = color === 'lime'
        ? '#d7ff3a'
        : color === 'magenta'
            ? '#ff2e93'
            : '#bfbab1';
    return (React.createElement("span", { style: {
            display: 'inline-flex',
            padding: '5px 10px',
            background: bg,
            border: `1px solid ${border}`,
            color: text,
            borderRadius: 2,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            letterSpacing: '0.12em',
            fontWeight: 600,
            textTransform: 'uppercase',
        } }, label));
};
export default EventDetail;
