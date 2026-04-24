var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
export const ImageUpload = ({ uploader, value, onChange, label, aspect = '16 / 9', }) => {
    const { t } = useTranslation();
    const inputRef = useRef(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const handleFile = (file) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        setError(null);
        setBusy(true);
        try {
            const res = yield uploader.upload(file);
            onChange(res.url, res.publicId);
        }
        catch (err) {
            setError((_d = (_c = (_b = (_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) !== null && _c !== void 0 ? _c : err === null || err === void 0 ? void 0 : err.message) !== null && _d !== void 0 ? _d : t('errors.unexpected'));
        }
        finally {
            setBusy(false);
        }
    });
    return (React.createElement("div", { style: { marginBottom: 16 } },
        React.createElement("div", { style: {
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10,
                letterSpacing: '0.12em',
                color: '#6b6760',
                textTransform: 'uppercase',
                marginBottom: 8,
            } }, label),
        React.createElement("div", { style: {
                position: 'relative',
                aspectRatio: aspect,
                borderRadius: 6,
                border: '1px dashed #34312c',
                background: '#0a0908',
                overflow: 'hidden',
                cursor: busy ? 'progress' : 'pointer',
            }, onClick: () => { var _a; return !busy && ((_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.click()); } }, value ? (React.createElement("img", { src: value, alt: "", style: {
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
            } })) : (React.createElement("div", { style: {
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                letterSpacing: '0.12em',
                color: '#6b6760',
            } }, busy
            ? t('common.loading').toUpperCase()
            : `+ ${t('organizer.events.uploadImage').toUpperCase()}`))),
        React.createElement("input", { ref: inputRef, type: "file", accept: "image/png,image/jpeg,image/webp", style: { display: 'none' }, onChange: (e) => {
                var _a;
                const file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
                if (file)
                    void handleFile(file);
                e.target.value = '';
            } }),
        error && (React.createElement("div", { style: {
                fontSize: 12,
                color: '#ff4d5a',
                marginTop: 8,
            } }, error)),
        value && !busy && (React.createElement("button", { type: "button", onClick: () => onChange('', ''), style: {
                marginTop: 8,
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10,
                letterSpacing: '0.12em',
                color: '#6b6760',
            } }, t('common.close').toUpperCase()))));
};
