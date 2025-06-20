import React from 'react';
import ReactDOM from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import i18next from 'i18next';
import { createClient } from '@supabase/supabase-js';
import App from './App.jsx';
import './i18n.js'
import './index.css';

import { Suspense } from 'react';

// Supabase Client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Error Boundary
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="error-screen">{i18next.t('error')}</div>;
    }
    return this.props.children;
  }
}

// Render App
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading translations...</div>}>
      <I18nextProvider i18n={i18next}>
        <ErrorBoundary>
          <App supabase={supabase} />
        </ErrorBoundary>
      </I18nextProvider>
    </Suspense>
  </React.StrictMode>
);
