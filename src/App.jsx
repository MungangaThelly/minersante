import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from './store.js';
import Auth from './components/Auth.jsx';
import LanguageSwitcher from './components/LanguageSwitcher.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';

// Lazy-loaded components
const Dashboard = React.lazy(() => import('./components/Dashboard.jsx'));
const VideoConsultation = React.lazy(() => import('./components/VideoConsultation.jsx'));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard.jsx'));
const Profile = React.lazy(() => import('./components/Profile.jsx'));


function RoleRoute({ user, loading, allowedRoles, children }) {
  const { t } = useTranslation();
  if (loading) return <div className="p-6 text-center">{t('loading')}</div>;
  if (!user) return <Navigate to="/" replace />;
  const role = user?.user_metadata?.role || 'miner';
  if (!allowedRoles.includes(role)) {
    // Redirect to their dashboard if not allowed
    return <Navigate to={role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  // Only return children, never a <Route>
  return <>{children}</>;
}

function App({ supabase }) {
  const { t } = useTranslation();
  const { user, loading } = useStore(); // Zustand state

  return (
    <BrowserRouter>
  <nav className="bg-blue-600 dark:bg-gray-900 p-4 text-white dark:text-yellow-200 flex justify-between items-center transition-colors duration-300">
        <div className="space-x-4">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? 'underline text-white' : 'text-white')}
          >
            {t('home')}
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? 'underline text-white' : 'text-white')}
          >
            {t('dashboard')}
          </NavLink>
          <NavLink
            to="/consultation"
            className={({ isActive }) => (isActive ? 'underline text-white' : 'text-white')}
          >
            {t('videoConsultation')}
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) => (isActive ? 'underline text-white' : 'text-white')}
          >
            {t('profile_settings')}
          </NavLink>
        </div>
        <div className="flex items-center">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>


      <div className="min-h-screen bg-gray-100 transition-colors duration-300">
        <Suspense fallback={<div className="p-6 text-center">{t('loading')}</div>}>
          <Routes>
            {/* Profile page (miners only) */}
            <Route
              path="/profile"
              element={
                <RoleRoute user={user} loading={loading} allowedRoles={['miner']}>
                  <Profile supabase={supabase} />
                </RoleRoute>
              }
            />
            {/* Public route */}
            <Route path="/" element={<Auth supabase={supabase} />} />

            {/* Private routes */}
            {/* Miner dashboard (miners only) */}
            <Route
              path="/dashboard"
              element={
                <RoleRoute user={user} loading={loading} allowedRoles={['miner']}>
                  <Dashboard supabase={supabase} />
                </RoleRoute>
              }
            />
            {/* Admin dashboard (admins only) */}
            <Route
              path="/admin"
              element={
                <RoleRoute user={user} loading={loading} allowedRoles={['admin']}>
                  <AdminDashboard />
                </RoleRoute>
              }
            />
            {/* Video consultation (miners only) */}
            <Route
              path="/consultation/:id"
              element={
                <RoleRoute user={user} loading={loading} allowedRoles={['miner']}>
                  <VideoConsultation supabase={supabase} />
                </RoleRoute>
              }
            />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}

export default App;
