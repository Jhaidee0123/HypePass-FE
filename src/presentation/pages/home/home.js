import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Styles from './home-styles.scss';
import { PulseButton } from "../../components";
const formatCOP = (cents, currency = 'COP') => new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
}).format(cents / 100);
const Home = ({ publicEvents, categories }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const { t } = useTranslation();
    const [items, setItems] = useState(null);
    const [cats, setCats] = useState([]);
    const [view, setView] = useState('grid');
    const [filters, setFilters] = useState({
        sort: 'soonest',
        pageSize: 24,
    });
    const [error, setError] = useState(null);
    useEffect(() => {
        categories.list().then(setCats).catch(() => undefined);
    }, [categories]);
    useEffect(() => {
        setItems(null);
        setError(null);
        publicEvents
            .list(filters)
            .then((res) => setItems(res.items))
            .catch((err) => {
            var _a, _b, _c, _d;
            return setError((_d = (_c = (_b = (_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) !== null && _c !== void 0 ? _c : err === null || err === void 0 ? void 0 : err.message) !== null && _d !== void 0 ? _d : t('errors.unexpected'));
        });
    }, [filters, publicEvents, t]);
    const hero = (_a = items === null || items === void 0 ? void 0 : items[0]) !== null && _a !== void 0 ? _a : null;
    const rest = (_b = items === null || items === void 0 ? void 0 : items.slice(1)) !== null && _b !== void 0 ? _b : [];
    const dateChips = useMemo(() => {
        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const endOfWeek = new Date(today);
        const daysToSunday = 7 - today.getDay();
        endOfWeek.setDate(today.getDate() + daysToSunday);
        const endOfMonth = new Date(today);
        endOfMonth.setMonth(today.getMonth() + 1);
        endOfMonth.setDate(0);
        return [
            { id: {}, label: t('discover.date.all') },
            {
                id: {
                    dateFrom: today.toISOString(),
                    dateTo: tomorrow.toISOString(),
                },
                label: t('discover.date.today'),
            },
            {
                id: {
                    dateFrom: today.toISOString(),
                    dateTo: endOfWeek.toISOString(),
                },
                label: t('discover.date.weekend'),
            },
            {
                id: {
                    dateFrom: today.toISOString(),
                    dateTo: endOfMonth.toISOString(),
                },
                label: t('discover.date.month'),
            },
        ];
    }, [t]);
    const setDateChip = (chip) => {
        setFilters((f) => (Object.assign(Object.assign({}, f), { dateFrom: chip.dateFrom, dateTo: chip.dateTo })));
    };
    const setCategory = (slug) => setFilters((f) => (Object.assign(Object.assign({}, f), { category: slug })));
    return (React.createElement("div", { className: Styles.homePage },
        React.createElement(Helmet, null,
            React.createElement("title", null,
                "HypePass \u2014 ",
                t('home.tagline'))),
        React.createElement("section", { className: `${Styles.hero} grain` },
            React.createElement("div", { className: Styles.heroInner }, hero ? (React.createElement(React.Fragment, null,
                React.createElement("div", { className: Styles.heroTagline },
                    React.createElement("span", { className: "pulse-dot" }),
                    React.createElement("span", { className: "mono" }, (_e = (_d = (_c = hero.category) === null || _c === void 0 ? void 0 : _c.name) === null || _d === void 0 ? void 0 : _d.toUpperCase()) !== null && _e !== void 0 ? _e : 'LIVE DROP')),
                React.createElement("h1", { className: `${Styles.heroTitle} display` }, hero.title),
                React.createElement("div", { className: Styles.heroMeta },
                    hero.nextSessionStartsAt && (React.createElement("span", null, new Date(hero.nextSessionStartsAt).toLocaleString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                    }))),
                    hero.venue && (React.createElement(React.Fragment, null,
                        React.createElement("span", { className: Styles.heroSep }, "/"),
                        React.createElement("span", null,
                            hero.venue.name,
                            " \u00B7 ",
                            hero.venue.city))),
                    hero.fromPrice !== null && (React.createElement(React.Fragment, null,
                        React.createElement("span", { className: Styles.heroSep }, "/"),
                        React.createElement("span", null,
                            t('discover.from'),
                            ' ',
                            formatCOP(hero.fromPrice, hero.currency))))),
                React.createElement("div", { className: Styles.ctaRow },
                    React.createElement(Link, { to: `/events/${hero.slug}` },
                        React.createElement(PulseButton, { variant: "primary" },
                            t('discover.getTickets'),
                            React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                                React.createElement("path", { d: "M1 7h12M8 2l5 5-5 5", strokeLinecap: "round" })))),
                    React.createElement(Link, { to: "/marketplace" },
                        React.createElement(PulseButton, { variant: "secondary" }, t('home.secondaryCta')))))) : (React.createElement(React.Fragment, null,
                React.createElement("div", { className: Styles.heroTagline },
                    React.createElement("span", { className: "pulse-dot lime" }),
                    React.createElement("span", { className: "mono" }, t('home.tagline'))),
                React.createElement("h1", { className: `${Styles.heroTitle} display` },
                    t('home.heroTitle'),
                    React.createElement("br", null),
                    React.createElement("span", { className: Styles.titleAccent }, t('home.heroTitleAccent'))),
                React.createElement("p", { className: Styles.heroSubtitle }, t('home.heroSubtitle')),
                React.createElement("div", { className: Styles.ctaRow },
                    React.createElement(Link, { to: "/signup" },
                        React.createElement(PulseButton, { variant: "primary" }, t('nav.signup'))),
                    React.createElement(Link, { to: "/marketplace" },
                        React.createElement(PulseButton, { variant: "secondary" }, t('home.secondaryCta')))))))),
        React.createElement("section", { className: Styles.filterBar },
            React.createElement("div", { className: Styles.filterHeaderRow },
                React.createElement("div", null,
                    React.createElement("div", { className: Styles.eyebrow },
                        "\u25C8 ",
                        t('discover.upcoming')),
                    React.createElement("h2", { className: Styles.sectionTitle },
                        t('discover.horizonA'),
                        ' ',
                        React.createElement("span", { className: Styles.titleAccent }, t('discover.horizonB')),
                        ".")),
                React.createElement("div", { className: Styles.viewToggle }, ['grid', 'list'].map((v) => (React.createElement("button", { key: v, type: "button", className: `${Styles.viewBtn} ${view === v ? Styles.viewBtnActive : ''}`, onClick: () => setView(v) }, v.toUpperCase()))))),
            React.createElement("div", { className: Styles.filterRow },
                React.createElement("input", { type: "search", value: (_f = filters.search) !== null && _f !== void 0 ? _f : '', onChange: (e) => setFilters((f) => (Object.assign(Object.assign({}, f), { search: e.target.value || undefined }))), placeholder: t('nav.search'), className: Styles.searchInput }),
                React.createElement("input", { type: "text", value: (_g = filters.city) !== null && _g !== void 0 ? _g : '', onChange: (e) => setFilters((f) => (Object.assign(Object.assign({}, f), { city: e.target.value || undefined }))), placeholder: t('discover.cityPlaceholder'), className: Styles.cityInput }),
                React.createElement("div", { className: Styles.chipRow }, dateChips.map((c, i) => {
                    var _a, _b;
                    const isActive = ((_a = filters.dateFrom) !== null && _a !== void 0 ? _a : '') === ((_b = c.id.dateFrom) !== null && _b !== void 0 ? _b : '');
                    return (React.createElement("button", { key: i, type: "button", className: `pulse-chip ${isActive ? 'active' : ''} ${Styles.chip}`, onClick: () => setDateChip(c.id) }, c.label));
                })),
                React.createElement("div", { className: Styles.chipRow },
                    React.createElement("button", { type: "button", className: `pulse-chip ${!filters.category ? 'active' : ''} ${Styles.chip}`, onClick: () => setCategory(undefined) }, t('discover.cat.all')),
                    cats.map((c) => (React.createElement("button", { key: c.id, type: "button", className: `pulse-chip ${filters.category === c.slug ? 'active' : ''} ${Styles.chip}`, onClick: () => setCategory(c.slug) }, c.name)))),
                React.createElement("select", { value: (_h = filters.sort) !== null && _h !== void 0 ? _h : 'soonest', onChange: (e) => setFilters((f) => (Object.assign(Object.assign({}, f), { sort: e.target.value }))), className: Styles.sortSelect },
                    React.createElement("option", { value: "soonest" }, t('discover.sort.soonest')),
                    React.createElement("option", { value: "newest" }, t('discover.sort.newest')),
                    React.createElement("option", { value: "priceAsc" }, t('discover.sort.priceAsc')),
                    React.createElement("option", { value: "priceDesc" }, t('discover.sort.priceDesc'))))),
        React.createElement("section", { className: Styles.results },
            error && React.createElement("div", { className: Styles.error }, error),
            items === null && !error && (React.createElement("div", { className: Styles.empty }, t('common.loading'))),
            items !== null && items.length === 0 && !error && (React.createElement("div", { className: Styles.empty },
                React.createElement("h3", { className: Styles.emptyTitle }, t('discover.empty.title')),
                React.createElement("p", { className: Styles.emptyBody }, t('discover.empty.body')))),
            items !== null && items.length > 0 && view === 'grid' && (React.createElement("div", { className: Styles.grid }, rest.map((ev) => (React.createElement(EventCard, { key: ev.id, item: ev }))))),
            items !== null && items.length > 0 && view === 'list' && (React.createElement("div", { className: Styles.list }, rest.map((ev) => (React.createElement(EventRow, { key: ev.id, item: ev }))))))));
};
const EventCard = ({ item }) => {
    const date = item.nextSessionStartsAt
        ? new Date(item.nextSessionStartsAt)
        : null;
    return (React.createElement(Link, { to: `/events/${item.slug}`, className: Styles.card },
        React.createElement("div", { className: Styles.cardCoverWrap },
            item.coverImageUrl ? (React.createElement("img", { src: item.coverImageUrl, alt: item.title, className: Styles.cardCover })) : (React.createElement("div", { className: Styles.cardCoverEmpty }, "NO COVER")),
            React.createElement("div", { className: Styles.cardBadges }, date && (React.createElement("span", { className: Styles.cardDate }, date.toLocaleString(undefined, {
                weekday: 'short',
                month: 'short',
                day: '2-digit',
            })))),
            item.fromPrice !== null && (React.createElement("div", { className: Styles.cardPrice },
                "FROM",
                ' ',
                new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: item.currency,
                    maximumFractionDigits: 0,
                }).format(item.fromPrice / 100)))),
        React.createElement("div", { className: Styles.cardBody },
            item.category && (React.createElement("div", { className: Styles.cardCategory }, item.category.name.toUpperCase())),
            React.createElement("div", { className: Styles.cardTitle }, item.title),
            React.createElement("div", { className: Styles.cardMeta }, item.venue
                ? `${item.venue.name} · ${item.venue.city}`
                : ''))));
};
const EventRow = ({ item }) => {
    const date = item.nextSessionStartsAt
        ? new Date(item.nextSessionStartsAt)
        : null;
    return (React.createElement(Link, { to: `/events/${item.slug}`, className: Styles.row },
        React.createElement("div", { className: Styles.rowDate }, date ? (React.createElement(React.Fragment, null,
            React.createElement("div", { className: Styles.rowDow }, date.toLocaleDateString(undefined, { weekday: 'short' })),
            React.createElement("div", { className: Styles.rowDay }, date.toLocaleDateString(undefined, { day: '2-digit' })),
            React.createElement("div", { className: Styles.rowMonth }, date.toLocaleDateString(undefined, { month: 'short' })))) : (React.createElement("div", { className: Styles.rowDay }, "\u2014"))),
        React.createElement("div", { className: Styles.rowMain },
            item.category && (React.createElement("div", { className: Styles.rowCategory }, item.category.name.toUpperCase())),
            React.createElement("div", { className: Styles.rowTitle }, item.title),
            React.createElement("div", { className: Styles.rowMeta }, item.venue
                ? `${item.venue.name} · ${item.venue.city}`
                : '')),
        React.createElement("div", { className: Styles.rowPrice }, item.fromPrice !== null ? (React.createElement("span", { className: "display" }, new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: item.currency,
            maximumFractionDigits: 0,
        }).format(item.fromPrice / 100))) : (React.createElement("span", { className: "mono", style: { color: '#6b6760' } }, "\u2014")))));
};
export default Home;
