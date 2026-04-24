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
import Styles from './organizer-styles.scss';
import Editor from './event-editor-styles.scss';
import { PulseButton } from "../../components";
import { ImageUpload } from './components/image-upload';
import { BasicField } from './components/basic-field';
const EMPTY_SESSION = {
    name: '',
    startsAt: '',
    endsAt: '',
    timezone: 'America/Bogota',
};
const EMPTY_SECTION = {
    name: '',
    totalInventory: 100,
    minPerOrder: 1,
    maxPerOrder: 8,
    resaleAllowed: true,
    transferAllowed: true,
};
const EMPTY_PHASE = {
    name: 'PREVENTA',
    startsAt: '',
    endsAt: '',
    price: 0,
    currency: 'COP',
    isActive: true,
};
const STATUS_LABELS = {
    draft: 'DRAFT',
    pending_review: 'EN REVISIÓN',
    approved: 'APROBADO',
    rejected: 'RECHAZADO',
    published: 'PUBLICADO',
    unpublished: 'DESPUBLICADO',
    cancelled: 'CANCELADO',
    ended: 'TERMINADO',
};
const EventEditor = ({ events, uploader }) => {
    var _a, _b;
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { companyId, eventId } = useParams();
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [savingBasic, setSavingBasic] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const refresh = useCallback(() => {
        if (!companyId || !eventId)
            return;
        events
            .get(companyId, eventId)
            .then((d) => setData(d))
            .catch((err) => {
            var _a, _b, _c, _d;
            return setError((_d = (_c = (_b = (_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) !== null && _c !== void 0 ? _c : err === null || err === void 0 ? void 0 : err.message) !== null && _d !== void 0 ? _d : t('errors.unexpected'));
        });
    }, [companyId, eventId, events, t]);
    useEffect(() => {
        refresh();
    }, [refresh]);
    if (!data) {
        return (React.createElement("div", { className: Styles.page }, error !== null && error !== void 0 ? error : t('common.loading')));
    }
    const { event } = data;
    const saveBasic = (patch) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        if (!companyId || !eventId)
            return;
        setSavingBasic(true);
        try {
            yield events.update(companyId, eventId, patch);
            yield refresh();
        }
        catch (err) {
            setError((_d = (_c = (_b = (_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) !== null && _c !== void 0 ? _c : err === null || err === void 0 ? void 0 : err.message) !== null && _d !== void 0 ? _d : t('errors.unexpected'));
        }
        finally {
            setSavingBasic(false);
        }
    });
    const handleSubmitForReview = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        if (!companyId || !eventId)
            return;
        setSubmitting(true);
        setError(null);
        try {
            yield events.submitForReview(companyId, eventId);
            yield refresh();
        }
        catch (err) {
            setError((_d = (_c = (_b = (_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) !== null && _c !== void 0 ? _c : err === null || err === void 0 ? void 0 : err.message) !== null && _d !== void 0 ? _d : t('errors.unexpected'));
        }
        finally {
            setSubmitting(false);
        }
    });
    const handleDeleteEvent = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        if (!companyId || !eventId)
            return;
        if (!window.confirm(t('organizer.events.confirmDelete')))
            return;
        try {
            yield events.delete(companyId, eventId);
            navigate('/organizer');
        }
        catch (err) {
            setError((_d = (_c = (_b = (_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) !== null && _c !== void 0 ? _c : err === null || err === void 0 ? void 0 : err.message) !== null && _d !== void 0 ? _d : t('errors.unexpected'));
        }
    });
    const isSubmittable = event.status === 'draft' || event.status === 'rejected';
    return (React.createElement("div", { className: Styles.page },
        React.createElement(Helmet, null,
            React.createElement("title", null,
                "HypePass \u2014 ",
                event.title)),
        React.createElement("div", { style: { marginBottom: 16 } },
            React.createElement(Link, { to: "/organizer", className: Editor.backLink },
                "\u2190 ",
                t('common.back'))),
        React.createElement("header", { className: Editor.header },
            React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                React.createElement("div", { className: Editor.eyebrow },
                    "\u25C6 ",
                    STATUS_LABELS[event.status]),
                React.createElement("h1", { className: Editor.title }, event.title),
                React.createElement("div", { className: Editor.slug },
                    "/",
                    event.slug)),
            React.createElement("div", { style: { display: 'flex', gap: 10, flexWrap: 'wrap' } },
                isSubmittable && (React.createElement(PulseButton, { variant: "primary", onClick: handleSubmitForReview, disabled: submitting }, submitting
                    ? t('common.loading')
                    : t('organizer.events.submitReview'))),
                event.status === 'draft' && (React.createElement(PulseButton, { variant: "secondary", onClick: handleDeleteEvent }, t('organizer.events.delete'))))),
        error && React.createElement("div", { className: Styles.error }, error),
        event.status === 'pending_review' && (React.createElement("div", { className: Styles.notice },
            React.createElement("strong", null, t('organizer.events.pendingReviewTitle')),
            React.createElement("p", null, t('organizer.events.pendingReviewBody')))),
        event.status === 'rejected' && (React.createElement("div", { className: `${Styles.notice} ${Styles.noticeDanger}` },
            React.createElement("strong", null, t('organizer.events.rejectedTitle')),
            React.createElement("p", null, t('organizer.events.rejectedBody')))),
        React.createElement(Panel, { title: t('organizer.events.sections.basics') },
            React.createElement("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 16,
                } },
                React.createElement(ImageUpload, { uploader: uploader, value: event.coverImageUrl, onChange: (url) => saveBasic({ coverImageUrl: url || null }), label: t('organizer.events.fields.cover'), aspect: "4 / 5" }),
                React.createElement(ImageUpload, { uploader: uploader, value: event.bannerImageUrl, onChange: (url) => saveBasic({ bannerImageUrl: url || null }), label: t('organizer.events.fields.banner'), aspect: "16 / 9" })),
            React.createElement(InlineTextField, { label: t('organizer.events.fields.title'), value: event.title, disabled: savingBasic, onSave: (v) => saveBasic({ title: v }) }),
            React.createElement(InlineTextField, { label: t('organizer.events.fields.shortDescription'), value: (_a = event.shortDescription) !== null && _a !== void 0 ? _a : '', disabled: savingBasic, onSave: (v) => saveBasic({ shortDescription: v || null }) }),
            React.createElement(InlineTextArea, { label: t('organizer.events.fields.description'), value: (_b = event.description) !== null && _b !== void 0 ? _b : '', disabled: savingBasic, onSave: (v) => saveBasic({ description: v || null }) }),
            React.createElement("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: 16,
                } },
                React.createElement(ToggleField, { label: t('organizer.events.fields.resaleEnabled'), value: event.resaleEnabled, onChange: (v) => saveBasic({ resaleEnabled: v }), disabled: savingBasic }),
                React.createElement(ToggleField, { label: t('organizer.events.fields.transferEnabled'), value: event.transferEnabled, onChange: (v) => saveBasic({ transferEnabled: v }), disabled: savingBasic }),
                React.createElement(InlineTextField, { label: t('organizer.events.fields.qrHours'), value: event.defaultQrVisibleHoursBefore !== null &&
                        event.defaultQrVisibleHoursBefore !== undefined
                        ? String(event.defaultQrVisibleHoursBefore)
                        : '', disabled: savingBasic, onSave: (v) => saveBasic({
                        defaultQrVisibleHoursBefore: v === '' ? null : parseInt(v, 10),
                    }), placeholder: "24" }))),
        React.createElement(Panel, { title: t('organizer.events.sections.sessions') },
            React.createElement(SessionsEditor, { events: events, data: data, companyId: companyId, eventId: eventId, onRefresh: refresh }))));
};
const Panel = ({ title, children }) => (React.createElement("section", { style: {
        background: '#0a0908',
        border: '1px solid #242320',
        borderRadius: 6,
        padding: 24,
        marginBottom: 20,
    } },
    React.createElement("h2", { style: {
            fontFamily: 'Bebas Neue, Impact, sans-serif',
            fontSize: 32,
            color: '#faf7f0',
            letterSpacing: '0.02em',
            marginBottom: 20,
        } }, title),
    children));
