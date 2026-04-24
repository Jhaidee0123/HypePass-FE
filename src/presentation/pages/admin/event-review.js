var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Styles from './admin-styles.scss';
import Review from './event-review-styles.scss';
import { PulseButton } from "../../components";
const EventReview = ({ review }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { eventId } = useParams();
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);
    const load = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        if (!eventId)
            return;
        setError(null);
        try {
            const d = yield review.getEvent(eventId);
            setData(d);
        }
        catch (err) {
            setError((_d = (_c = (_b = (_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) !== null && _c !== void 0 ? _c : err === null || err === void 0 ? void 0 : err.message) !== null && _d !== void 0 ? _d : t('errors.unexpected'));
        }
    }), [eventId, review, t]);
    useEffect(() => {
        void load();
    }, [load]);
    if (!data) {
        return (React.createElement("div", { className: Styles.page }, error !== null && error !== void 0 ? error : t('common.loading')));
    }
    const { event, sessions, media, reviews } = data;
    const handleApprove = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        if (!eventId)
            return;
        const notes = (_a = window.prompt(t('admin.events.approvePrompt'))) !== null && _a !== void 0 ? _a : undefined;
        setBusy(true);
        try {
            yield review.approveEvent(eventId, notes);
            navigate('/admin');
        }
        catch (err) {
            setError((_e = (_d = (_c = (_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) !== null && _d !== void 0 ? _d : err === null || err === void 0 ? void 0 : err.message) !== null && _e !== void 0 ? _e : t('errors.unexpected'));
            setBusy(false);
        }
    });
    const handleReject = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        if (!eventId)
            return;
        const notes = window.prompt(t('admin.events.rejectPrompt'));
        if (!notes || notes.trim().length < 10) {
            alert(t('admin.events.rejectMinLength'));
            return;
        }
        setBusy(true);
        try {
            yield review.rejectEvent(eventId, notes.trim());
            navigate('/admin');
        }
        catch (err) {
            setError((_d = (_c = (_b = (_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) !== null && _c !== void 0 ? _c : err === null || err === void 0 ? void 0 : err.message) !== null && _d !== void 0 ? _d : t('errors.unexpected'));
            setBusy(false);
        }
    });
    const handlePublish = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        if (!eventId)
            return;
        setBusy(true);
        try {
            yield review.publishEvent(eventId);
            yield load();
        }
        catch (err) {
            setError((_d = (_c = (_b = (_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) !== null && _c !== void 0 ? _c : err === null || err === void 0 ? void 0 : err.message) !== null && _d !== void 0 ? _d : t('errors.unexpected'));
        }
        finally {
            setBusy(false);
        }
    });
    const handleUnpublish = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        if (!eventId)
            return;
        setBusy(true);
        try {
            yield review.unpublishEvent(eventId);
            yield load();
        }
        catch (err) {
            setError((_d = (_c = (_b = (_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) !== null && _c !== void 0 ? _c : err === null || err === void 0 ? void 0 : err.message) !== null && _d !== void 0 ? _d : t('errors.unexpected'));
        }
        finally {
            setBusy(false);
        }
    });
    return (React.createElement("div", { className: Styles.page },
        React.createElement(Helmet, null,
            React.createElement("title", null,
                "HypePass \u2014 ",
                event.title)),
        React.createElement("div", { style: { marginBottom: 16 } },
            React.createElement(Link, { to: "/admin", className: Review.backLink },
                "\u2190 ",
                t('common.back'))),
        React.createElement("header", { className: Review.header },
            React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                React.createElement("div", { className: Review.status },
                    "\u25C6 ",
                    event.status.toUpperCase()),
                React.createElement("h1", { className: Review.title }, event.title),
                React.createElement("div", { className: Review.meta },
                    "/",
                    event.slug,
                    ' ',
                    event.publicationSubmittedAt && (React.createElement(React.Fragment, null,
                        "\u00B7 submitted",
                        ' ',
                        new Date(event.publicationSubmittedAt).toLocaleString())))),
            React.createElement("div", { className: Review.actions },
                event.status === 'pending_review' && (React.createElement(React.Fragment, null,
                    React.createElement(PulseButton, { variant: "secondary", onClick: handleReject, disabled: busy }, t('admin.events.reject')),
                    React.createElement(PulseButton, { variant: "primary", onClick: handleApprove, disabled: busy }, busy ? t('common.loading') : t('admin.events.approve')))),
                event.status === 'approved' && (React.createElement(PulseButton, { variant: "primary", onClick: handlePublish, disabled: busy }, busy ? t('common.loading') : t('admin.events.publish'))),
                event.status === 'published' && (React.createElement(PulseButton, { variant: "secondary", onClick: handleUnpublish, disabled: busy }, busy ? t('common.loading') : t('admin.events.unpublish'))),
                event.status === 'unpublished' && (React.createElement(PulseButton, { variant: "primary", onClick: handlePublish, disabled: busy }, busy ? t('common.loading') : t('admin.events.publish'))))),
        error && React.createElement("div", { className: Styles.error }, error),
        React.createElement("section", { className: Review.panel },
            React.createElement("h2", { className: Review.panelTitle }, t('admin.events.sections.basics')),
            React.createElement("div", { className: Review.imgRow },
                event.coverImageUrl ? (React.createElement("img", { src: event.coverImageUrl, alt: "Cover", className: Review.cover })) : (React.createElement("div", { className: `${Review.cover} ${Review.imgEmpty}` }, "no cover")),
                event.bannerImageUrl ? (React.createElement("img", { src: event.bannerImageUrl, alt: "Banner", className: Review.banner })) : (React.createElement("div", { className: `${Review.banner} ${Review.imgEmpty}` }, "no banner"))),
            React.createElement(Kv, { k: t('organizer.events.fields.title'), v: event.title }),
            React.createElement(Kv, { k: t('organizer.events.fields.slug'), v: `/${event.slug}` }),
            event.shortDescription && (React.createElement(Kv, { k: t('organizer.events.fields.shortDescription'), v: event.shortDescription })),
            event.description && (React.createElement(Kv, { k: t('organizer.events.fields.description'), v: event.description, multiline: true })),
            React.createElement(Kv, { k: t('organizer.events.fields.resaleEnabled'), v: event.resaleEnabled ? 'SI' : 'NO' }),
            React.createElement(Kv, { k: t('organizer.events.fields.transferEnabled'), v: event.transferEnabled ? 'SI' : 'NO' }),
            React.createElement(Kv, { k: t('organizer.events.fields.qrHours'), v: event.defaultQrVisibleHoursBefore !== null &&
                    event.defaultQrVisibleHoursBefore !== undefined
                    ? `${event.defaultQrVisibleHoursBefore}h`
                    : t('admin.events.platformDefault') })),
        React.createElement("section", { className: Review.panel },
            React.createElement("h2", { className: Review.panelTitle }, t('admin.events.sections.sessions')),
            sessions.length === 0 && (React.createElement("div", { className: Styles.empty }, t('admin.events.noSessions'))),
            sessions.map((s) => {
                var _a;
                return (React.createElement("div", { key: s.id, className: Review.sessionCard },
                    React.createElement("div", { className: Review.sessionHeader },
                        React.createElement("div", null,
                            React.createElement("div", { className: Review.sessionDate }, new Date(s.startsAt).toLocaleString()),
                            React.createElement("div", { className: Review.sessionName }, (_a = s.name) !== null && _a !== void 0 ? _a : t('organizer.events.sessions.untitled'))),
                        React.createElement("div", { className: Review.sessionMeta },
                            "TZ ",
                            s.timezone,
                            React.createElement("br", null),
                            "ENDS ",
                            new Date(s.endsAt).toLocaleString())),
                    s.sections.length === 0 && (React.createElement("div", { className: Review.sessionEmpty }, t('organizer.events.sections.empty'))),
                    s.sections.map((sec) => (React.createElement("div", { key: sec.id, className: Review.section },
                        React.createElement("div", { className: Review.sectionTop },
                            React.createElement("div", { className: Review.sectionName }, sec.name),
                            React.createElement("div", { className: Review.sectionMeta },
                                "INV ",
                                sec.totalInventory,
                                " \u00B7 MIN ",
                                sec.minPerOrder,
                                " \u00B7 MAX",
                                ' ',
                                sec.maxPerOrder,
                                " \u00B7",
                                ' ',
                                sec.resaleAllowed ? 'RESALE OK' : 'NO RESALE',
                                " \u00B7",
                                ' ',
                                sec.transferAllowed ? 'XFER OK' : 'NO XFER')),
                        sec.phases.map((p) => (React.createElement("div", { key: p.id, className: Review.phase },
                            React.createElement("div", null,
                                React.createElement("div", { className: Review.phaseName }, p.name),
                                React.createElement("div", { className: Review.phaseWindow },
                                    new Date(p.startsAt).toLocaleString(),
                                    " \u2192",
                                    ' ',
                                    new Date(p.endsAt).toLocaleString())),
                            React.createElement("div", { className: Review.phasePrice },
                                "$",
                                (p.price / 100).toLocaleString('es-CO'))))))))));
            })),
        media.length > 0 && (React.createElement("section", { className: Review.panel },
            React.createElement("h2", { className: Review.panelTitle }, t('admin.events.sections.media')),
            React.createElement("div", { className: Review.mediaGrid }, media.map((m) => {
                var _a;
                return (React.createElement("img", { key: m.id, src: m.url, alt: (_a = m.alt) !== null && _a !== void 0 ? _a : '', className: Review.mediaItem }));
            })))),
        reviews.length > 0 && (React.createElement("section", { className: Review.panel },
            React.createElement("h2", { className: Review.panelTitle }, t('admin.events.sections.history')),
            reviews.map((r) => (React.createElement("div", { key: r.id, className: Review.historyRow },
                React.createElement("div", { className: Review.historyStatus }, r.status.toUpperCase()),
                React.createElement("div", { className: Review.historyMeta },
                    "submitted",
                    ' ',
                    new Date(r.submittedAt).toLocaleString(),
                    r.reviewedAt &&
                        ` · reviewed ${new Date(r.reviewedAt).toLocaleString()}`),
                r.reviewNotes && (React.createElement("div", { className: Review.historyNotes }, r.reviewNotes)))))))));
};
const Kv = ({ k, v, multiline, }) => (React.createElement("div", { style: { marginBottom: 12 } },
    React.createElement("div", { style: {
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            letterSpacing: '0.12em',
            color: '#6b6760',
            textTransform: 'uppercase',
            marginBottom: 4,
        } }, k),
    React.createElement("div", { style: {
            color: '#faf7f0',
            fontSize: 14,
            lineHeight: 1.6,
            whiteSpace: multiline ? 'pre-wrap' : 'normal',
        } }, v)));
export default EventReview;
