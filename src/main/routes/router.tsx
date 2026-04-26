/**
 * Application Router
 *
 * - <HelmetProvider> for SEO <head /> control.
 * - <RecoilRoot> seeded with the current account adapters.
 * - <BrowserRouter> + <Routes>.
 *
 * Routes split into two groups:
 *   - Shell routes (wrapped in <Layout>): home, dashboard, organizer, admin, etc.
 *   - Fullscreen routes (no shell): login, signup.
 */
import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { RecoilRoot } from 'recoil';
import { useTranslation } from 'react-i18next';
import {
  HomeFactory,
  EventsPageFactory,
  LoginFactory,
  SignUpFactory,
  ResetPasswordFactory,
  DashboardFactory,
  OrganizerFactory,
  EventCreateFactory,
  EventEditorFactory,
  AdminFactory,
  EventReviewFactory,
  EventDetailFactory,
  CheckoutPageFactory,
  CheckoutResultFactory,
  WalletFactory,
  TicketDetailFactory,
  CheckinPageFactory,
  MarketplaceFactory,
  ListingDetailFactory,
  AdminPayoutsFactory,
  OrganizerVenuesFactory,
  OrganizerMembersFactory,
  ProfileFactory,
  TermsFactory,
  PrivacyFactory,
  FAQFactory,
  SupportFormFactory,
  PromoterHomeFactory,
  PromoterEventFactory,
  ForOrganizersFactory,
} from '@/main/factories/pages/';
import {
  getCurrentAccountAdapter,
  setCurrentAccountAdapter,
} from '@/main/adapters/current-account-adapter';
import { PrivateRoute, AdminRoute } from '@/main/proxies';
import { currentAccountState, Layout } from '@/presentation/components';
import { usePageViewTracker } from '@/presentation/hooks';
import { makePageViewTracker } from '@/main/factories/usecases/admin';

const pageViewTracker = makePageViewTracker();

const ShellOutlet: React.FC = () => {
  usePageViewTracker(pageViewTracker);
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

const Placeholder: React.FC<{ titleKey: string }> = ({ titleKey }) => {
  const { t } = useTranslation();
  return (
    <div style={{ padding: '72px 48px', color: '#ece8e0' }}>
      <div
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          letterSpacing: '0.14em',
          color: '#6b6760',
          marginBottom: 8,
        }}
      >
        ◆ HYPEPASS
      </div>
      <h1
        style={{
          fontFamily: 'Bebas Neue, Impact, sans-serif',
          fontSize: 64,
          lineHeight: 0.92,
          letterSpacing: '0.02em',
        }}
      >
        {t(titleKey)}
      </h1>
      <p style={{ color: '#908b83', marginTop: 12 }}>
        {t('common.loading')}
      </p>
    </div>
  );
};

const Router: React.FC = () => {
  const state = {
    setCurrentAccount: setCurrentAccountAdapter,
    getCurrentAccount: getCurrentAccountAdapter,
  };
  return (
    <HelmetProvider>
      <RecoilRoot
        initializeState={({ set }) => set(currentAccountState, state)}
      >
        <BrowserRouter>
          <Routes>
            {/* Fullscreen routes (no shell) */}
            <Route path="/login" element={<LoginFactory />} />
            <Route path="/signup" element={<SignUpFactory />} />
            <Route
              path="/reset-password"
              element={<ResetPasswordFactory />}
            />
            <Route path="/checkout" element={<CheckoutPageFactory />} />
            <Route
              path="/checkout/result"
              element={<CheckoutResultFactory />}
            />

            {/* Shell routes */}
            <Route element={<ShellOutlet />}>
              <Route path="/" element={<HomeFactory />} />
              <Route path="/events" element={<EventsPageFactory />} />
              <Route
                path="/events/:slug"
                element={<EventDetailFactory />}
              />
              <Route path="/marketplace" element={<MarketplaceFactory />} />
              <Route
                path="/marketplace/listings/:listingId"
                element={<ListingDetailFactory />}
              />
              <Route
                path="/wallet"
                element={
                  <PrivateRoute>
                    <WalletFactory />
                  </PrivateRoute>
                }
              />
              <Route
                path="/wallet/tickets/:ticketId"
                element={
                  <PrivateRoute>
                    <TicketDetailFactory />
                  </PrivateRoute>
                }
              />
              <Route
                path="/checkin"
                element={
                  <PrivateRoute>
                    <CheckinPageFactory />
                  </PrivateRoute>
                }
              />

              {/* Organizer backoffice */}
              <Route
                path="/organizer"
                element={
                  <PrivateRoute>
                    <OrganizerFactory />
                  </PrivateRoute>
                }
              />
              <Route
                path="/organizer/companies/:companyId/events/new"
                element={
                  <PrivateRoute>
                    <EventCreateFactory />
                  </PrivateRoute>
                }
              />
              <Route
                path="/organizer/companies/:companyId/events/:eventId"
                element={
                  <PrivateRoute>
                    <EventEditorFactory />
                  </PrivateRoute>
                }
              />
              <Route
                path="/organizer/companies/:companyId/venues"
                element={
                  <PrivateRoute>
                    <OrganizerVenuesFactory />
                  </PrivateRoute>
                }
              />
              <Route
                path="/organizer/companies/:companyId/members"
                element={
                  <PrivateRoute>
                    <OrganizerMembersFactory />
                  </PrivateRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <DashboardFactory />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <ProfileFactory />
                  </PrivateRoute>
                }
              />
              <Route path="/legal/terms" element={<TermsFactory />} />
              <Route
                path="/legal/privacy"
                element={<PrivacyFactory />}
              />
              <Route path="/faq" element={<FAQFactory />} />
              <Route path="/support" element={<SupportFormFactory />} />
              <Route
                path="/for-organizers"
                element={<ForOrganizersFactory />}
              />

              {/* Promoter (any authenticated user) */}
              <Route
                path="/promoter"
                element={
                  <PrivateRoute>
                    <PromoterHomeFactory />
                  </PrivateRoute>
                }
              />
              <Route
                path="/promoter/events/:eventId"
                element={
                  <PrivateRoute>
                    <PromoterEventFactory />
                  </PrivateRoute>
                }
              />

              {/* Admin */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminFactory />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/events/:eventId"
                element={
                  <AdminRoute>
                    <EventReviewFactory />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/payouts"
                element={
                  <AdminRoute>
                    <AdminPayoutsFactory />
                  </AdminRoute>
                }
              />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </RecoilRoot>
    </HelmetProvider>
  );
};

export default Router;
