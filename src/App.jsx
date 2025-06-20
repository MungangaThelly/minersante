import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from './store.js';
import Auth from './components/Auth.jsx';
import LanguageSwitcher from './components/LanguageSwitcher.jsx';

// Lazy-loaded components
const Dashboard = React.lazy(() => import('./components/Dashboard.jsx'));
const VideoConsultation = React.lazy(() => import('./components/VideoConsultation.jsx'));

function PrivateRoute({ user, loading, children }) {
  const { t } = useTranslation();

  if (loading) return <div className="p-6 text-center">{t('loading')}</div>;
  return user ? children : <Navigate to="/" />;
}

function App({ supabase }) {
  const { t } = useTranslation();
  const { user, loading } = useStore(); // Zustand state

  return (
    <BrowserRouter>
      <nav className="bg-blue-600 p-4 text-white flex justify-between items-center">
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
        </div>
        <LanguageSwitcher />
      </nav>

      <Suspense fallback={<div className="p-6 text-center">{t('loading')}</div>}>
        <Routes>
          {/* Public route */}
          <Route path="/" element={<Auth supabase={supabase} />} />

          {/* Private routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute user={user} loading={loading}>
                <Dashboard supabase={supabase} />
              </PrivateRoute>
            }
          />
          <Route
            path="/consultation"
            element={
              <PrivateRoute user={user} loading={loading}>
                <VideoConsultation supabase={supabase} />
              </PrivateRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
