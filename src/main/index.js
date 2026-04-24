/**
 * Application Entry Point.
 *
 * Order matters:
 *   1. Initialize i18n (used from first render).
 *   2. Install axios interceptors (401 handling).
 *   3. Import global styles.
 *   4. Mount the React app.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import "./i18n/i18n";
import "../presentation/styles/global.scss";
import Router from './routes/router';
import { setupAxiosInterceptors } from "./config/setup-axios-interceptors";
setupAxiosInterceptors();
const container = document.getElementById('main');
if (!container) {
    throw new Error('Root container #main not found');
}
if (container.hasChildNodes()) {
    ReactDOM.hydrateRoot(container, React.createElement(Router, null));
}
else {
    ReactDOM.createRoot(container).render(React.createElement(Router, null));
}
