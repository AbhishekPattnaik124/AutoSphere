import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { motion } from "framer-motion";
import './design-system/tokens.css';
import CommandPalette from './components/CommandPalette/CommandPalette';
import MobileNav from './components/MobileNav/MobileNav';
import MainLayout from './components/MainLayout';
import ErrorBoundary from './components/ErrorBoundary';
import { LanguageProvider } from './context/LanguageContext';
import { CurrencyProvider } from './context/CurrencyContext';
import FomoTicker from './components/FomoTicker/FomoTicker';

// ── Core Pages (lazy-loaded for code splitting) ────────────────
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
const PricingPage = React.lazy(() => import("./pages/PricingPage/PricingPage"));

// ── AI Layer ────────────────────────────────────────────────────
const Recommendations = React.lazy(() => import("./pages/Recommendations"));

// ── Real-Time & Booking ─────────────────────────────────────────
const BookingPage         = React.lazy(() => import("./pages/BookingPage"));
const AppointmentBooking  = React.lazy(() => import("./pages/AppointmentBooking"));

// ── Analytics & Intelligence ────────────────────────────────────
const MarketTrends    = React.lazy(() => import("./pages/MarketTrends"));
const Leaderboard     = React.lazy(() => import("./pages/Leaderboard"));
const DealerLeaderboard = React.lazy(() => import("./pages/DealerLeaderboard"));
const InventoryReport = React.lazy(() => import("./pages/InventoryReport"));
const InventoryHealth = React.lazy(() => import("./pages/InventoryHealth"));
const LiveInventory   = React.lazy(() => import("./pages/LiveInventory"));
const CarComparison   = React.lazy(() => import("./pages/CarComparison"));
const AiStudio        = React.lazy(() => import("./pages/AiStudio/AiStudio"));
const TradeInValuator = React.lazy(() => import("./pages/TradeIn/TradeInValuator"));
const CityGuide       = React.lazy(() => import("./pages/SeoGuides/CityGuide"));
// ── Admin ────────────────────────────────────────────────────────
const NotificationsAdmin = React.lazy(() => import("./pages/NotificationsAdmin"));
const AuditAdmin         = React.lazy(() => import("./pages/AuditAdmin"));
const AuditLogs          = React.lazy(() => import("./pages/AuditLogs"));
const ApiKeysAdmin       = React.lazy(() => import("./pages/ApiKeysAdmin"));
const ApiKeys            = React.lazy(() => import("./pages/ApiKeys"));
const SeedControl        = React.lazy(() => import("./pages/SeedControl"));

// ── User Experience ──────────────────────────────────────────────
const Dashboard       = React.lazy(() => import("./pages/Dashboard"));
const DealerProfile   = React.lazy(() => import("./pages/DealerProfile"));
const Notifications   = React.lazy(() => import("./pages/Notifications"));

// ── Sharing & Social ─────────────────────────────────────────────
const SharePage       = React.lazy(() => import("./pages/SharePage"));

// ── Error Pages ──────────────────────────────────────────────────
const NotFoundPage    = React.lazy(() => import("./pages/ErrorPages/NotFoundPage"));

// ── Animated loading skeleton shown during lazy imports ──────────
const PageLoader = () => (
  <div style={{
    minHeight: '100vh',
    background: '#040507',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  }}>
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: [0.8, 1.1, 1], opacity: 1 }}
      transition={{ duration: 1.5, repeat: Infinity }}
      style={{ fontSize: '3rem', marginBottom: '20px' }}
    >
      🚗
    </motion.div>
    <div style={{
      width: '200px',
      height: '2px',
      background: 'rgba(255,255,255,0.05)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <motion.div
        initial={{ left: '-100%' }}
        animate={{ left: '100%' }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: 0, height: '100%', width: '50%',
          background: 'var(--color-primary, #00ff9d)',
          boxShadow: '0 0 20px #00ff9d',
        }}
      />
    </div>
    <p style={{
      marginTop: '20px',
      color: 'var(--color-primary, #00ff9d)',
      fontSize: '0.7rem',
      fontWeight: 900,
      textTransform: 'uppercase',
      letterSpacing: '0.3em',
    }}>
      Synchronizing Core Systems
    </p>
  </div>
);

