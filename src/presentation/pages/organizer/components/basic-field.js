import React from 'react';
export const BasicField = ({ label, value, onChange, placeholder, type = 'text', hint, required, disabled, textarea, rows = 3, }) => (React.createElement("div", { style: { marginBottom: 14 } },
    React.createElement("div", { style: {
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            letterSpacing: '0.12em',
            color: '#6b6760',
            textTransform: 'uppercase',
            marginBottom: 8,
        } },
        label,
        " ",
        required && React.createElement("span", { style: { color: '#ff4d5a' } }, "*")),
    textarea ? (React.createElement("textarea", { value: value, placeholder: placeholder, onChange: (e) => onChange(e.target.value), disabled: disabled, rows: rows, style: fieldStyle })) : (React.createElement("input", { type: type, value: value, placeholder: placeholder, onChange: (e) => onChange(e.target.value), disabled: disabled, style: fieldStyle })),
    hint && (React.createElement("div", { style: { fontSize: 11, color: '#6b6760', marginTop: 4 } }, hint))));
const fieldStyle = {
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
