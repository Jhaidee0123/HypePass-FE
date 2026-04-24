/**
 * FeedbackModal Component
 *
 * A portal-based modal for showing success/error feedback.
 * Supports auto-close with progress bar, manual close, and retry actions.
 *
 * Usage:
 *   <FeedbackModal
 *     open={showModal}
 *     onClose={() => setShowModal(false)}
 *     variant="success"
 *     title="Done!"
 *     body="Operation completed successfully."
 *     autoCloseMs={2000}
 *   />
 */
import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Styles from './feedback-modal-styles.scss';
const SuccessIcon = () => (React.createElement("div", { className: `${Styles.iconCircle} ${Styles.successCircle}` },
    React.createElement("svg", { width: "40", height: "40", viewBox: "0 0 24 24", fill: "none", stroke: "#3B82F6", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
        React.createElement("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }),
        React.createElement("polyline", { points: "22 4 12 14.01 9 11.01" }))));
const ErrorIcon = () => (React.createElement("div", { className: `${Styles.iconCircle} ${Styles.errorCircle}` },
    React.createElement("svg", { width: "40", height: "40", viewBox: "0 0 24 24", fill: "none", stroke: "#EF5350", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
        React.createElement("circle", { cx: "12", cy: "12", r: "10" }),
        React.createElement("line", { x1: "15", y1: "9", x2: "9", y2: "15" }),
        React.createElement("line", { x1: "9", y1: "9", x2: "15", y2: "15" }))));
const FeedbackModal = ({ open, onClose, variant, title, body, autoCloseMs, buttonText = 'Close', showRetry = false, retryText = 'Try Again', onRetry, onConfirm }) => {
    const [progress, setProgress] = useState(0);
    const handleClose = useCallback(() => {
        onConfirm === null || onConfirm === void 0 ? void 0 : onConfirm();
        onClose();
    }, [onConfirm, onClose]);
    const handleRetry = useCallback(() => {
        onRetry === null || onRetry === void 0 ? void 0 : onRetry();
        onClose();
    }, [onRetry, onClose]);
    // Auto-close timer with progress
    useEffect(() => {
        if (!open || !autoCloseMs) {
            setProgress(0);
            return;
        }
        const interval = 20;
        let elapsed = 0;
        const timer = setInterval(() => {
            elapsed += interval;
            setProgress(Math.min((elapsed / autoCloseMs) * 100, 100));
            if (elapsed >= autoCloseMs) {
                clearInterval(timer);
                handleClose();
            }
        }, interval);
        return () => clearInterval(timer);
    }, [open, autoCloseMs, handleClose]);
    if (!open)
        return null;
    const isAutoClose = !!autoCloseMs;
    return createPortal(React.createElement("div", { className: Styles.overlay },
        React.createElement("div", { className: Styles.modal, role: "dialog", "aria-modal": "true" },
            React.createElement("div", { className: Styles.content },
                variant === 'success' ? React.createElement(SuccessIcon, null) : React.createElement(ErrorIcon, null),
                React.createElement("h3", { className: Styles.title }, title),
                React.createElement("p", { className: Styles.body }, body)),
            isAutoClose && (React.createElement("div", { className: Styles.progressTrack },
                React.createElement("div", { className: `${Styles.progressBar} ${variant === 'success' ? Styles.progressSuccess : Styles.progressError}`, style: { width: `${progress}%` } }))),
            !isAutoClose && (React.createElement("div", { className: Styles.actions },
                variant === 'error' && showRetry && (React.createElement("button", { type: "button", className: Styles.outlineButton, onClick: handleRetry }, retryText)),
                React.createElement("button", { type: "button", className: Styles.primaryButton, onClick: handleClose }, buttonText))))), document.body);
};
export default FeedbackModal;
