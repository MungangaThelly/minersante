import React from 'react';
import ReactDOM from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import i18next from 'i18next';
import { createClient } from '@supabase/supabase-js';
import App from './App.jsx';
import './index.css';

// Supabase Client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Translation Resources
const resources = {
  en: {
    translation: {
      appName: "HealthApp",
      login: "Login",
      signup: "Sign Up",
      username: "Email",
      password: "Password",
      create_account: "Create an account",
      already_have_account: "Already have an account?",
      please_fill_all_fields: "Please fill in all fields.",
      login_failed_invalid_credentials: "Invalid login credentials.",
      signup_failed: "Sign-up failed. Please try again.",
      language: "Language",
    }
  },
  fr: {
    translation: {
      appName: "SantéApp",
      login: "Connexion",
      signup: "Inscription",
      username: "Email",
      password: "Mot de passe",
      create_account: "Créer un compte",
      already_have_account: "Vous avez déjà un compte ?",
      please_fill_all_fields: "Veuillez remplir tous les champs.",
      login_failed_invalid_credentials: "Identifiants de connexion invalides.",
      signup_failed: "Échec de l'inscription. Veuillez réessayer.",
      language: "Langue",
    }
  },
  ln: {
    translation: {
      appName: "Lopango ya Santé",
      login: "Kokota",
      signup: "Kokoma",
      username: "Imeyili",
      password: "Mot de passe",
      create_account: "Kokoma compte",
      already_have_account: "Ozali na compte ?",
      please_fill_all_fields: "S'il vous plaît remplir tous les champs.",
      login_failed_invalid_credentials: "Makomi ya kokota ezali mabe.",
      signup_failed: "Ekokani te na inscription.",
      language: "Lokota",
    }
  },
  sw: {
    translation: {
      appName: "AfyaApp",
      login: "Ingia",
      signup: "Jisajili",
      username: "Barua pepe",
      password: "Nenosiri",
      create_account: "Tengeneza akaunti",
      already_have_account: "Tayari una akaunti?",
      please_fill_all_fields: "Tafadhali jaza sehemu zote.",
      login_failed_invalid_credentials: "Maelezo ya kuingia si sahihi.",
      signup_failed: "Kusajili hakufaulu. Tafadhali jaribu tena.",
      language: "Lugha",
    }
  }
};

i18next.init({
  resources,
  lng: localStorage.getItem('language') || 'fr',
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18next}>
      <App supabase={supabase} />
    </I18nextProvider>
  </React.StrictMode>
);