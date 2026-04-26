import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import './design-system/tokens.css';
import CommandPalette from './components/CommandPalette/CommandPalette';
import MobileNav from './components/MobileNav/MobileNav';

// Lazy-loaded routes for code splitting
const LoginPanel   = React.lazy(() => import("./components/Login/Login"));
const Register     = React.lazy(() => import("./components/Register/Register"));
const Dealer       = React.lazy(() => import("./components/Dealers/Dealer"));
const Dealers      = React.lazy(() => import("./components/Dealers/Dealers"));
const PostReview   = React.lazy(() => import("./components/Dealers/PostReview"));
const SearchCars   = React.lazy(() => import("./components/Dealers/SearchCars"));
const HealthDash   = React.lazy(() => import("./components/Dealers/HealthDashboard"));

// ── Block 1 — AI Layer
const Recommendations = React.lazy(() => import("./pages/Recommendations"));

// ── Block 2 — Real-Time & Live
const BookingPage     = React.lazy(() => import("./pages/BookingPage"));

// ── Block 3 — Analytics
const MarketTrends    = React.lazy(() => import("./pages/MarketTrends"));
const Leaderboard     = React.lazy(() => import("./pages/Leaderboard"));
const InventoryReport = React.lazy(() => import("./pages/InventoryReport"));

// ── Block 3/5 — Admin
const NotificationsAdmin = React.lazy(() => import("./pages/NotificationsAdmin"));
const AuditAdmin         = React.lazy(() => import("./pages/AuditAdmin"));
const ApiKeysAdmin       = React.lazy(() => import("./pages/ApiKeysAdmin"));

// ── Block 4 — UX
const Dashboard       = React.lazy(() => import("./pages/Dashboard"));
const DealerProfile   = React.lazy(() => import("./pages/DealerProfile"));

// ── Block 4 — Error Pages
const NotFoundPage    = React.lazy(() => import("./pages/ErrorPages/NotFoundPage"));

// ── Block 8 — Integrations
const SharePage       = React.lazy(() => import("./pages/SharePage"));

// Skeleton fallback for route transitions
const PageLoader = () => (
  <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ textAlign: 'center' }}>
const SharePage       = React.lazy(() => import("./pages/SharePage"));

// Skeleton fallback for route transitions
const PageLoader = () => (
  <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ textAlign: 'center' }}>
      <div className="skeleton" style={{ width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto var(--space-4)' }} />
      <div className="skeleton" style={{ width: '200px', height: '16px', borderRadius: 'var(--radius-md)' }} />
    </div>
  </div>
);

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <CommandPalette />
      <MobileNav />
      <Routes>
        <Route path="/login"             element={<LoginPanel />} />
        <Route path="/register"          element={<Register />} />
        <Route path="/dealers"           element={<Dealers />} />
        <Route path="/dealer/:id"        element={<Dealer />} />
        <Route path="/postreview/:id"    element={<PostReview />} />
        <Route path="/searchcars/:id"    element={<SearchCars />} />
        <Route path="/health-dashboard"  element={<HealthDash />} />

        {/* ── Block 1 — AI Layer */}
        <Route path="/recommendations"          element={<Recommendations />} />

        {/* ── Block 2 — Real-Time */}
        <Route path="/book/:dealerId/:carId"     element={<BookingPage />} />
        <Route path="/book/:dealerId"            element={<BookingPage />} />

        {/* ── Block 3 — Analytics */}
        <Route path="/market-trends"            element={<MarketTrends />} />
        <Route path="/leaderboard"              element={<Leaderboard />} />
        <Route path="/admin/inventory-report"   element={<InventoryReport />} />

        {/* ── Block 3/5 — Admin */}
        <Route path="/admin/notifications"      element={<NotificationsAdmin />} />
        <Route path="/admin/audit"              element={<AuditAdmin />} />
        <Route path="/admin/api-keys"           element={<ApiKeysAdmin />} />

        {/* ── Block 4 — UX */}
        <Route path="/dashboard"                element={<Dashboard />} />
        <Route path="/dealers/:id/profile"      element={<DealerProfile />} />

        {/* ── Block 8 — Share */}
        <Route path="/share/:type/:id"          element={<SharePage />} />

        {/* ── Catch-all 404 */}
        <Route path="*"                         element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
