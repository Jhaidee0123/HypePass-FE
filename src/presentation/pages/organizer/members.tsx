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

// 'owner' is excluded from the dropdown — there's always exactly one
// owner (the creator) and the BE doesn't allow creating extra ones via
// the invite flow.
const ROLES: CompanyMembershipRole[] = ['admin', 'viewer'];

const OrganizerMembersPage: React.FC<Props> = ({ companies }) => {
  const { t } = useTranslation();
  const { companyId } = useParams<{ companyId: string }>();
  const [members, setMembers] = useState<CompanyMembershipModel[] | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<CompanyMembershipRole>('viewer');
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

      <details
        open
        style={{
          marginBottom: 14,
          padding: '16px 20px',
          background: '#121110',
          border: '1px solid #242320',
          borderRadius: 6,
          fontSize: 13,
          lineHeight: 1.6,
          color: '#bfbab1',
        }}
      >
        <summary
          style={{
            cursor: 'pointer',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#d7ff3a',
            outline: 'none',
            marginBottom: 4,
          }}
        >
          ◆ {t('organizer.members.rolesGuide.title')}
        </summary>
        <div
          style={{
            marginTop: 14,
            padding: '10px 12px',
            background: 'rgba(255, 180, 84, 0.08)',
            border: '1px solid rgba(255, 180, 84, 0.25)',
            borderRadius: 4,
            color: '#ffd9a8',
            fontSize: 12,
            lineHeight: 1.5,
          }}
        >
          {t('organizer.members.rolesGuide.intro')}
        </div>
        <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
          <RoleGuideRow
            badge="OWNER"
            color="#d7ff3a"
            text={t('organizer.members.rolesGuide.owner')}
          />
          <RoleGuideRow
            badge="ADMIN"
            color="#5eeac7"
            text={t('organizer.members.rolesGuide.admin')}
          />
          <RoleGuideRow
            badge="VIEWER"
            color="#bfbab1"
            text={t('organizer.members.rolesGuide.viewer')}
          />
        </div>
      </details>

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
          {members.map((m) => {
            const initials = (m.name ?? m.email ?? 'U')
              .split(/[\s@.]/)
              .filter(Boolean)
              .slice(0, 2)
              .map((s) => s[0]?.toUpperCase() ?? '')
              .join('');
            return (
              <div key={m.id} className={Styles.card}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    justifyContent: 'space-between',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: '#1a1917',
                        border: '1px solid #34312c',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 12,
                        letterSpacing: '0.06em',
                        color: '#d7ff3a',
                        flexShrink: 0,
                      }}
                    >
                      {initials}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 15,
                          color: '#faf7f0',
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {m.name && m.name !== '(unknown)'
                          ? m.name
                          : t('organizer.members.unknownName')}
                      </div>
                      <div
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: 12,
                          color: '#bfbab1',
                          marginTop: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {m.email && m.email !== '(unknown)'
                          ? m.email
                          : t('organizer.members.unknownEmail')}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: 4,
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 10,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: 3,
                        background:
                          m.role === 'owner'
                            ? 'rgba(215, 255, 58, 0.15)'
                            : m.role === 'admin'
                              ? 'rgba(94, 234, 199, 0.12)'
                              : 'rgba(191, 186, 177, 0.08)',
                        color:
                          m.role === 'owner'
                            ? '#d7ff3a'
                            : m.role === 'admin'
                              ? '#5eeac7'
                              : '#bfbab1',
                      }}
                    >
                      {t(`organizer.members.roles.${m.role}`)}
                    </span>
                    {m.createdAt && (
                      <span
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: 10,
                          color: '#6b6760',
                        }}
                      >
                        {new Date(m.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const RoleGuideRow: React.FC<{
  badge: string;
  color: string;
  text: string;
}> = ({ badge, color, text }) => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
    <span
      style={{
        flexShrink: 0,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10,
        letterSpacing: '0.14em',
        padding: '4px 8px',
        borderRadius: 3,
        background: `${color}1a`,
        color,
        minWidth: 64,
        textAlign: 'center',
        fontWeight: 600,
      }}
    >
      {badge}
    </span>
    <span style={{ flex: 1 }}>{text}</span>
  </div>
);

export default OrganizerMembersPage;
