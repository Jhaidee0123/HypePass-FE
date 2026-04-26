import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import Styles from './checkout-styles.scss';
import { PulseButton, currentAccountState } from '@/presentation/components';
import { Checkout, PublicEvents } from '@/domain/usecases';
import {
  InitiateCheckoutResponse,
  PublicEventDetail,
} from '@/domain/models';
import {
  CURRENT_TERMS_VERSION,
  CURRENT_PRIVACY_VERSION,
} from '@/presentation/pages/legal/legal-versions';
import { readReferralForEvent } from '@/presentation/hooks';

type Props = {
  checkout: Checkout;
  publicEvents: PublicEvents;
};

/** Minimal typing for the Wompi WidgetCheckout global. */
declare class WidgetCheckout {
  constructor(config: Record<string, unknown>);
  open(cb: (result: any) => void): void;
}

const formatCOP = (cents: number, currency = 'COP') =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);

import { loadWompiWidget, wompiSafeRedirect } from './wompi-widget';

const CheckoutPage: React.FC<Props> = ({ checkout, publicEvents }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { getCurrentAccount } = useRecoilValue(currentAccountState);
  const account = getCurrentAccount();
  const isAuth = !!account?.session;

  const eventId = params.get('event') ?? '';
  const sessionId = params.get('session') ?? '';
  const sectionId = params.get('section') ?? '';
  const phaseId = params.get('phase') ?? '';
  const qty = Math.max(1, parseInt(params.get('qty') ?? '1', 10));

  const [detail, setDetail] = useState<PublicEventDetail | null>(null);
  const [form, setForm] = useState({
    customerFullName: account?.user?.name ?? '',
    customerEmail: account?.user?.email ?? '',
    customerPhone: '',
    customerLegalIdType: 'CC',
    customerLegalId: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptedConsent, setAcceptedConsent] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    const slug = params.get('slug');
    if (slug) {
      publicEvents
        .getBySlug(slug)
        .then(setDetail)
        .catch(() => undefined);
      return;
    }
    // We don't have slug; fallback: fetch list and find by id
    publicEvents
      .list({ pageSize: 100 })
      .then(async (res) => {
        const match = res.items.find((i) => i.id === eventId);
        if (match) {
          const d = await publicEvents.getBySlug(match.slug);
          setDetail(d);
        }
      })
      .catch(() => undefined);
  }, [eventId, params, publicEvents]);

  const selectedSession = useMemo(
    () => detail?.sessions.find((s) => s.id === sessionId) ?? null,
    [detail, sessionId],
  );
  const selectedSection = useMemo(
    () =>
      selectedSession?.sections.find((s) => s.id === sectionId) ?? null,
    [selectedSession, sectionId],
  );
  const selectedPhase = useMemo(
    () => selectedSection?.phases.find((p) => p.id === phaseId) ?? null,
    [selectedSection, phaseId],
  );

  const unitPrice = selectedPhase?.price ?? 0;
  const serviceFee = selectedPhase?.serviceFee ?? 0;
  const subtotal = unitPrice * qty;
  const serviceTotal = serviceFee * qty;
  const total = subtotal + serviceTotal;
  const currency = selectedPhase?.currency ?? 'COP';

  const canSubmit =
    !!eventId &&
    !!sessionId &&
    !!sectionId &&
    !!phaseId &&
    qty > 0 &&
    !busy &&
    form.customerFullName.trim() !== '' &&
    /^\S+@\S+\.\S+$/.test(form.customerEmail) &&
    form.customerPhone.trim().length >= 7 &&
    form.customerLegalId.trim() !== '' &&
    acceptedConsent;

  const openWidget = async (data: InitiateCheckoutResponse) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setBusy(true);
    try {
      const referralFromUrl = params.get('ref');
      const referralFromStorage = detail?.event.slug
        ? readReferralForEvent(detail.event.slug)
        : null;
      const referralCode = (referralFromUrl ?? referralFromStorage ?? '')
        .trim()
        .toUpperCase()
        .slice(0, 20);
      const payload = {
        eventId,
        eventSessionId: sessionId,
        ticketSectionId: sectionId,
        ticketSalePhaseId: phaseId,
        quantity: qty,
        customerFullName: form.customerFullName,
        customerEmail: form.customerEmail,
        customerPhone: form.customerPhone,
        customerLegalId: form.customerLegalId,
        customerLegalIdType: form.customerLegalIdType,
        acceptedTermsVersion: CURRENT_TERMS_VERSION,
        acceptedPrivacyVersion: CURRENT_PRIVACY_VERSION,
        ...(referralCode ? { referralCode } : {}),
      };
      const data = isAuth
        ? await checkout.initiate(payload)
        : await checkout.initiateGuest(payload);
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

  return (
    <div className={Styles.page}>
      <Helmet>
        <title>HypePass — {t('checkout.title')}</title>
      </Helmet>

      <header className={Styles.header}>
        <button
          type="button"
          className={Styles.backBtn}
          onClick={() => navigate(-1)}
        >
          ← {t('common.back')}
        </button>
        <span className={Styles.secure}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="#d7ff3a"
            strokeWidth="1.5"
            style={{ marginRight: 6, verticalAlign: -2 }}
          >
            <path d="M7 1l5 2v4c0 3-2.5 5-5 6-2.5-1-5-3-5-6V3l5-2z" />
          </svg>
          {t('checkout.secure')}
        </span>
      </header>

      <div className={Styles.layout}>
        {/* LEFT — buyer form */}
        <div className={Styles.left}>
          <div className={Styles.eyebrow}>◆ {t('checkout.step')}</div>
          <h1 className={Styles.title}>
            {isAuth
              ? t('checkout.titleAuth', { name: account?.user?.name ?? '' })
              : t('checkout.titleGuest')}
          </h1>

          {!isAuth && (
            <div className={Styles.guestNotice}>
              <strong>{t('checkout.guest.title')}</strong>{' '}
              {t('checkout.guest.body')}
            </div>
          )}

          <form className={Styles.form} onSubmit={handleSubmit}>
            <Field
              label={t('checkout.fields.fullName')}
              value={form.customerFullName}
              onChange={(v) =>
                setForm((f) => ({ ...f, customerFullName: v }))
              }
              placeholder="María Pérez"
              disabled={isAuth}
              required
            />
            <Field
              label={t('checkout.fields.email')}
              type="email"
              value={form.customerEmail}
              onChange={(v) => setForm((f) => ({ ...f, customerEmail: v }))}
              placeholder="maria@email.com"
              disabled={isAuth}
              required
            />
            <Field
              label={t('checkout.fields.phone')}
              value={form.customerPhone}
              onChange={(v) => setForm((f) => ({ ...f, customerPhone: v }))}
              placeholder="+57 300 123 4567"
              required
            />
            <div className={Styles.docRow}>
              <div className={Styles.docTypeField}>
                <div className={Styles.fieldLabel}>
                  {t('checkout.fields.docType')}
                </div>
                <select
                  value={form.customerLegalIdType}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      customerLegalIdType: e.target.value,
                    }))
                  }
                  className={Styles.input}
                >
                  <option value="CC">CC</option>
                  <option value="CE">CE</option>
                  <option value="NIT">NIT</option>
                  <option value="PP">PP</option>
                  <option value="TI">TI</option>
                </select>
              </div>
              <Field
                className={Styles.docNumField}
                label={t('checkout.fields.docNum')}
                value={form.customerLegalId}
                onChange={(v) =>
                  setForm((f) => ({ ...f, customerLegalId: v }))
                }
                placeholder="1020304050"
                required
              />
            </div>

            <label className={Styles.consent}>
              <input
                type="checkbox"
                checked={acceptedConsent}
                onChange={(e) => setAcceptedConsent(e.target.checked)}
              />
              <span>
                <Trans
                  i18nKey="checkout.consentLabel"
                  components={{
                    terms: (
                      <Link
                        to="/legal/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    ),
                    privacy: (
                      <Link
                        to="/legal/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    ),
                  }}
                />
              </span>
            </label>

            {error && <div className={Styles.error}>{error}</div>}

            <PulseButton
              type="submit"
              variant="primary"
              fullWidth
              disabled={!canSubmit}
            >
              {busy
                ? t('common.loading')
                : t('checkout.pay', { total: formatCOP(total, currency) })}
            </PulseButton>
          </form>
        </div>

        {/* RIGHT — order summary */}
        <aside className={Styles.aside}>
          <div className={Styles.eyebrow}>◆ {t('checkout.order')}</div>
          {detail && selectedSession && selectedSection && selectedPhase ? (
            <>
              <div className={Styles.orderCard}>
                {detail.event.coverImageUrl ? (
                  <img
                    src={detail.event.coverImageUrl}
                    alt=""
                    className={Styles.orderImage}
                  />
                ) : (
                  <div className={`${Styles.orderImage} ${Styles.orderImageEmpty}`}>
                    —
                  </div>
                )}
                <div className={Styles.orderMeta}>
                  <div className={Styles.orderCategory}>
                    {detail.category?.name?.toUpperCase() ?? ''}
                  </div>
                  <div className={Styles.orderTitle}>
                    {detail.event.title}
                  </div>
                  <div className={Styles.orderLine}>
                    {new Date(selectedSession.startsAt).toLocaleString(
                      undefined,
                      {
                        weekday: 'short',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      },
                    )}
                  </div>
                  <div className={Styles.orderLine}>
                    {detail.venue
                      ? `${detail.venue.name} · ${detail.venue.city}`
                      : ''}
                  </div>
                </div>
              </div>

              <div className={Styles.lineItem}>
                <div className={Styles.lineLeft}>
                  <div className={Styles.lineName}>
                    {selectedSection.name}
                  </div>
                  <div className={Styles.linePhase}>
                    {selectedPhase.name} · × {qty}
                  </div>
                </div>
                <div className={Styles.linePrice}>
                  {formatCOP(subtotal, currency)}
                </div>
              </div>

              {serviceFee > 0 && (
                <div className={Styles.lineItem}>
                  <div className={Styles.lineName}>
                    {t('eventDetail.serviceFee')}
                  </div>
                  <div className={Styles.linePrice}>
                    {formatCOP(serviceTotal, currency)}
                  </div>
                </div>
              )}

              <div className={Styles.totalRow}>
                <span>{t('eventDetail.total')}</span>
                <span className={Styles.totalValue}>
                  {formatCOP(total, currency)}
                </span>
              </div>

              <div className={Styles.protected}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="#d7ff3a"
                  strokeWidth="1.5"
                >
                  <path d="M7 1l5 2v4c0 3-2.5 5-5 6-2.5-1-5-3-5-6V3l5-2z" />
                </svg>
                <div>
                  <strong>{t('checkout.protected.title')}</strong>{' '}
                  {t('checkout.protected.body')}
                </div>
              </div>
            </>
          ) : (
            <div className={Styles.loading}>{t('common.loading')}</div>
          )}
        </aside>
      </div>
    </div>
  );
};

type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
};

const Field: React.FC<FieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled,
  required,
  className,
}) => (
  <div className={`${Styles.field} ${className ?? ''}`}>
    <div className={Styles.fieldLabel}>
      {label}
      {required && <span className={Styles.req}>*</span>}
    </div>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={Styles.input}
    />
  </div>
);

export default CheckoutPage;
