import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Styles from './platform-settings-styles.scss';
import {
  AdminPlatformSettings,
  PlatformSettingGroup,
  PlatformSettingRow,
} from '@/domain/usecases';

type Props = {
  settings: AdminPlatformSettings;
};

const GROUP_ORDER: PlatformSettingGroup[] = [
  'announcements',
  'kill_switches',
  'commerce',
  'qr',
  'curation',
];

const PlatformSettingsPage: React.FC<Props> = ({ settings }) => {
  const { t } = useTranslation();
  const [rows, setRows] = useState<PlatformSettingRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, unknown>>({});

  const load = async () => {
    setError(null);
    try {
      const list = await settings.list();
      setRows(list);
      setDrafts({});
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? t('errors.unexpected'),
      );
    }
  };

  useEffect(() => {
    void load();
  }, [settings]);

  const grouped = useMemo(() => {
    if (!rows) return null;
    const map = new Map<PlatformSettingGroup, PlatformSettingRow[]>();
    for (const r of rows) {
      const list = map.get(r.group) ?? [];
      list.push(r);
      map.set(r.group, list);
    }
    return GROUP_ORDER.map((g) => ({ group: g, items: map.get(g) ?? [] }))
      .filter((b) => b.items.length > 0);
  }, [rows]);

  const setDraft = (key: string, value: unknown) => {
    setDrafts((prev) => ({ ...prev, [key]: value }));
  };

  const isDirty = (row: PlatformSettingRow) =>
    Object.prototype.hasOwnProperty.call(drafts, row.key) &&
    JSON.stringify(drafts[row.key]) !== JSON.stringify(row.value);

  const save = async (row: PlatformSettingRow) => {
    if (!isDirty(row)) return;
    setSavingKey(row.key);
    try {
      const updated = await settings.update(row.key, drafts[row.key]);
      setRows((prev) =>
        prev ? prev.map((r) => (r.key === updated.key ? updated : r)) : prev,
      );
      setDrafts((prev) => {
        const { [row.key]: _, ...rest } = prev;
        return rest;
      });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? t('errors.unexpected'),
      );
    } finally {
      setSavingKey(null);
    }
  };

  if (error && !rows) return <div className={Styles.error}>{error}</div>;
  if (!rows) return <div className={Styles.loading}>{t('common.loading')}</div>;

  return (
    <div className={Styles.wrap}>
      {error && <div className={Styles.error}>{error}</div>}
      {grouped!.map(({ group, items }) => (
        <section key={group} className={Styles.group}>
          <h2 className={Styles.groupTitle}>
            {t(`admin.settings.group.${group}`)}
          </h2>
          <div className={Styles.cards}>
            {items.map((row) => {
              const draftValue = Object.prototype.hasOwnProperty.call(
                drafts,
                row.key,
              )
                ? drafts[row.key]
                : row.value;
              return (
                <div key={row.key} className={Styles.card}>
                  <div className={Styles.cardHead}>
                    <code className={Styles.key}>{row.key}</code>
                    <span className={Styles.type}>{row.type}</span>
                  </div>
                  <p className={Styles.desc}>{row.description}</p>
                  <Editor
                    type={row.type}
                    value={draftValue}
                    onChange={(v) => setDraft(row.key, v)}
                  />
                  <div className={Styles.cardFoot}>
                    <span className={Styles.updated}>
                      {t('admin.settings.updatedAt', {
                        date: new Date(row.updatedAt).toLocaleString(),
                      })}
                    </span>
                    <button
                      type="button"
                      className={Styles.saveBtn}
                      onClick={() => save(row)}
                      disabled={!isDirty(row) || savingKey === row.key}
                    >
                      {savingKey === row.key
                        ? t('common.loading')
                        : t('admin.settings.save')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};

const Editor: React.FC<{
  type: PlatformSettingRow['type'];
  value: unknown;
  onChange: (v: unknown) => void;
}> = ({ type, value, onChange }) => {
  if (type === 'boolean') {
    const checked = value === true;
    return (
      <label className={Styles.toggle}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>{checked ? 'ON' : 'OFF'}</span>
      </label>
    );
  }
  if (type === 'number') {
    return (
      <input
        type="number"
        className={Styles.input}
        value={typeof value === 'number' ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    );
  }
  if (type === 'string') {
    return (
      <textarea
        className={Styles.textarea}
        value={typeof value === 'string' ? value : ''}
        rows={3}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  // string_array
  const list = Array.isArray(value) ? (value as string[]) : [];
  return (
    <textarea
      className={Styles.textarea}
      value={list.join('\n')}
      rows={4}
      onChange={(e) =>
        onChange(
          e.target.value
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
        )
      }
      placeholder="one per line"
    />
  );
};

export default PlatformSettingsPage;
