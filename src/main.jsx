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
      welcome: "Welcome, {{name}}",
      upcomingAppointments: "Upcoming Appointments",
      noAppointments: "No upcoming appointments.",
      healthData: "Health Data",
      noHealthData: "No health data available.",
      joinCall: "Join Video Call",
      scheduleAppointment: "Schedule Appointment",
      addHealthData: "Add Health Data",
      videoConsultation: "Video Consultation",
      home: "Home",
      dashboard: "Dashboard",
      no_auth: "Please log in",
      loading: "Loading...",
      error: "Error occurred",
      retry: "Retry",
      cancel: "Cancel",
      confirm: "Confirm",
      appointmentDetails: "Appointment Details",
      noUpcomingAppointments: "No upcoming appointments available",
      initializingVideo: "Initializing video connection...",
      videoUnavailable: "Video feed unavailable",
      endCall: "End Call",
      mute: "Mute",
      unmute: "Unmute",
      startVideo: "Start Video",
      stopVideo: "Stop Video",
      status: {
        connected: "Connected",
        connecting: "Connecting",
        disconnected: "Disconnected",
        error: "Connection Error"
      }
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
      welcome: "Bienvenue, {{name}}",
      upcomingAppointments: "Rendez-vous à venir",
      noAppointments: "Aucun rendez-vous à venir.",
      healthData: "Données de santé",
      noHealthData: "Aucune donnée de santé disponible.",
      joinCall: "Rejoindre l'appel vidéo",
      videoConsultation: "Consultation vidéo",
      home: "Accueil",
      dashboard: "Tableau de bord",
      no_auth: "Veuillez vous connecter",
      loading: "Chargement...",
      error: "Une erreur s'est produite",
      retry: "Réessayer",
      cancel: "Annuler",
      confirm: "Confirmer",
      appointmentDetails: "Détails du rendez-vous",
      noUpcomingAppointments: "Aucun rendez-vous à venir",
      initializingVideo: "Initialisation de la connexion vidéo...",
      videoUnavailable: "Flux vidéo indisponible",
      endCall: "Terminer l'appel",
      mute: "Couper le son",
      unmute: "Activer le son",
      startVideo: "Démarrer la vidéo",
      stopVideo: "Arrêter la vidéo",
      status: {
        connected: "Connecté",
        connecting: "Connexion...",
        disconnected: "Déconnecté",
        error: "Erreur de connexion"
      }
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
      welcome: "Boyei malamu, {{name}}",
      upcomingAppointments: "Bikweliso biye bikoyaka",
      noAppointments: "Bikweliso te.",
      healthData: "Bikundoli bia nzoto",
      noHealthData: "Bikundoli bia nzoto te.",
      joinCall: "Kokota na esaleli ya video",
      videoConsultation: "Esaleli ya video",
      home: "Ekuke",
      dashboard: "Tableau ya bokambi",
      no_auth: "Kota na akonti",
      loading: "Ekargement...",
      error: "Esika moko esalemi",
      retry: "Bozongisa",
      cancel: "Kokanga",
      confirm: "Koloba ee",
      appointmentDetails: "Makambo ya bokweliso",
      noUpcomingAppointments: "Bokweliso moko te boye",
      initializingVideo: "Kobanda masangani ya video...",
      videoUnavailable: "Video esalemaka te",
      endCall: "Kokaba bolongi",
      mute: "Kokanga mongongo",
      unmute: "Kofungola mongongo",
      startVideo: "Kobanda video",
      stopVideo: "Kotika video",
      status: {
        connected: "Ebakani",
        connecting: "Kobanda...",
        disconnected: "Esili",
        error: "Esika moko"
      }
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
      welcome: "Karibu, {{name}}",
      upcomingAppointments: "Mihadi inayokuja",
      noAppointments: "Hakuna mihadi inayokuja.",
      healthData: "Data za afya",
      noHealthData: "Hakuna data za afya zinazopatikana.",
      joinCall: "Jiunge na simu ya video",
      videoConsultation: "Mashauriano ya video",
      home: "Nyumbani",
      dashboard: "Dashibodi",
      no_auth: "Tafadhali ingia",
      loading: "Inapakia...",
      error: "Hitilafu imetokea",
      retry: "Jaribu tena",
      cancel: "Ghairi",
      confirm: "Thibitisha",
      appointmentDetails: "Maelezo ya miadi",
      noUpcomingAppointments: "Hakuna miadi inayokuja",
      initializingVideo: "Inaanzisha muunganisho wa video...",
      videoUnavailable: "Video haipatikani",
      endCall: "Maliza simu",
      mute: "Nyamazisha",
      unmute: "Rejesha sauti",
      startVideo: "Washa video",
      stopVideo: "Zima video",
      status: {
        connected: "Imeunganishwa",
        connecting: "Inaunganisha...",
        disconnected: "Imekatika",
        error: "Hitilafu ya muunganisho"
      }
    }
  }
};

// i18n Initialization
i18next.init({
  resources,
  lng: localStorage.getItem('language') || 'fr',
  fallbackLng: 'fr',
  interpolation: {
    escapeValue: false,
    format: (value, format, lng) => {
      if (value instanceof Date) {
        return new Intl.DateTimeFormat(lng, {
          dateStyle: 'medium',
          timeStyle: 'short'
        }).format(value);
      }
      return value;
    }
  },
  detection: {
    order: ['localStorage', 'navigator'],
    caches: ['localStorage']
  }
});

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
    <I18nextProvider i18n={i18next}>
      <ErrorBoundary>
        <App supabase={supabase} />
      </ErrorBoundary>
    </I18nextProvider>
  </React.StrictMode>
);