const InlineTextField = ({ label, value, onSave, disabled, placeholder, }) => {
    const [local, setLocal] = useState(value);
    useEffect(() => setLocal(value), [value]);
    return (React.createElement(BasicField, { label: label, value: local, onChange: (v) => setLocal(v), placeholder: placeholder, disabled: disabled, hint: "Presiona Enter para guardar" }));
};
const InlineTextArea = ({ label, value, onSave, disabled, }) => {
    const [local, setLocal] = useState(value);
    useEffect(() => setLocal(value), [value]);
    return (React.createElement(BasicField, { label: label, value: local, onChange: (v) => setLocal(v), textarea: true, rows: 5, disabled: disabled }));
};
const ToggleField = ({ label, value, onChange, disabled }) => (React.createElement("div", { style: { marginBottom: 14 } },
    React.createElement("div", { style: {
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            letterSpacing: '0.12em',
            color: '#6b6760',
            textTransform: 'uppercase',
            marginBottom: 8,
        } }, label),
    React.createElement("button", { type: "button", disabled: disabled, onClick: () => onChange(!value), style: {
            width: 48,
            height: 28,
            borderRadius: 14,
            background: value ? '#d7ff3a' : '#34312c',
            position: 'relative',
            padding: 2,
            display: 'flex',
            alignItems: 'center',
        } },
        React.createElement("div", { style: {
                width: 24,
                height: 24,
                borderRadius: 12,
                background: '#0a0908',
                transform: value ? 'translateX(20px)' : 'translateX(0)',
                transition: 'transform 0.15s ease',
            } }))));
