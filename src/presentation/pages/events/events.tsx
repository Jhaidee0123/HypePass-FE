import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Styles from './events-styles.scss';
import CardStyles from '@/presentation/components/event-card/event-card-styles.scss';
import {
  EventCard,
  EventRow,
  PulseButton,
  SeoHelmet,
} from '@/presentation/components';
import {
  OrganizerCategories,
  PublicEvents,
  PublicEventsFilters,
} from '@/domain/usecases';
import {
  CategoryModel,
  PublicEventListItem,
  PublicEventListResult,
} from '@/domain/models';

type Props = {
  publicEvents: PublicEvents;
  categories: OrganizerCategories;
};

type DateChipId = 'all' | 'today' | 'weekend' | 'month';

const PAGE_SIZE = 24;

const parseMoneyInput = (raw: string): number | undefined => {
  if (!raw) return undefined;
  const cleaned = raw.replace(/[^\d]/g, '');
  if (cleaned === '') return undefined;
  // FE expresses the form in COP pesos; the BE expects cents.
  return parseInt(cleaned, 10) * 100;
};

const formatMoneyInput = (cents: number | undefined): string => {
  if (cents === undefined) return '';
  return String(Math.round(cents / 100));
};

/** Chip id (today/weekend/month) → concrete dateFrom/dateTo ISO pair. */
const dateRangeFor = (id: DateChipId): {
  dateFrom?: string;
  dateTo?: string;
} => {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  switch (id) {
    case 'today':
      return {
        dateFrom: today.toISOString(),
        dateTo: tomorrow.toISOString(),
      };
    case 'weekend': {
      // Saturday 00:00 → Monday 00:00. Covers the true weekend regardless of
      // the current day of week. If today *is* Sat or Sun, we start from
      // today (not next Saturday) so the user still sees weekend events.
      const dow = today.getDay(); // 0=Sun, 6=Sat
      const daysToSat = dow === 0 ? 6 : dow === 6 ? 0 : 6 - dow;
      const sat = new Date(today);
      sat.setDate(today.getDate() + daysToSat);
      if (dow === 0) {
        // today is Sunday — show today only
        const mon = new Date(today);
        mon.setDate(today.getDate() + 1);
        return {
          dateFrom: today.toISOString(),
          dateTo: mon.toISOString(),
        };
      }
      const mon = new Date(sat);
      mon.setDate(sat.getDate() + 2);
      return { dateFrom: sat.toISOString(), dateTo: mon.toISOString() };
    }
    case 'month': {
      const endOfMonth = new Date(today);
      endOfMonth.setMonth(today.getMonth() + 1);
      endOfMonth.setDate(0);
      endOfMonth.setHours(23, 59, 59, 999);
      return {
        dateFrom: today.toISOString(),
        dateTo: endOfMonth.toISOString(),
      };
    }
    case 'all':
    default:
      return {};
  }
};

/** Which chip id is implied by the current (dateFrom, dateTo) values? */
const chipIdFromRange = (
  dateFrom: string | undefined,
  dateTo: string | undefined,
): DateChipId => {
  if (!dateFrom && !dateTo) return 'all';
  const today = dateRangeFor('today');
  const weekend = dateRangeFor('weekend');
  const month = dateRangeFor('month');
  if (dateFrom === today.dateFrom && dateTo === today.dateTo) return 'today';
  if (dateFrom === weekend.dateFrom && dateTo === weekend.dateTo)
    return 'weekend';
  if (dateFrom === month.dateFrom && dateTo === month.dateTo) return 'month';
  return 'all';
};

