var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Styles from '../organizer-styles.scss';
import { PulseButton } from "../../../components";
export const CreateCompanyForm = ({ companies, onCreated, onCancel, }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [legalName, setLegalName] = useState('');
    const [taxId, setTaxId] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const slugValid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
    const canSubmit = name.trim() !== '' && slugValid && !submitting;
    const handleSubmit = (e) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        e.preventDefault();
        if (!canSubmit)
            return;
        setSubmitting(true);
        setError(null);
        try {
            const created = yield companies.create({
                name,
                slug,
                legalName: legalName || undefined,
                taxId: taxId || undefined,
                contactEmail: contactEmail || undefined,
            });
            onCreated(created);
        }
        catch (err) {
            setError((_d = (_c = (_b = (_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) !== null && _c !== void 0 ? _c : err === null || err === void 0 ? void 0 : err.message) !== null && _d !== void 0 ? _d : t('errors.unexpected'));
        }
        finally {
            setSubmitting(false);
        }
    });
    return (React.createElement("form", { onSubmit: handleSubmit, className: "create-company-form" },
        React.createElement("div", { style: {
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                letterSpacing: '0.14em',
                color: '#6b6760',
                marginBottom: 12,
            } },
            "\u25C6 ",
            t('organizer.company.title').toUpperCase()),
        React.createElement(Field, { label: t('organizer.company.name'), value: name, onChange: setName, placeholder: "Stage Live Producciones", required: true }),
        React.createElement(Field, { label: t('organizer.company.slug'), value: slug, onChange: (v) => setSlug(v.toLowerCase()), placeholder: "stage-live", hint: t('organizer.company.slugHint'), invalid: slug !== '' && !slugValid, required: true }),
        React.createElement(Field, { label: t('organizer.company.legalName'), value: legalName, onChange: setLegalName, placeholder: "Stage Live S.A.S." }),
        React.createElement(Field, { label: t('organizer.company.taxId'), value: taxId, onChange: setTaxId, placeholder: "900.123.456-7" }),
        React.createElement(Field, { label: t('organizer.company.contactEmail'), value: contactEmail, onChange: setContactEmail, placeholder: "contacto@stage.live", type: "email" }),
        error && React.createElement("p", { className: Styles.error }, error),
        React.createElement("div", { style: { display: 'flex', gap: 12, marginTop: 20 } },
            React.createElement(PulseButton, { type: "submit", variant: "primary", disabled: !canSubmit }, submitting ? t('common.loading') : t('organizer.company.submit')),
            React.createElement(PulseButton, { type: "button", variant: "secondary", onClick: onCancel, disabled: submitting }, t('common.cancel'))),
        React.createElement("p", { style: {
                fontSize: 12,
                color: '#908b83',
                marginTop: 16,
                lineHeight: 1.6,
            } }, t('organizer.company.note'))));
};
const Field = ({ label, value, onChange, placeholder, hint, required, type = 'text', invalid = false, }) => (React.createElement("div", { style: { marginBottom: 16 } },
    React.createElement("div", { style: {
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            letterSpacing: '0.12em',
            color: '#6b6760',
            textTransform: 'uppercase',
            marginBottom: 8,
        } },
        label,
        " ",
        required && React.createElement("span", { style: { color: '#ff4d5a' } }, "*")),
    React.createElement("input", { type: type, value: value, placeholder: placeholder, onChange: (e) => onChange(e.target.value), style: {
            width: '100%',
            padding: '12px 14px',
            fontSize: 14,
            background: '#121110',
            border: `1px solid ${invalid ? '#ff4d5a' : '#242320'}`,
            color: '#faf7f0',
            borderRadius: 4,
            fontFamily: 'Space Grotesk, system-ui, sans-serif',
            outline: 'none',
        } }),
    hint && (React.createElement("div", { style: {
            fontSize: 11,
            color: '#6b6760',
            marginTop: 6,
        } }, hint))));
