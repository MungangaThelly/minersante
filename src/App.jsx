import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Auth from './components/Auth.jsx';
import Dashboard from './components/Dashboard.jsx';
import VideoConsultation from './components/VideoConsultation.jsx';
import { useTranslation } from 'react-i18next';
import { useStore } from './components/Auth.jsx'; // Import Zustand store from Auth

function App({ supabase }) {
  const { t } = useTranslation();
  const { user } = useStore(); // Get the logged-in user from Zustand

  return (
    <BrowserRouter>
      <nav className="bg-blue-600 p-4 text-white flex justify-between">
        <div>
          <Link to="/" className="mr-4">{t('home')}</Link>
          <Link to="/dashboard" className="mr-4">{t('dashboard')}</Link>
          <Link to="/consultation">{t('videoConsultation')}</Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Auth supabase={supabase} />} />
        <Route
          path="/dashboard"
          element={user ? <Dashboard supabase={supabase} /> : <Auth supabase={supabase} />}
        />
        <Route
          path="/consultation"
          element={user ? <VideoConsultation supabase={supabase} /> : <Auth supabase={supabase} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
