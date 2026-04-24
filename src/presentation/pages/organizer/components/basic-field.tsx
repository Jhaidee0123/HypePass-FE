import React from 'react';

type Props = {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  textarea?: boolean;
  rows?: number;
};

export const BasicField: React.FC<Props> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  hint,
  required,
  disabled,
  textarea,
  rows = 3,
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
      {label} {required && <span style={{ color: '#ff4d5a' }}>*</span>}
    </div>
    {textarea ? (
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={rows}
        style={fieldStyle}
      />
    ) : (
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={fieldStyle}
      />
    )}
    {hint && (
      <div style={{ fontSize: 11, color: '#6b6760', marginTop: 4 }}>
        {hint}
      </div>
    )}
  </div>
);

const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  fontSize: 14,
  background: '#121110',
  border: '1px solid #242320',
  color: '#faf7f0',
  borderRadius: 4,
  fontFamily: 'Space Grotesk, system-ui, sans-serif',
  outline: 'none',
  resize: 'vertical',
};
