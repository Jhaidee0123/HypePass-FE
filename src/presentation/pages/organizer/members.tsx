import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Styles from './organizer-styles.scss';
import { PulseButton, SeoHelmet } from '@/presentation/components';
import { OrganizerCompanies } from '@/domain/usecases';
import {
  CompanyMembershipModel,
  CompanyMembershipRole,
} from '@/domain/models';

type Props = {
  companies: OrganizerCompanies;
};

const ROLES: CompanyMembershipRole[] = ['owner', 'admin', 'staff'];

const OrganizerMembersPage: React.FC<Props> = ({ companies }) => {
  const { t } = useTranslation();
  const { companyId } = useParams<{ companyId: string }>();
  const [members, setMembers] = useState<CompanyMembershipModel[] | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<CompanyMembershipRole>('staff');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!companyId) return;
    try {
      setError(null);
      setMembers(await companies.listMembers(companyId));
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          t('errors.unexpected'),
      );
    }
  }, [companyId, companies, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const canSubmit =
    !submitting && /^\S+@\S+\.\S+$/.test(email.trim());

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !companyId) return;
    setSubmitting(true);
    setError(null);
    try {
      await companies.addMember(companyId, {
        email: email.trim(),
        role,
      });
      setEmail('');
      await load();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          t('errors.unexpected'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={Styles.page}>
      <SeoHelmet
        title={`HypePass — ${t('organizer.members.title')}`}
        description={t('organizer.members.subtitle')}
      />

      <header className={Styles.header}>
        <div className={Styles.eyebrow}>◆ ORGANIZER</div>
        <h1 className={Styles.title}>{t('organizer.members.title')}</h1>
        <p style={{ color: '#908b83', marginTop: 8, fontSize: 14 }}>
          <Link
            to="/organizer"
            style={{
              color: '#bfbab1',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            ← {t('common.back')}
          </Link>
        </p>
      </header>

      {error && <div className={Styles.error}>{error}</div>}

      <div className={Styles.card}>
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            letterSpacing: '0.14em',
            color: '#6b6760',
            marginBottom: 12,
          }}
        >
          ◆ {t('organizer.members.addTitle').toUpperCase()}
        </div>
        <form
          onSubmit={handleAdd}
          style={{ display: 'grid', gridTemplateColumns: '1fr 160px auto', gap: 10 }}
        >
          <input
            type="email"
            placeholder={t('organizer.members.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: '10px 12px',
              background: '#121110',
              border: '1px solid #242320',
              color: '#faf7f0',
              borderRadius: 4,
              fontSize: 14,
              fontFamily: 'Space Grotesk, system-ui, sans-serif',
              outline: 'none',
            }}
          />
          <select
            value={role}
            onChange={(e) =>
              setRole(e.target.value as CompanyMembershipRole)
            }
            style={{
              padding: '10px 12px',
              background: '#121110',
              border: '1px solid #242320',
              color: '#faf7f0',
              borderRadius: 4,
              fontSize: 14,
              fontFamily: 'Space Grotesk, system-ui, sans-serif',
            }}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {t(`organizer.members.roles.${r}`)}
              </option>
            ))}
          </select>
          <PulseButton type="submit" variant="primary" disabled={!canSubmit}>
            {submitting ? t('common.loading') : t('organizer.members.add')}
          </PulseButton>
        </form>
        <p style={{ fontSize: 12, color: '#6b6760', marginTop: 10 }}>
          {t('organizer.members.addNote')}
        </p>
      </div>

      {members === null ? (
        <div className={Styles.card}>{t('common.loading')}</div>
      ) : members.length === 0 ? (
        <div className={Styles.card}>{t('organizer.members.empty')}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {members.map((m) => (
            <div key={m.id} className={Styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 14, color: '#faf7f0' }}>
                    user {m.userId.slice(0, 12)}…
                  </div>
                  <div
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 11,
                      color: '#d7ff3a',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      marginTop: 4,
                    }}
                  >
                    {t(`organizer.members.roles.${m.role}`)}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#6b6760' }}>
                  {m.createdAt
                    ? new Date(m.createdAt).toLocaleDateString()
                    : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrganizerMembersPage;
