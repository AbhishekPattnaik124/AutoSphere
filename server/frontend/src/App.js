import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { motion } from "framer-motion";
import './design-system/tokens.css';
import CommandPalette from './components/CommandPalette/CommandPalette';
import MobileNav from './components/MobileNav/MobileNav';
import MainLayout from './components/MainLayout';

// Lazy-loaded routes for code splitting
const LoginPanel   = React.lazy(() => import("./components/Login/Login"));
const Register     = React.lazy(() => import("./components/Register/Register"));
const Dealer       = React.lazy(() => import("./components/Dealers/Dealer"));
const Dealers      = React.lazy(() => import("./components/Dealers/Dealers"));
const PostReview   = React.lazy(() => import("./components/Dealers/PostReview"));
const SearchCars   = React.lazy(() => import("./components/Dealers/SearchCars"));
const HealthDash   = React.lazy(() => import("./components/Dealers/HealthDashboard"));
const HomePage     = React.lazy(() => import("./pages/HomePage/HomePage"));
const AboutPage    = React.lazy(() => import("./pages/AboutPage/AboutPage"));
const ContactPage  = React.lazy(() => import("./pages/ContactPage/ContactPage"));
const AdvancementsPage = React.lazy(() => import("./pages/AdvancementsPage/AdvancementsPage"));

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
  <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: [0.8, 1.1, 1], opacity: 1 }}
      transition={{ duration: 1.5, repeat: Infinity }}
      style={{ fontSize: '3rem', marginBottom: '20px' }}
    >
      🚗
    </motion.div>
    <div style={{ width: '200px', height: '2px', background: 'rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
      <motion.div 
        initial={{ left: '-100%' }}
        animate={{ left: '100%' }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: 'absolute', top: 0, height: '100%', width: '50%', background: 'var(--color-primary, #C5A059)', boxShadow: '0 0 20px #C5A059' }}
      />
    </div>
    <p style={{ marginTop: '20px', color: '#C5A059', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em' }}>
      Synchronizing Core Systems
    </p>
  </div>
);

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <CommandPalette />
      <MobileNav />
      <MainLayout>
        <Routes>
          <Route path="/"                  element={<HomePage />} />
          <Route path="/about"             element={<AboutPage />} />
          <Route path="/contact"           element={<ContactPage />} />
          <Route path="/advancements"      element={<AdvancementsPage />} />
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
      </MainLayout>
    </Suspense>
  );
}

export default App;
