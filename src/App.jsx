            // ...existing code...
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
  const { user, loading, appointments } = useStore(); // Zustand state

  // Find the next upcoming appointment
  let nextAppointment = null;
  if (appointments && appointments.length > 0) {
    const now = new Date();
    nextAppointment = appointments
      .filter(a => new Date(a.date) > now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))[0] || null;
  }

  return (
    <BrowserRouter>
      <nav className="bg-blue-600 dark:bg-gray-900 p-4 text-white dark:text-yellow-200 flex justify-between items-center transition-colors duration-300">
        <div className="space-x-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/70 ${
                isActive
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'bg-blue-500/30 text-white hover:bg-white hover:text-blue-600'
              }`
            }
            aria-label={t('home')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M10.707 2.293a1 1 0 0 0-1.414 0l-7 7A1 1 0 0 0 3 11h1v5a2 2 0 0 0 2 2h2a1 1 0 0 0 1-1v-3h2v3a1 1 0 0 0 1 1h2a2 2 0 0 0 2-2v-5h1a1 1 0 0 0 .707-1.707l-7-7z" />
            </svg>
            <span>{t('home')}</span>
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/70 ${
                isActive
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'bg-blue-500/30 text-white hover:bg-white hover:text-blue-600'
              }`
            }
            aria-label={t('dashboard')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5V6.75A2.25 2.25 0 0 1 5.25 4.5h13.5A2.25 2.25 0 0 1 21 6.75v6.75M3 13.5l9 6 9-6M3 13.5l9 6 9-6" />
            </svg>
            <span>{t('dashboard')}</span>
          </NavLink>
          {nextAppointment ? (
            <NavLink
              to={`/consultation/${nextAppointment.id}`}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/70 ${
                  isActive
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'bg-blue-500/30 text-white hover:bg-white hover:text-blue-600'
                }`
              }
              aria-label={t('videoConsultation')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6.75A2.25 2.25 0 0 0 13.5 4.5h-3A2.25 2.25 0 0 0 8.25 6.75v7.5A2.25 2.25 0 0 0 10.5 16.5h3a2.25 2.25 0 0 0 2.25-2.25v-3.75m0 0L21 9.75m-3.75 3.75l3.75-3.75" />
              </svg>
              <span>{t('videoConsultation')}</span>
            </NavLink>
          ) : (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold bg-blue-500/10 text-gray-400 cursor-not-allowed">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6.75A2.25 2.25 0 0 0 13.5 4.5h-3A2.25 2.25 0 0 0 8.25 6.75v7.5A2.25 2.25 0 0 0 10.5 16.5h3a2.25 2.25 0 0 0 2.25-2.25v-3.75m0 0L21 9.75m-3.75 3.75l3.75-3.75" />
              </svg>
              <span>{t('videoConsultation')}</span>
            </span>
          )}
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/70 ${
                isActive
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'bg-blue-500/30 text-white hover:bg-white hover:text-blue-600'
              }`
            }
            aria-label={t('profile_settings')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.5 20.25a8.25 8.25 0 0 1 15 0" />
            </svg>
            <span>{t('profile_settings')}</span>
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
            {/* Redirect /consultation to dashboard if no ID is provided */}
            <Route path="/consultation" element={<Navigate to="/dashboard" replace />} />
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
