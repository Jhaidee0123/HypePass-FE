import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import Styles from './listing-detail-styles.scss';
import {
  PulseButton,
  SeoHelmet,
  currentAccountState,
} from '@/presentation/components';
import { Marketplace } from '@/domain/usecases';
import {
  InitiateResaleCheckoutResponse,
  PublicResaleListingView,
} from '@/domain/models';
import {
  loadWompiWidget,
  wompiSafeRedirect,
} from '../checkout/wompi-widget';

type Props = {
  marketplace: Marketplace;
};

const fmt = (minor: number, currency: string) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(minor / 100);

const ListingDetailPage: React.FC<Props> = ({ marketplace }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { listingId } = useParams<{ listingId: string }>();
  const { getCurrentAccount } = useRecoilValue(currentAccountState);
  const account = getCurrentAccount();
  const isAuth = !!account?.session;

  const [view, setView] = useState<PublicResaleListingView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    buyerFullName: account?.user?.name ?? '',
    buyerEmail: account?.user?.email ?? '',
    buyerPhone: '',
    buyerLegalIdType: 'CC',
    buyerLegalId: '',
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!listingId) return;
    marketplace
      .getListing(listingId)
      .then(setView)
      .catch((err) =>
        setError(
          err?.response?.data?.message ??
            err?.message ??
            t('errors.unexpected'),
        ),
      );
  }, [listingId, marketplace, t]);

  const openWidget = async (data: InitiateResaleCheckoutResponse) => {
    try {
      await loadWompiWidget();
    } catch {
      setError(t('checkout.errorWompiLoad'));
      setBusy(false);
      return;
    }
    const widget = new (window as any).WidgetCheckout({
      currency: data.currency,
      amountInCents: data.amountInCents,
      reference: data.reference,
      publicKey: data.publicKey,
      signature: { integrity: data.signature },
      redirectUrl: wompiSafeRedirect(
        `${window.location.origin}/checkout/result?ref=${data.reference}`,
      ),
      customerData: {
        email: data.customerEmail,
        fullName: data.customerFullName,
        phoneNumber: data.customerPhone,
        phoneNumberPrefix: '+57',
        legalId: data.customerLegalId,
        legalIdType: data.customerLegalIdType,
      },
    });
    widget.open((result: any) => {
      const ref = result?.transaction?.reference ?? data.reference;
      navigate(`/checkout/result?ref=${ref}`);
    });
  };

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuth || !listingId || busy) return;
    setBusy(true);
    setError(null);
    try {
      const data = await marketplace.initiateCheckout({
        listingId,
        buyerFullName: form.buyerFullName,
        buyerEmail: form.buyerEmail,
        buyerPhone: form.buyerPhone || undefined,
        buyerLegalId: form.buyerLegalId || undefined,
        buyerLegalIdType: form.buyerLegalIdType || undefined,
      });
      await openWidget(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          t('errors.unexpected'),
      );
      setBusy(false);
    }
  };

  if (error && !view) {
    return (
      <div className={Styles.page}>
        <Link to="/marketplace" className={Styles.backLink}>
          ← {t('marketplace.title')}
        </Link>
        <div className={Styles.error}>{error}</div>
      </div>
    );
  }
  if (!view) {
    return <div className={Styles.page}>{t('common.loading')}</div>;
  }

  const canSubmit =
    isAuth &&
    !busy &&
    form.buyerFullName.trim() !== '' &&
    /^\S+@\S+\.\S+$/.test(form.buyerEmail);

  return (
    <div className={Styles.page}>
      <SeoHelmet
        title={`HypePass — ${view.event.title}`}
        description={t('marketplace.detail.eyebrow')}
        image={view.event.coverImageUrl ?? undefined}
        type="event"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: view.event.title,
          startDate: view.session.startsAt,
          endDate: view.session.endsAt,
          eventStatus: 'https://schema.org/EventScheduled',
          eventAttendanceMode:
            'https://schema.org/OfflineEventAttendanceMode',
          offers: {
            '@type': 'Offer',
            priceCurrency: view.listing.currency,
            price: (view.listing.askPrice / 100).toFixed(2),
            availability: 'https://schema.org/InStock',
            url:
              typeof window !== 'undefined'
                ? window.location.href
                : undefined,
          },
        }}
      />

      <Link to="/marketplace" className={Styles.backLink}>
        ← {t('marketplace.title')}
      </Link>

      <div className={Styles.layout}>
        <div>
          {view.event.coverImageUrl ? (
            <img
              src={view.event.coverImageUrl}
              alt={view.event.title}
              className={Styles.cover}
            />
          ) : (
            <div className={Styles.cover} />
          )}
          <div className={Styles.eyebrow}>
            ◆ {t('marketplace.detail.eyebrow')}
          </div>
          <h1 className={Styles.title}>{view.event.title}</h1>
          <div className={Styles.meta}>
            {new Date(view.session.startsAt).toLocaleString(undefined, {
              weekday: 'long',
              month: 'short',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
          <div className={Styles.meta}>
            {t('marketplace.detail.section')}: <strong>{view.section.name}</strong>
          </div>
          {view.listing.note && (
            <div className={Styles.note}>"{view.listing.note}"</div>
          )}
        </div>

        <aside className={Styles.aside}>
          <div className={Styles.priceBlock}>
            <div className={Styles.priceLabel}>
              {t('marketplace.detail.price')}
            </div>
            <div className={Styles.priceValue}>
              {fmt(view.listing.askPrice, view.listing.currency)}
            </div>
            <div className={Styles.priceFace}>
              {t('marketplace.faceValue')}:{' '}
              {fmt(view.ticketFaceValue, view.listing.currency)}
            </div>
          </div>

          {!isAuth ? (
            <div className={Styles.guestNotice}>
              <strong>{t('marketplace.detail.loginRequired.title')}</strong>
              {t('marketplace.detail.loginRequired.body')}
              <div style={{ marginTop: 10 }}>
                <PulseButton
                  variant="primary"
                  fullWidth
                  onClick={() =>
                    navigate(`/login?next=/marketplace/listings/${listingId}`)
                  }
                >
                  {t('auth.signIn')}
                </PulseButton>
              </div>
            </div>
          ) : (
            <form className={Styles.form} onSubmit={handleBuy}>
              <div className={Styles.field}>
                <label className={Styles.label}>
                  {t('checkout.fields.fullName')}
                </label>
                <input
                  className={Styles.input}
                  value={form.buyerFullName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, buyerFullName: e.target.value }))
                  }
                  required
                  disabled={busy}
                />
              </div>
              <div className={Styles.field}>
                <label className={Styles.label}>
                  {t('checkout.fields.email')}
                </label>
                <input
                  className={Styles.input}
                  type="email"
                  value={form.buyerEmail}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, buyerEmail: e.target.value }))
                  }
                  required
                  disabled={busy}
                />
              </div>
              <div className={Styles.field}>
                <label className={Styles.label}>
                  {t('checkout.fields.phone')}
                </label>
                <input
                  className={Styles.input}
                  value={form.buyerPhone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, buyerPhone: e.target.value }))
                  }
                  placeholder="+57 300 123 4567"
                  disabled={busy}
                />
              </div>
              <div className={Styles.docRow}>
                <div className={Styles.field}>
                  <label className={Styles.label}>
                    {t('checkout.fields.docType')}
                  </label>
                  <select
                    className={Styles.input}
                    value={form.buyerLegalIdType}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        buyerLegalIdType: e.target.value,
                      }))
                    }
                    disabled={busy}
                  >
                    <option value="CC">CC</option>
                    <option value="CE">CE</option>
                    <option value="PP">PP</option>
                    <option value="NIT">NIT</option>
                  </select>
                </div>
                <div className={Styles.field}>
                  <label className={Styles.label}>
                    {t('checkout.fields.docNum')}
                  </label>
                  <input
                    className={Styles.input}
                    value={form.buyerLegalId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, buyerLegalId: e.target.value }))
                    }
                    disabled={busy}
                  />
                </div>
              </div>

              {error && <div className={Styles.error}>{error}</div>}

              <PulseButton
                type="submit"
                variant="primary"
                fullWidth
                disabled={!canSubmit}
              >
                {busy
                  ? t('common.loading')
                  : t('marketplace.detail.buy', {
                      total: fmt(view.listing.askPrice, view.listing.currency),
                    })}
              </PulseButton>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
};

export default ListingDetailPage;
