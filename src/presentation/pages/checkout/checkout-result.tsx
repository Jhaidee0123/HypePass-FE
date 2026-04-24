import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import Styles from './checkout-result-styles.scss';
import { PulseButton, currentAccountState } from '@/presentation/components';
import { Checkout } from '@/domain/usecases';
import { VerifyPaymentResult } from '@/domain/models';

type Props = {
  checkout: Checkout;
};

const formatCOP = (cents: number, currency = 'COP') =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);

const CheckoutResult: React.FC<Props> = ({ checkout }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const ref = params.get('ref');
  const { getCurrentAccount } = useRecoilValue(currentAccountState);
  const isAuth = !!getCurrentAccount()?.session;

  const [result, setResult] = useState<VerifyPaymentResult | null>(null);
  const [polling, setPolling] = useState(true);
  const attempts = useRef(0);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    setPolling(false);
    if (interval.current) {
      clearInterval(interval.current);
      interval.current = null;
    }
  };

  useEffect(() => {
    if (!ref) {
      navigate('/');
      return;
    }
    const poll = async () => {
      try {
        const data = await checkout.verify(ref);
        setResult(data);
        if (data.status === 'completed' || data.status === 'failed') {
          stop();
          return;
        }
      } catch {
        /* swallow; retry */
      }
      attempts.current += 1;
      if (attempts.current >= 20) stop();
    };

    void poll();
    interval.current = setInterval(poll, 3000);
    return () => stop();
  }, [ref, checkout, navigate]);

  const status = result?.status ?? 'pending';
  const isSuccess = status === 'completed';
  const isFailed = status === 'failed';

  return (
    <div className={Styles.page}>
      <Helmet>
        <title>HypePass — {t('checkout.result.title')}</title>
      </Helmet>

      <div className={Styles.card}>
        {!result ? (
          <>
            <div className={Styles.spinner} />
            <h1 className={Styles.title}>{t('checkout.result.verifying')}</h1>
            <p className={Styles.sub}>
              {t('checkout.result.verifyingBody')}
            </p>
          </>
        ) : isSuccess ? (
          <>
            <div className={`${Styles.badge} ${Styles.badgeSuccess}`}>
              {t('checkout.result.approved')}
            </div>
            <h1 className={Styles.title}>
              {t('checkout.result.successTitle')}
            </h1>
            <p className={Styles.sub}>
              {t('checkout.result.successBody', {
                count: result.ticketIds.length,
              })}
            </p>
            <div className={Styles.details}>
              <Row label={t('checkout.result.reference')} value={result.reference} />
              <Row
                label={t('checkout.result.total')}
                value={formatCOP(result.amount, result.currency)}
              />
              <Row
                label={t('checkout.result.tickets')}
                value={String(result.ticketIds.length)}
              />
            </div>
            <div className={Styles.actions}>
              {isAuth ? (
                <PulseButton
                  variant="primary"
                  onClick={() => navigate('/wallet')}
                >
                  {t('checkout.result.openWallet')}
                </PulseButton>
              ) : (
                <PulseButton
                  variant="primary"
                  onClick={() => navigate('/login')}
                >
                  {t('checkout.result.signInToWallet')}
                </PulseButton>
              )}
              <PulseButton variant="secondary" onClick={() => navigate('/')}>
                {t('checkout.result.keepBrowsing')}
              </PulseButton>
            </div>
          </>
        ) : isFailed ? (
          <>
            <div className={`${Styles.badge} ${Styles.badgeFail}`}>
              {t('checkout.result.rejected')}
            </div>
            <h1 className={Styles.title}>
              {t('checkout.result.failedTitle')}
            </h1>
            <p className={Styles.sub}>
              {t('checkout.result.failedBody')}
            </p>
            <div className={Styles.details}>
              <Row
                label={t('checkout.result.reference')}
                value={result.reference}
              />
            </div>
            <div className={Styles.actions}>
              <PulseButton
                variant="primary"
                onClick={() => navigate(-1)}
              >
                {t('checkout.result.retry')}
              </PulseButton>
              <PulseButton variant="secondary" onClick={() => navigate('/')}>
                {t('checkout.result.keepBrowsing')}
              </PulseButton>
            </div>
          </>
        ) : (
          <>
            <div className={`${Styles.badge} ${Styles.badgePending}`}>
              {t('checkout.result.pending')}
            </div>
            <h1 className={Styles.title}>
              {t('checkout.result.pendingTitle')}
            </h1>
            <p className={Styles.sub}>
              {polling
                ? t('checkout.result.pendingBody')
                : t('checkout.result.pendingTimeout')}
            </p>
            <div className={Styles.details}>
              <Row
                label={t('checkout.result.reference')}
                value={result.reference}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className={Styles.detailRow}>
    <span className={Styles.detailLabel}>{label}</span>
    <span className={Styles.detailValue}>{value}</span>
  </div>
);

export default CheckoutResult;
