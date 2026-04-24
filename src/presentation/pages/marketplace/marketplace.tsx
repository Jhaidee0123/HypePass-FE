import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Styles from './marketplace-styles.scss';
import { SeoHelmet } from '@/presentation/components';
import { Marketplace } from '@/domain/usecases';
import { PublicResaleListingView } from '@/domain/models';

type Props = {
  marketplace: Marketplace;
};

const fmt = (minor: number, currency: string) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(minor / 100);

const MarketplacePage: React.FC<Props> = ({ marketplace }) => {
  const { t } = useTranslation();
  const [items, setItems] = useState<PublicResaleListingView[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'soonest' | 'priceAsc' | 'priceDesc'>(
    'soonest',
  );

  useEffect(() => {
    marketplace
      .listActive()
      .then(setItems)
      .catch((err) =>
        setError(
          err?.response?.data?.message ??
            err?.message ??
            t('errors.unexpected'),
        ),
      );
  }, [marketplace, t]);

  const visible = useMemo(() => {
    if (!items) return null;
    const q = search.trim().toLowerCase();
    const filtered = q
      ? items.filter(
          (v) =>
            v.event.title.toLowerCase().includes(q) ||
            v.section.name.toLowerCase().includes(q),
        )
      : items;
    const sorted = [...filtered];
    if (sort === 'priceAsc')
      sorted.sort((a, b) => a.listing.askPrice - b.listing.askPrice);
    else if (sort === 'priceDesc')
      sorted.sort((a, b) => b.listing.askPrice - a.listing.askPrice);
    else
      sorted.sort(
        (a, b) =>
          new Date(a.session.startsAt).getTime() -
          new Date(b.session.startsAt).getTime(),
      );
    return sorted;
  }, [items, search, sort]);

  return (
    <div className={Styles.page}>
      <SeoHelmet
        title={`HypePass — ${t('marketplace.title')}`}
        description={t('marketplace.subtitle')}
        type="website"
      />

      <header className={Styles.hero}>
        <div className={Styles.eyebrow}>◆ {t('marketplace.eyebrow')}</div>
        <h1 className={Styles.title}>{t('marketplace.title')}</h1>
        <p className={Styles.subtitle}>{t('marketplace.subtitle')}</p>
      </header>

      {error && <div className={Styles.error}>{error}</div>}

      {items !== null && items.length > 0 && (
        <div className={Styles.filterBar}>
          <input
            type="search"
            className={Styles.filterInput}
            placeholder={t('marketplace.filter.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className={Styles.filterSelect}
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
          >
            <option value="soonest">{t('marketplace.filter.soonest')}</option>
            <option value="priceAsc">{t('marketplace.filter.priceAsc')}</option>
            <option value="priceDesc">
              {t('marketplace.filter.priceDesc')}
            </option>
          </select>
        </div>
      )}

      {!error && items === null && (
        <div className={Styles.empty}>{t('common.loading')}</div>
      )}

      {items && items.length === 0 && (
        <div className={Styles.empty}>{t('marketplace.empty')}</div>
      )}

      {visible && visible.length === 0 && items && items.length > 0 && (
        <div className={Styles.empty}>
          {t('marketplace.filter.noMatches')}
        </div>
      )}

      {visible && visible.length > 0 && (
        <div className={Styles.grid}>
          {visible.map((view) => (
            <Link
              key={view.listing.id}
              to={`/marketplace/listings/${view.listing.id}`}
              className={Styles.card}
            >
              {view.event.coverImageUrl ? (
                <img
                  src={view.event.coverImageUrl}
                  alt={view.event.title}
                  className={Styles.cardImage}
                />
              ) : (
                <div className={Styles.cardImage} />
              )}
              <div className={Styles.cardBody}>
                <div className={Styles.cardCategory}>
                  {new Date(view.session.startsAt).toLocaleString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: '2-digit',
                  })}
                </div>
                <h3 className={Styles.cardTitle}>{view.event.title}</h3>
                <div className={Styles.cardMeta}>{view.section.name}</div>
                <div className={Styles.priceRow}>
                  <div>
                    <div className={Styles.priceLabel}>
                      {t('marketplace.priceLabel')}
                    </div>
                    <div className={Styles.priceValue}>
                      {fmt(view.listing.askPrice, view.listing.currency)}
                    </div>
                  </div>
                  <div className={Styles.faceValue}>
                    {t('marketplace.faceValue')}:{' '}
                    {fmt(view.ticketFaceValue, view.listing.currency)}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
