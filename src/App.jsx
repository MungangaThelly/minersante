import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Suspense } from 'react';
import { useStore } from './store.js';
import Auth from './components/Auth.jsx';

// Lazy-loaded components
const Dashboard = React.lazy(() => import('./components/Dashboard.jsx'));
const VideoConsultation = React.lazy(() => import('./components/VideoConsultation.jsx'));

function App({ supabase }) {
  const { t } = useTranslation();
  const { user, loading } = useStore(); // Zustand state

  return (
    <BrowserRouter>
      <nav className="bg-blue-600 p-4 text-white flex justify-between">
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
      </nav>

      <Suspense fallback={<div className="p-6 text-center">{t('loading')}</div>}>
        <Routes>
          <Route path="/" element={<Auth supabase={supabase} />} />

          <Route
            path="/dashboard"
            element={
              loading ? (
                <div className="p-6 text-center">{t('loading')}</div>
              ) : user ? (
                <Dashboard supabase={supabase} />
              ) : (
                <Auth supabase={supabase} />
              )
            }
          />

          <Route
            path="/consultation"
            element={
              loading ? (
                <div className="p-6 text-center">{t('loading')}</div>
              ) : user ? (
                <VideoConsultation supabase={supabase} />
              ) : (
                <Auth supabase={supabase} />
              )
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
