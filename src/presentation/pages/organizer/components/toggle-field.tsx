import React from 'react';

type Props = {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  hint?: string;
};

export const ToggleField: React.FC<Props> = ({
  label,
  value,
  onChange,
  disabled,
  hint,
}) => (
  <div style={{ marginBottom: 14 }}>
    <div
      style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10,
        letterSpacing: '0.12em',
        color: '#6b6760',
        textTransform: 'uppercase',
        marginBottom: 8,
      }}
    >
      {label}
    </div>
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!value)}
      aria-pressed={value}
      style={{
        width: 48,
        height: 28,
        borderRadius: 14,
        background: value ? '#d7ff3a' : '#34312c',
        position: 'relative',
        padding: 2,
        display: 'flex',
        alignItems: 'center',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          background: '#0a0908',
          transform: value ? 'translateX(20px)' : 'translateX(0)',
          transition: 'transform 0.15s ease',
        }}
      />
    </button>
    {hint && (
      <div
        style={{
          fontFamily: 'Space Grotesk, system-ui, sans-serif',
          fontSize: 12,
          color: '#908b83',
          marginTop: 6,
          lineHeight: 1.5,
          maxWidth: 520,
        }}
      >
        {hint}
      </div>
    )}
  </div>
);

export default ToggleField;