const SessionsEditor = ({ events, data, companyId, eventId, onRefresh, }) => {
    var _a;
    const { t } = useTranslation();
    const [showAdd, setShowAdd] = useState(false);
    const [draft, setDraft] = useState(EMPTY_SESSION);
    const [busy, setBusy] = useState(false);
    const handleAdd = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        setBusy(true);
        try {
            yield events.addSession(companyId, eventId, Object.assign(Object.assign({}, draft), { name: draft.name || undefined }));
            setDraft(EMPTY_SESSION);
            setShowAdd(false);
            onRefresh();
        }
        catch (err) {
            alert((_d = (_c = (_b = (_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) !== null && _c !== void 0 ? _c : err === null || err === void 0 ? void 0 : err.message) !== null && _d !== void 0 ? _d : t('errors.unexpected'));
        }
        finally {
            setBusy(false);
        }
    });
    return (React.createElement(React.Fragment, null,
        data.sessions.length === 0 && (React.createElement("div", { style: {
                padding: 20,
                background: '#121110',
                border: '1px dashed #34312c',
                borderRadius: 4,
                color: '#908b83',
                fontSize: 13,
                marginBottom: 16,
            } }, t('organizer.events.sessions.empty'))),
        data.sessions.map((s) => (React.createElement(SessionCard, { key: s.id, session: s, events: events, companyId: companyId, eventId: eventId, onRefresh: onRefresh }))),
        showAdd ? (React.createElement("div", { style: {
                padding: 20,
                background: '#121110',
                border: '1px solid #d7ff3a',
                borderRadius: 4,
                marginTop: 12,
            } },
            React.createElement(BasicField, { label: t('organizer.events.sessions.name'), value: (_a = draft.name) !== null && _a !== void 0 ? _a : '', onChange: (v) => setDraft((p) => (Object.assign(Object.assign({}, p), { name: v }))), placeholder: "D\u00EDa 1" }),
            React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 } },
                React.createElement(BasicField, { label: t('organizer.events.sessions.startsAt'), type: "datetime-local", value: draft.startsAt, onChange: (v) => setDraft((p) => (Object.assign(Object.assign({}, p), { startsAt: v }))), required: true }),
                React.createElement(BasicField, { label: t('organizer.events.sessions.endsAt'), type: "datetime-local", value: draft.endsAt, onChange: (v) => setDraft((p) => (Object.assign(Object.assign({}, p), { endsAt: v }))), required: true })),
            React.createElement(BasicField, { label: t('organizer.events.sessions.timezone'), value: draft.timezone, onChange: (v) => setDraft((p) => (Object.assign(Object.assign({}, p), { timezone: v }))) }),
            React.createElement("div", { style: { display: 'flex', gap: 10, marginTop: 14 } },
                React.createElement(PulseButton, { variant: "primary", onClick: handleAdd, disabled: busy || !draft.startsAt || !draft.endsAt }, busy ? t('common.loading') : t('common.save')),
                React.createElement(PulseButton, { variant: "secondary", onClick: () => {
                        setShowAdd(false);
                        setDraft(EMPTY_SESSION);
                    } }, t('common.cancel'))))) : (React.createElement(PulseButton, { variant: "secondary", onClick: () => setShowAdd(true) },
            "+ ",
            t('organizer.events.sessions.add')))));
};
const SessionCard = ({ session, events, companyId, eventId, onRefresh, }) => {
    var _a, _b, _c;
    const { t } = useTranslation();
    const [open, setOpen] = useState(true);
    const [showAddSection, setShowAddSection] = useState(false);
    const [draftSection, setDraftSection] = useState(EMPTY_SECTION);
    const [busy, setBusy] = useState(false);
    const startsDate = new Date(session.startsAt);
    const handleAddSection = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        setBusy(true);
        try {
            yield events.addSection(companyId, eventId, session.id, draftSection);
            setDraftSection(EMPTY_SECTION);
            setShowAddSection(false);
            onRefresh();
        }
        catch (err) {
            alert((_d = (_c = (_b = (_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) !== null && _c !== void 0 ? _c : err === null || err === void 0 ? void 0 : err.message) !== null && _d !== void 0 ? _d : t('errors.unexpected'));
        }
        finally {
            setBusy(false);
        }
    });
    const handleDeleteSession = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        if (!window.confirm(t('organizer.events.sessions.confirmDelete')))
            return;
        try {
            yield events.deleteSession(companyId, eventId, session.id);
            onRefresh();
        }
        catch (err) {
            alert((_d = (_c = (_b = (_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) !== null && _c !== void 0 ? _c : err === null || err === void 0 ? void 0 : err.message) !== null && _d !== void 0 ? _d : t('errors.unexpected'));
        }
    });
    return (React.createElement("div", { style: {
            border: '1px solid #242320',
            background: '#121110',
            borderRadius: 4,
            marginBottom: 12,
        } },
        React.createElement("button", { type: "button", style: {
                width: '100%',
                padding: 16,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
            }, onClick: () => setOpen((v) => !v) },
            React.createElement("div", null,
                React.createElement("div", { style: {
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 11,
                        color: '#d7ff3a',
                        letterSpacing: '0.12em',
                        marginBottom: 4,
                    } }, startsDate.toLocaleString()),
                React.createElement("div", { style: {
                        fontFamily: 'Bebas Neue, Impact, sans-serif',
                        fontSize: 24,
                        color: '#faf7f0',
                        letterSpacing: '0.02em',
                    } }, (_a = session.name) !== null && _a !== void 0 ? _a : t('organizer.events.sessions.untitled'))),
            React.createElement("span", { style: {
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 11,
                    color: '#6b6760',
                    letterSpacing: '0.1em',
                } }, open ? '▾' : '▸')),
        open && (React.createElement("div", { style: { padding: '0 16px 16px' } },
            React.createElement("div", { style: {
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginBottom: 12,
                } },
                React.createElement("button", { type: "button", style: {
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 10,
                        letterSpacing: '0.12em',
                        color: '#ff4d5a',
                    }, onClick: handleDeleteSession }, t('organizer.events.sessions.delete').toUpperCase())),
            session.sections.length === 0 && (React.createElement("div", { style: {
                    padding: 16,
                    border: '1px dashed #34312c',
                    borderRadius: 4,
                    color: '#908b83',
                    fontSize: 13,
                    marginBottom: 12,
                } }, t('organizer.events.sections.empty'))),
            session.sections.map((sec) => (React.createElement(SectionCard, { key: sec.id, section: sec, events: events, companyId: companyId, eventId: eventId, sessionId: session.id, onRefresh: onRefresh }))),
            showAddSection ? (React.createElement("div", { style: {
                    padding: 16,
                    background: '#0a0908',
                    border: '1px solid #d7ff3a',
                    borderRadius: 4,
                    marginTop: 12,
                } },
                React.createElement(BasicField, { label: t('organizer.events.sectionForm.name'), value: draftSection.name, onChange: (v) => setDraftSection((p) => (Object.assign(Object.assign({}, p), { name: v }))), placeholder: "VIP", required: true }),
                React.createElement(BasicField, { label: t('organizer.events.sectionForm.totalInventory'), type: "number", value: String(draftSection.totalInventory), onChange: (v) => setDraftSection((p) => (Object.assign(Object.assign({}, p), { totalInventory: parseInt(v, 10) || 0 }))), required: true }),
                React.createElement("div", { style: {
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 12,
                    } },
                    React.createElement(BasicField, { label: t('organizer.events.sectionForm.minPerOrder'), type: "number", value: String((_b = draftSection.minPerOrder) !== null && _b !== void 0 ? _b : 1), onChange: (v) => setDraftSection((p) => (Object.assign(Object.assign({}, p), { minPerOrder: parseInt(v, 10) || 1 }))) }),
                    React.createElement(BasicField, { label: t('organizer.events.sectionForm.maxPerOrder'), type: "number", value: String((_c = draftSection.maxPerOrder) !== null && _c !== void 0 ? _c : 8), onChange: (v) => setDraftSection((p) => (Object.assign(Object.assign({}, p), { maxPerOrder: parseInt(v, 10) || 8 }))) })),
                React.createElement("div", { style: { display: 'flex', gap: 10, marginTop: 12 } },
                    React.createElement(PulseButton, { variant: "primary", onClick: handleAddSection, disabled: busy ||
                            !draftSection.name ||
                            draftSection.totalInventory <= 0 }, busy ? t('common.loading') : t('common.save')),
                    React.createElement(PulseButton, { variant: "secondary", onClick: () => {
                            setShowAddSection(false);
                            setDraftSection(EMPTY_SECTION);
                        } }, t('common.cancel'))))) : (React.createElement("button", { type: "button", onClick: () => setShowAddSection(true), style: {
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 11,
                    color: '#d7ff3a',
                    letterSpacing: '0.1em',
                    marginTop: 8,
                } },
                "+ ",
                t('organizer.events.sections.add').toUpperCase()))))));
};
const SectionCard = ({ section, events, companyId, eventId, sessionId, onRefresh, }) => {
    const { t } = useTranslation();
    const [showAddPhase, setShowAddPhase] = useState(false);
    const [draftPhase, setDraftPhase] = useState(Object.assign({}, EMPTY_PHASE));
    const [busy, setBusy] = useState(false);
    const handleAddPhase = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        setBusy(true);
        try {
            yield events.addPhase(companyId, eventId, sessionId, section.id, Object.assign(Object.assign({}, draftPhase), { price: Number(draftPhase.price) || 0 }));
            setDraftPhase(Object.assign({}, EMPTY_PHASE));
            setShowAddPhase(false);
            onRefresh();
        }
        catch (err) {
            alert((_d = (_c = (_b = (_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) !== null && _c !== void 0 ? _c : err === null || err === void 0 ? void 0 : err.message) !== null && _d !== void 0 ? _d : t('errors.unexpected'));
        }
        finally {
            setBusy(false);
        }
    });
    const handleDeleteSection = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        if (!window.confirm(t('organizer.events.sections.confirmDelete')))
            return;
        try {
            yield events.deleteSection(companyId, eventId, sessionId, section.id);
            onRefresh();
        }
        catch (err) {
            alert((_d = (_c = (_b = (_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) !== null && _c !== void 0 ? _c : err === null || err === void 0 ? void 0 : err.message) !== null && _d !== void 0 ? _d : t('errors.unexpected'));
        }
    });
    const handleDeletePhase = (phaseId) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        if (!window.confirm(t('organizer.events.phases.confirmDelete')))
            return;
        try {
            yield events.deletePhase(companyId, eventId, sessionId, section.id, phaseId);
            onRefresh();
        }
        catch (err) {
            alert((_d = (_c = (_b = (_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) !== null && _c !== void 0 ? _c : err === null || err === void 0 ? void 0 : err.message) !== null && _d !== void 0 ? _d : t('errors.unexpected'));
        }
    });
    return (React.createElement("div", { style: {
            background: '#0a0908',
            border: '1px solid #242320',
            borderRadius: 4,
            padding: 14,
            marginBottom: 10,
        } },
        React.createElement("div", { style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 12,
            } },
            React.createElement("div", null,
                React.createElement("div", { style: {
                        fontFamily: 'Bebas Neue, Impact, sans-serif',
                        fontSize: 22,
                        color: '#faf7f0',
                    } }, section.name),
                React.createElement("div", { style: {
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 11,
                        color: '#6b6760',
                        marginTop: 2,
                    } },
                    "INVENTARIO ",
                    section.totalInventory,
                    " \u00B7 MIN ",
                    section.minPerOrder,
                    " \u00B7 MAX ",
                    section.maxPerOrder)),
            React.createElement("button", { type: "button", style: {
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 10,
                    color: '#ff4d5a',
                    letterSpacing: '0.12em',
                }, onClick: handleDeleteSection }, t('organizer.events.sections.delete').toUpperCase())),
        section.phases.map((p) => (React.createElement("div", { key: p.id, style: {
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 80px',
                gap: 12,
                padding: '10px 0',
                borderTop: '1px solid #242320',
                alignItems: 'center',
                fontSize: 13,
                color: '#bfbab1',
            } },
            React.createElement("div", null,
                React.createElement("div", { style: { color: '#faf7f0', fontWeight: 600 } }, p.name),
                React.createElement("div", { style: {
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 10,
                        color: '#6b6760',
                    } }, p.isActive ? 'ACTIVA' : 'INACTIVA')),
            React.createElement("div", { style: {
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 11,
                    color: '#908b83',
                } },
                new Date(p.startsAt).toLocaleString(),
                " \u2192",
                ' ',
                new Date(p.endsAt).toLocaleString()),
            React.createElement("div", { style: {
                    fontFamily: 'Bebas Neue, Impact, sans-serif',
                    fontSize: 20,
                    color: '#d7ff3a',
                    textAlign: 'right',
                } },
                "$",
                (p.price / 100).toLocaleString('es-CO')),
            React.createElement("button", { type: "button", style: {
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 10,
                    color: '#ff4d5a',
                    letterSpacing: '0.12em',
                }, onClick: () => handleDeletePhase(p.id) }, "DEL")))),
        showAddPhase ? (React.createElement("div", { style: {
                marginTop: 12,
                padding: 12,
                background: '#121110',
                border: '1px solid #d7ff3a',
                borderRadius: 4,
            } },
            React.createElement(BasicField, { label: t('organizer.events.phaseForm.name'), value: draftPhase.name, onChange: (v) => setDraftPhase((p) => (Object.assign(Object.assign({}, p), { name: v }))), placeholder: "PREVENTA", required: true }),
            React.createElement("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 12,
                } },
                React.createElement(BasicField, { label: t('organizer.events.phaseForm.startsAt'), type: "datetime-local", value: draftPhase.startsAt, onChange: (v) => setDraftPhase((p) => (Object.assign(Object.assign({}, p), { startsAt: v }))), required: true }),
                React.createElement(BasicField, { label: t('organizer.events.phaseForm.endsAt'), type: "datetime-local", value: draftPhase.endsAt, onChange: (v) => setDraftPhase((p) => (Object.assign(Object.assign({}, p), { endsAt: v }))), required: true })),
            React.createElement(BasicField, { label: t('organizer.events.phaseForm.price'), type: "number", value: String(draftPhase.price), onChange: (v) => setDraftPhase((p) => (Object.assign(Object.assign({}, p), { price: parseInt(v, 10) || 0 }))), hint: t('organizer.events.phaseForm.priceHint'), required: true }),
            React.createElement("div", { style: { display: 'flex', gap: 10, marginTop: 12 } },
                React.createElement(PulseButton, { variant: "primary", onClick: handleAddPhase, disabled: busy ||
                        !draftPhase.name ||
                        !draftPhase.startsAt ||
                        !draftPhase.endsAt ||
                        !draftPhase.price }, busy ? t('common.loading') : t('common.save')),
                React.createElement(PulseButton, { variant: "secondary", onClick: () => {
                        setShowAddPhase(false);
                        setDraftPhase(Object.assign({}, EMPTY_PHASE));
                    } }, t('common.cancel'))))) : (React.createElement("button", { type: "button", onClick: () => setShowAddPhase(true), style: {
                marginTop: 10,
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                color: '#d7ff3a',
                letterSpacing: '0.1em',
            } },
            "+ ",
            t('organizer.events.phases.add').toUpperCase()))));
};
export default EventEditor;
