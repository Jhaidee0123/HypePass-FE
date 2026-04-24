var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Styles from './organizer-styles.scss';
import { PulseButton } from "../../components";
import { ImageUpload } from './components/image-upload';
import { BasicField } from './components/basic-field';
const EventCreate = ({ events, categories, venues, uploader, }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { companyId } = useParams();
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [venueId, setVenueId] = useState('');
    const [coverImageUrl, setCoverImageUrl] = useState('');
    const [bannerImageUrl, setBannerImageUrl] = useState('');
    const [cats, setCats] = useState([]);
    const [vens, setVens] = useState([]);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    useEffect(() => {
        categories.list().then(setCats).catch(() => undefined);
        if (companyId)
            venues
                .list(companyId)
                .then(setVens)
                .catch(() => undefined);
    }, [companyId, categories, venues]);
    // auto-slug from title
    useEffect(() => {
        if (slug === '' || slug === makeSlug(title.slice(0, title.length - 1))) {
            setSlug(makeSlug(title));
        }
    }, [title]);
    const slugValid = slug === '' || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
    const canSubmit = !!companyId &&
        title.trim() !== '' &&
        slug.trim() !== '' &&
        slugValid &&
        !submitting;
    const handleSubmit = (e) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        e.preventDefault();
        if (!canSubmit || !companyId)
            return;
        setSubmitting(true);
        setError(null);
        try {
            const created = yield events.create(companyId, {
                title,
                slug,
                shortDescription: shortDescription || undefined,
                description: description || undefined,
                categoryId: categoryId || undefined,
                venueId: venueId || undefined,
                coverImageUrl: coverImageUrl || undefined,
                bannerImageUrl: bannerImageUrl || undefined,
            });
            navigate(`/organizer/companies/${companyId}/events/${created.id}`);
        }
        catch (err) {
            setError((_d = (_c = (_b = (_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) !== null && _c !== void 0 ? _c : err === null || err === void 0 ? void 0 : err.message) !== null && _d !== void 0 ? _d : t('errors.unexpected'));
        }
        finally {
            setSubmitting(false);
        }
    });
    return (React.createElement("div", { className: Styles.page },
        React.createElement(Helmet, null,
            React.createElement("title", null,
                "HypePass \u2014 ",
                t('organizer.events.new'))),
        React.createElement("div", { style: { marginBottom: 24 } },
            React.createElement(Link, { to: "/organizer", style: {
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 11,
                    letterSpacing: '0.1em',
                    color: '#6b6760',
                } },
                "\u2190 ",
                t('common.back'))),
        React.createElement("h1", { className: Styles.title, style: { marginBottom: 28 } }, t('organizer.events.newTitle')),
        React.createElement("form", { onSubmit: handleSubmit, style: { maxWidth: 720 } },
            React.createElement(BasicField, { label: t('organizer.events.fields.title'), value: title, onChange: setTitle, placeholder: "PARALLAX \u2014 Festival 3 d\u00EDas", required: true }),
            React.createElement(BasicField, { label: t('organizer.events.fields.slug'), value: slug, onChange: (v) => setSlug(v.toLowerCase()), placeholder: "parallax-festival-2026", hint: t('organizer.events.fields.slugHint'), required: true }),
            React.createElement(BasicField, { label: t('organizer.events.fields.shortDescription'), value: shortDescription, onChange: setShortDescription, placeholder: "3 d\u00EDas, 2 escenarios, 34 artistas." }),
            React.createElement(BasicField, { label: t('organizer.events.fields.description'), value: description, onChange: setDescription, placeholder: "Descripci\u00F3n larga del evento...", textarea: true, rows: 6 }),
            React.createElement("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 16,
                } },
                React.createElement(SelectField, { label: t('organizer.events.fields.category'), value: categoryId, onChange: setCategoryId, options: [
                        { value: '', label: '—' },
                        ...cats.map((c) => ({ value: c.id, label: c.name })),
                    ] }),
                React.createElement(SelectField, { label: t('organizer.events.fields.venue'), value: venueId, onChange: setVenueId, options: [
                        { value: '', label: '—' },
                        ...vens.map((v) => ({
                            value: v.id,
                            label: `${v.name} · ${v.city}`,
                        })),
                    ] })),
            React.createElement("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 16,
                } },
                React.createElement(ImageUpload, { uploader: uploader, value: coverImageUrl, onChange: (url) => setCoverImageUrl(url), label: t('organizer.events.fields.cover'), aspect: "4 / 5" }),
                React.createElement(ImageUpload, { uploader: uploader, value: bannerImageUrl, onChange: (url) => setBannerImageUrl(url), label: t('organizer.events.fields.banner'), aspect: "16 / 9" })),
            error && React.createElement("p", { className: Styles.error }, error),
            React.createElement("div", { style: { display: 'flex', gap: 12, marginTop: 20 } },
                React.createElement(PulseButton, { type: "submit", variant: "primary", disabled: !canSubmit }, submitting ? t('common.loading') : t('organizer.events.create')),
                React.createElement(PulseButton, { type: "button", variant: "secondary", onClick: () => navigate('/organizer') }, t('common.cancel'))))));
};
const SelectField = ({ label, value, onChange, options, }) => (React.createElement("div", { style: { marginBottom: 14 } },
    React.createElement("div", { style: {
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            letterSpacing: '0.12em',
            color: '#6b6760',
            textTransform: 'uppercase',
            marginBottom: 8,
        } }, label),
    React.createElement("select", { value: value, onChange: (e) => onChange(e.target.value), style: {
            width: '100%',
            padding: '12px 14px',
            fontSize: 14,
            background: '#121110',
            border: '1px solid #242320',
            color: '#faf7f0',
            borderRadius: 4,
            fontFamily: 'Space Grotesk, system-ui, sans-serif',
            outline: 'none',
        } }, options.map((o) => (React.createElement("option", { key: o.value, value: o.value }, o.label))))));
function makeSlug(input) {
    return input
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}
export default EventCreate;