const EventsPage: React.FC<Props> = ({ publicEvents, categories }) => {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const [cats, setCats] = useState<CategoryModel[]>([]);
  const [items, setItems] = useState<PublicEventListItem[] | null>(null);
  const [listResult, setListResult] = useState<PublicEventListResult | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const view = (params.get('view') ?? 'grid') as 'grid' | 'list';

  // Hydrate filters from URL every render. Single source of truth = URL.
  const filters: PublicEventsFilters = useMemo(
    () => ({
      search: params.get('q') || undefined,
      city: params.get('city') || undefined,
      category: params.get('category') || undefined,
      dateFrom: params.get('dateFrom') || undefined,
      dateTo: params.get('dateTo') || undefined,
      sort:
        (params.get('sort') as PublicEventsFilters['sort']) || 'soonest',
      onSale: params.get('onSale') === '1' ? true : undefined,
      minPrice: params.get('minPrice')
        ? parseInt(params.get('minPrice') as string, 10)
        : undefined,
      maxPrice: params.get('maxPrice')
        ? parseInt(params.get('maxPrice') as string, 10)
        : undefined,
      page: parseInt(params.get('page') ?? '1', 10),
      pageSize: PAGE_SIZE,
    }),
    [params],
  );

  const activeDateChip = chipIdFromRange(filters.dateFrom, filters.dateTo);

  useEffect(() => {
    categories.list().then(setCats).catch(() => undefined);
  }, [categories]);

  useEffect(() => {
    setError(null);
    if ((filters.page ?? 1) === 1) {
      setItems(null);
      setListResult(null);
    }
    publicEvents
      .list(filters)
      .then((res) => {
        setListResult(res);
        setItems((prev) =>
          (filters.page ?? 1) === 1
            ? res.items
            : [...(prev ?? []), ...res.items],
        );
      })
      .catch((err) =>
        setError(
          err?.response?.data?.message ??
            err?.message ??
            t('errors.unexpected'),
        ),
      )
      .finally(() => setLoadingMore(false));
  }, [
    filters.search,
    filters.city,
    filters.category,
    filters.dateFrom,
    filters.dateTo,
    filters.sort,
    filters.onSale,
    filters.minPrice,
    filters.maxPrice,
    filters.page,
    publicEvents,
    t,
  ]);

  /** Write a patch to the URL, resetting page to 1 unless explicitly set. */
  const patchParams = useCallback(
    (patch: Record<string, string | undefined | null>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(patch)) {
            if (v === undefined || v === null || v === '') next.delete(k);
            else next.set(k, v);
          }
          // Any filter change resets pagination unless the patch touches page.
          if (!('page' in patch)) next.delete('page');
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const setDateChip = (id: DateChipId) => {
    const r = dateRangeFor(id);
    patchParams({
      dateFrom: r.dateFrom,
      dateTo: r.dateTo,
    });
  };

  const hasMore =
    listResult !== null &&
    items !== null &&
    items.length < listResult.total;

  const loadMore = () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    patchParams({ page: String((filters.page ?? 1) + 1) });
  };

  const clearAll = () => setParams({}, { replace: true });

  // Active-filter pills (so users can see what's applied and remove items quickly)
  const activeFilters: Array<{ label: string; onRemove: () => void }> = [];
  if (filters.search)
    activeFilters.push({
      label: `"${filters.search}"`,
      onRemove: () => patchParams({ q: undefined }),
    });
  if (filters.city)
    activeFilters.push({
      label: filters.city,
      onRemove: () => patchParams({ city: undefined }),
    });
  if (filters.category) {
    const cat = cats.find((c) => c.slug === filters.category);
    activeFilters.push({
      label: cat?.name ?? filters.category,
      onRemove: () => patchParams({ category: undefined }),
    });
  }
  if (activeDateChip !== 'all')
    activeFilters.push({
      label: t(`events.date.${activeDateChip}`),
      onRemove: () =>
        patchParams({ dateFrom: undefined, dateTo: undefined }),
    });
  if (filters.onSale)
    activeFilters.push({
      label: t('events.filters.onSale'),
      onRemove: () => patchParams({ onSale: undefined }),
    });
  if (filters.minPrice !== undefined)
    activeFilters.push({
      label: `≥ ${formatMoneyInput(filters.minPrice)}`,
      onRemove: () => patchParams({ minPrice: undefined }),
    });
  if (filters.maxPrice !== undefined)
    activeFilters.push({
      label: `≤ ${formatMoneyInput(filters.maxPrice)}`,
      onRemove: () => patchParams({ maxPrice: undefined }),
    });

  // SEO — bake city/category into title when set, helps shareability
  const seoTitle = useMemo(() => {
    const parts: string[] = [t('events.seoBase')];
    if (filters.city) parts.push(filters.city);
    if (filters.category) {
      const cat = cats.find((c) => c.slug === filters.category);
      parts.push(cat?.name ?? filters.category);
    }
    return `HypePass — ${parts.join(' · ')}`;
  }, [filters.city, filters.category, cats, t]);

  return (
    <div className={Styles.page}>
      <SeoHelmet
        title={seoTitle}
        description={t('events.seoDescription')}
        type="website"
      />

      {/* HERO */}
      <section className={Styles.hero}>
        <div className={Styles.eyebrow}>
          <span className="pulse-bulb" aria-hidden="true" />
          {t('events.eyebrow')}
        </div>
        <h1 className={Styles.title}>
          {t('events.titleA')}{' '}
          <span className={Styles.titleAccent}>{t('events.titleB')}</span>
        </h1>
        <p className={Styles.subtitle}>{t('events.subtitle')}</p>
        <div className={Styles.count}>
          {listResult ? (
            <>
              <span className={Styles.countStrong}>{listResult.total}</span>{' '}
              {t('events.resultsCount', { count: listResult.total })}
            </>
          ) : (
            t('common.loading')
          )}
        </div>
      </section>

      {/* STICKY FILTER BAR */}
      <section className={Styles.filterBar}>
        <div className={Styles.filterInner}>
          <div className={Styles.primaryRow}>
            <input
              type="search"
              value={filters.search ?? ''}
              onChange={(e) =>
                patchParams({ q: e.target.value || undefined })
              }
              placeholder={t('nav.search')}
              className={Styles.searchInput}
            />
            <input
              type="text"
              value={filters.city ?? ''}
              onChange={(e) =>
                patchParams({ city: e.target.value || undefined })
              }
              placeholder={t('discover.cityPlaceholder')}
              className={Styles.cityInput}
            />
            <select
              value={filters.sort ?? 'soonest'}
              onChange={(e) => patchParams({ sort: e.target.value })}
              className={Styles.sortSelect}
            >
              <option value="soonest">{t('discover.sort.soonest')}</option>
              <option value="newest">{t('discover.sort.newest')}</option>
              <option value="priceAsc">{t('discover.sort.priceAsc')}</option>
              <option value="priceDesc">
                {t('discover.sort.priceDesc')}
              </option>
            </select>
            <div className={Styles.viewToggle}>
              {(['grid', 'list'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`${Styles.viewBtn} ${view === v ? Styles.viewBtnActive : ''}`}
                  onClick={() => patchParams({ view: v, page: undefined })}
                >
                  {v.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className={Styles.chipsRow}>
            <span className={Styles.chipGroupLabel}>
              {t('events.filters.date')}
            </span>
            {(['all', 'today', 'weekend', 'month'] as DateChipId[]).map(
              (id) => (
                <button
                  key={id}
                  type="button"
                  className={`pulse-chip ${activeDateChip === id ? 'active' : ''} ${Styles.chip}`}
                  onClick={() => setDateChip(id)}
                >
                  {t(`events.date.${id}`)}
                </button>
              ),
            )}

            <span className={Styles.chipGroupDivider} aria-hidden="true" />

            <span className={Styles.chipGroupLabel}>
              {t('events.filters.category')}
            </span>
            <button
              type="button"
              className={`pulse-chip ${!filters.category ? 'active' : ''} ${Styles.chip}`}
              onClick={() => patchParams({ category: undefined })}
            >
              {t('discover.cat.all')}
            </button>
            {cats.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`pulse-chip ${filters.category === c.slug ? 'active' : ''} ${Styles.chip}`}
                onClick={() => patchParams({ category: c.slug })}
              >
                {c.name}
              </button>
            ))}
          </div>

          <button
            type="button"
            className={Styles.advancedToggle}
            onClick={() => setAdvancedOpen((o) => !o)}
            aria-expanded={advancedOpen}
          >
            {advancedOpen ? '− ' : '+ '}
            {t('events.filters.advanced')}
          </button>

          {advancedOpen && (
            <div className={Styles.advancedPanel}>
              <div className={Styles.advancedField}>
                <label className={Styles.advancedLabel}>
                  {t('events.filters.minPrice')}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  className={Styles.advancedInput}
                  value={formatMoneyInput(filters.minPrice)}
                  onChange={(e) => {
                    const cents = parseMoneyInput(e.target.value);
                    patchParams({
                      minPrice: cents !== undefined ? String(cents) : undefined,
                    });
                  }}
                />
              </div>
              <div className={Styles.advancedField}>
                <label className={Styles.advancedLabel}>
                  {t('events.filters.maxPrice')}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="1000000"
                  className={Styles.advancedInput}
                  value={formatMoneyInput(filters.maxPrice)}
                  onChange={(e) => {
                    const cents = parseMoneyInput(e.target.value);
                    patchParams({
                      maxPrice: cents !== undefined ? String(cents) : undefined,
                    });
                  }}
                />
              </div>
              <div
                className={`${Styles.advancedField} ${Styles.onSaleRow}`}
              >
                <input
                  id="onSaleToggle"
                  type="checkbox"
                  checked={!!filters.onSale}
                  onChange={(e) =>
                    patchParams({
                      onSale: e.target.checked ? '1' : undefined,
                    })
                  }
                />
                <label
                  htmlFor="onSaleToggle"
                  className={Styles.onSaleLabel}
                >
                  {t('events.filters.onSale')}
                </label>
              </div>
            </div>
          )}

          {activeFilters.length > 0 && (
            <div className={Styles.activeRow}>
              {activeFilters.map((a, i) => (
                <button
                  key={i}
                  type="button"
                  className={Styles.activePill}
                  onClick={a.onRemove}
                  aria-label={t('common.remove')}
                >
                  {a.label} ✕
                </button>
              ))}
              <button
                type="button"
                className={Styles.clearAll}
                onClick={clearAll}
              >
                {t('events.filters.clearAll')}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* RESULTS */}
      <section className={Styles.results}>
        {error && <div className={Styles.error}>{error}</div>}

        {items === null && !error && (
          <div className={Styles.empty}>{t('common.loading')}</div>
        )}

        {items !== null && items.length === 0 && !error && (
          <div className={Styles.empty}>
            <h3 className={Styles.emptyTitle}>
              {t('events.empty.title')}
            </h3>
            <p className={Styles.emptyBody}>{t('events.empty.body')}</p>
          </div>
        )}

        {items !== null && items.length > 0 && view === 'grid' && (
          <div className={CardStyles.grid}>
            {items.map((ev) => (
              <EventCard key={ev.id} item={ev} />
            ))}
          </div>
        )}

        {items !== null && items.length > 0 && view === 'list' && (
          <div className={CardStyles.list}>
            {items.map((ev) => (
              <EventRow key={ev.id} item={ev} />
            ))}
          </div>
        )}

        {items !== null && items.length > 0 && (
          <div className={Styles.loadMore}>
            {hasMore ? (
              <PulseButton
                type="button"
                variant="secondary"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore
                  ? t('common.loading')
                  : t('discover.loadMore', {
                      count: items.length,
                      total: listResult?.total ?? items.length,
                    })}
              </PulseButton>
            ) : listResult && items.length > 1 ? (
              <div className={Styles.allLoaded}>
                {t('discover.allLoaded', { count: items.length })}
              </div>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
};

export default EventsPage;
