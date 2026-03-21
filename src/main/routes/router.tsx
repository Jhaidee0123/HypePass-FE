/**
 * Application Router
 *
 * This is the top-level component that sets up:
 * - HelmetProvider (SEO)
 * - RecoilRoot (state management, initialized with account adapters)
 * - BrowserRouter (routing)
 *
 * Routes are organized into:
 * - Public: /, /login, /signup
 * - Private: /dashboard (requires authentication)
 * - Admin: /admin (requires admin role)
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import {
  HomeFactory,
  LoginFactory,
  SignUpFactory,
  DashboardFactory,
} from '@/main/factories/pages/';
import { getCurrentAccountAdapter, setCurrentAccountAdapter } from '@/main/adapters/current-account-adapter';
import { PrivateRoute, AdminRoute } from '@/main/proxies';
import { currentAccountState } from '@/presentation/components';
import { RecoilRoot } from 'recoil';

const Router: React.FC = () => {
  const state = {
    setCurrentAccount: setCurrentAccountAdapter,
    getCurrentAccount: getCurrentAccountAdapter
  };
  return (
    <HelmetProvider>
    <RecoilRoot initializeState={({ set }) => set(currentAccountState, state)}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomeFactory />} />
          <Route path="/login" element={<LoginFactory />} />
          <Route path="/signup" element={<SignUpFactory />} />

          {/* Private routes (requires authentication) */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardFactory />
              </PrivateRoute>
            }
          />

          {/* Admin routes (requires admin role) */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                {/* Replace with your admin page */}
                <div style={{ padding: '2rem' }}>
                  <h1>Admin Panel</h1>
                  <p>This is a placeholder for the admin area.</p>
                </div>
              </AdminRoute>
            }
          />

          {/* Catch-all: redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </RecoilRoot>
    </HelmetProvider>
  );
};

export default Router;
