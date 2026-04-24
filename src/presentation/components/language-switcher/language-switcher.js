import React from 'react';
import { useTranslation } from 'react-i18next';
import Styles from './language-switcher-styles.scss';
import { LANGUAGES, setLanguage } from "../../../main/i18n/i18n";
const LanguageSwitcher = () => {
    var _a, _b;
    const { i18n } = useTranslation();
    const current = ((_b = (_a = i18n.resolvedLanguage) !== null && _a !== void 0 ? _a : i18n.language) !== null && _b !== void 0 ? _b : 'es').slice(0, 2);
    return (React.createElement("div", { className: Styles.group, role: "group", "aria-label": "Language selector" }, LANGUAGES.map((lng) => (React.createElement("button", { key: lng, type: "button", className: `${Styles.option} ${current === lng ? Styles.active : ''}`, onClick: () => setLanguage(lng), "aria-pressed": current === lng }, lng.toUpperCase())))));
};
export default LanguageSwitcher;
