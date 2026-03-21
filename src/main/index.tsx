/**
 * Application Entry Point
 *
 * - Sets up global axios interceptors (401 handling)
 * - Imports global styles
 * - Mounts the React app into the #main element
 *
 * Supports both fresh render and hydration (for SSR/pre-rendering).
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import Router from './routes/router';
import { setupAxiosInterceptors } from '@/main/config/setup-axios-interceptors';
import '@/presentation/styles/global.scss';

setupAxiosInterceptors();

const container = document.getElementById('main');
if (container.hasChildNodes()) {
  ReactDOM.hydrateRoot(container, <Router />);
} else {
  ReactDOM.createRoot(container).render(<Router />);
}
