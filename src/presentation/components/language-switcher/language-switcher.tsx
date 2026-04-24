import React from 'react';
import { useTranslation } from 'react-i18next';
import Styles from './language-switcher-styles.scss';
import { LANGUAGES, Language, setLanguage } from '@/main/i18n/i18n';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const current = (i18n.resolvedLanguage ?? i18n.language ?? 'es').slice(
    0,
    2,
  ) as Language;

  return (
    <div
      className={Styles.group}
      role="group"
      aria-label="Language selector"
    >
      {LANGUAGES.map((lng) => (
        <button
          key={lng}
          type="button"
          className={`${Styles.option} ${current === lng ? Styles.active : ''}`}
          onClick={() => setLanguage(lng)}
          aria-pressed={current === lng}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
