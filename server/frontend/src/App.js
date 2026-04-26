import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import './design-system/tokens.css';

// Lazy-loaded routes for code splitting
const LoginPanel   = React.lazy(() => import("./components/Login/Login"));
const Register     = React.lazy(() => import("./components/Register/Register"));
const Dealer       = React.lazy(() => import("./components/Dealers/Dealer"));
const Dealers      = React.lazy(() => import("./components/Dealers/Dealers"));
const PostReview   = React.lazy(() => import("./components/Dealers/PostReview"));
const SearchCars   = React.lazy(() => import("./components/Dealers/SearchCars"));
const HealthDash   = React.lazy(() => import("./components/Dealers/HealthDashboard"));

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
      <Routes>
        <Route path="/login"             element={<LoginPanel />} />
        <Route path="/register"          element={<Register />} />
        <Route path="/dealers"           element={<Dealers />} />
        <Route path="/dealer/:id"        element={<Dealer />} />
        <Route path="/postreview/:id"    element={<PostReview />} />
        <Route path="/searchcars/:id"    element={<SearchCars />} />
        <Route path="/health-dashboard"  element={<HealthDash />} />
      </Routes>
    </Suspense>
  );
}

export default App;
