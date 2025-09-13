import React from 'react';
import ReactDOM from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import i18next from 'i18next';
import { createClient } from '@supabase/supabase-js';

import App from './App.jsx';
import './i18n.js'
import './index.css';
import { Suspense } from 'react';
import ErrorBoundary from './ErrorBoundary.jsx';
import AuthBootstrap from './AuthBootstrap.jsx';

// Supabase Client with env validation
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[Supabase] Missing environment variables VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Render App
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading translations...</div>}>
      <I18nextProvider i18n={i18next}>
        <ErrorBoundary>
          <AuthBootstrap supabase={supabase}>
            <App supabase={supabase} />
          </AuthBootstrap>
        </ErrorBoundary>
      </I18nextProvider>
    </Suspense>
  </React.StrictMode>
);