function App() {
  return (
    <CurrencyProvider>
      <LanguageProvider>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
                <CommandPalette />
                <MobileNav />
                <MainLayout>
                  <Routes>
                    {/* ── Core ──────────────────────────────────────── */}
                    <Route path="/"                    element={<HomePage />} />
                    <Route path="/about"               element={<AboutPage />} />
                    <Route path="/contact"             element={<ContactPage />} />
                    <Route path="/advancements"        element={<AdvancementsPage />} />

              {/* ── Auth ──────────────────────────────────────── */}
              <Route path="/login"               element={<LoginPanel />} />
              <Route path="/register"            element={<Register />} />

              {/* ── Dealers & Reviews ─────────────────────────── */}
              <Route path="/dealers"             element={<Dealers />} />
              <Route path="/dealer/:id"          element={<Dealer />} />
              <Route path="/dealers/:id/profile" element={<DealerProfile />} />
              <Route path="/postreview/:id"      element={<PostReview />} />
              <Route path="/searchcars/:id"      element={<SearchCars />} />

              {/* ── AI & Recommendations ──────────────────────── */}
              <Route path="/recommendations"     element={<Recommendations />} />

              {/* ── Booking ───────────────────────────────────── */}
              <Route path="/book/:dealerId/:carId"  element={<BookingPage />} />
              <Route path="/book/:dealerId"          element={<BookingPage />} />
              <Route path="/appointments"            element={<AppointmentBooking />} />

              {/* ── Analytics & Market ────────────────────────── */}
              <Route path="/market-trends"       element={<MarketTrends />} />
              <Route path="/leaderboard"         element={<Leaderboard />} />
              <Route path="/dealer-leaderboard"  element={<DealerLeaderboard />} />
              <Route path="/live-inventory"      element={<LiveInventory />} />
              <Route path="/trade-in"            element={<TradeInValuator />} />
              <Route path="/api-keys-admin"      element={<ApiKeysAdmin />} />
            
              {/* Programmatic SEO Guides & AI Studio */}
              <Route path="/guides/best-cars-in-:city" element={<CityGuide />} />
              <Route path="/ai-studio"           element={<AiStudio />} />
              <Route path="/car-comparison"      element={<CarComparison />} />

              {/* ── User Dashboard ────────────────────────────── */}
              <Route path="/dashboard"           element={<Dashboard />} />
              <Route path="/notifications"       element={<Notifications />} />

              {/* ── Admin Panel ───────────────────────────────── */}
              <Route path="/admin/inventory-report"   element={<InventoryReport />} />
              <Route path="/admin/inventory-health"   element={<InventoryHealth />} />
              <Route path="/admin/notifications"      element={<NotificationsAdmin />} />
              <Route path="/admin/audit"              element={<AuditAdmin />} />
              <Route path="/admin/audit-logs"         element={<AuditLogs />} />
              <Route path="/admin/api-keys"           element={<ApiKeysAdmin />} />
              <Route path="/admin/seed"               element={<SeedControl />} />

              {/* ── Developer & Admin ─────────────────────────── */}
              <Route path="/api-keys"            element={<ApiKeys />} />
              <Route path="/health-dashboard"    element={<HealthDash />} />
              <Route path="/pricing"             element={<PricingPage />} />

              {/* ── Sharing ───────────────────────────────────── */}
              <Route path="/share/:type/:id"     element={<SharePage />} />

              {/* ── 404 Catch-all ─────────────────────────────── */}
              <Route path="*"                    element={<NotFoundPage />} />
            </Routes>
          </MainLayout>
          <FomoTicker />
        </Suspense>
      </ErrorBoundary>
    </LanguageProvider>
  </CurrencyProvider>
  );
}

export default App;
