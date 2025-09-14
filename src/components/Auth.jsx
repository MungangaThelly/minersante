import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store'; // Zustand store

function Auth({ supabase }) {
  const { setUser, clearUser } = useStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // react-hook-form + zod schema
  const schema = z.object({
    email: z.string().email(t('invalid_email')),
    password: z.string().min(6, t('password_min_length')),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showUUID, setShowUUID] = useState(false);
  const [userUUID, setUserUUID] = useState('');

  const onSubmit = async ({ email, password }) => {
    setErrorMsg('');
    try {
      const response = isSignUp
        ? await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: 'Test User', role: 'miner', language: 'fr' },
            },
          })
        : await supabase.auth.signInWithPassword({ email, password });

      const { data, error } = response;

      if (error || !data?.user) {
        clearUser();
        setErrorMsg(t(isSignUp ? 'signup_failed' : 'login_failed_invalid_credentials'));
        return;
      }

      setUser(data.user);

      const role = data.user?.user_metadata?.role || 'miner';

      if (isSignUp) {
        const uuid = data.user.id;
        setUserUUID(uuid);
        setShowUUID(true);
        localStorage.setItem('user_uuid', uuid); // Optional
        return; // Stop redirect on signup to let user see UUID
      }

      switch (role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'miner':
        default:
          navigate('/dashboard');
      }
    } catch {
      clearUser();
      setErrorMsg(t(isSignUp ? 'signup_failed' : 'login_failed_invalid_credentials'));
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(userUUID);
      alert(t('uuid_copied'));
    } catch {
      alert(t('copy_failed'));
    }
  };

  const handleContinue = () => {
    setShowUUID(false);
    navigate('/dashboard'); // Or wherever you'd like
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-2 py-8">
      {/* Hero Section */}
      <div className="w-full max-w-2xl flex flex-col md:flex-row items-center justify-between gap-8 mb-12 animate-fade-in-up">
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 mb-4 drop-shadow animate-fade-in">
            {t('welcome_to')} <span className="text-blue-500">Minersanté</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-900/80 mb-6 animate-fade-in delay-100">
            {t('hero_tagline', 'Accessible healthcare for everyone, anytime.')}
          </p>
          <button
            onClick={() => document.getElementById('auth-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white font-semibold text-lg shadow-lg hover:bg-blue-700 transition-colors duration-200 animate-fade-in delay-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {t('get_started', 'Get Started')}
          </button>
        </div>
        {/* SVG Illustration */}
        <div className="flex-1 flex items-center justify-center animate-fade-in delay-150">
          <svg width="220" height="220" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="110" cy="110" r="100" fill="#e0e7ff" />
            <ellipse cx="110" cy="160" rx="60" ry="18" fill="#c7d2fe" />
            <rect x="70" y="60" width="80" height="60" rx="16" fill="#3b82f6" />
            <rect x="90" y="80" width="40" height="20" rx="6" fill="#fff" />
            <circle cx="110" cy="100" r="6" fill="#3b82f6" />
            <rect x="100" y="120" width="20" height="30" rx="6" fill="#2563eb" />
            <rect x="105" y="140" width="10" height="20" rx="5" fill="#fff" />
          </svg>
        </div>
      </div>
      {/* Feature Highlights */}
      <div className="w-full max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-in-up delay-200">
        <div className="bg-white/90 rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border border-blue-100">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-blue-600 mb-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
            <circle cx="12" cy="12" r="9" />
          </svg>
          <h3 className="font-bold text-lg mb-1">{t('Fast Booking')}</h3>
          <p className="text-blue-900/80 text-sm">{t('Book appointments in seconds with our intuitive interface.')}</p>
        </div>
        <div className="bg-white/90 rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border border-blue-100">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-blue-600 mb-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6.75A2.25 2.25 0 0 0 13.5 4.5h-3A2.25 2.25 0 0 0 8.25 6.75v7.5A2.25 2.25 0 0 0 10.5 16.5h3a2.25 2.25 0 0 0 2.25-2.25v-3.75m0 0L21 9.75m-3.75 3.75l3.75-3.75" />
          </svg>
          <h3 className="font-bold text-lg mb-1">{t('Video Consultations')}</h3>
          <p className="text-blue-900/80 text-sm">{t('Connect with healthcare professionals from anywhere.')}</p>
        </div>
        <div className="bg-white/90 rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border border-blue-100">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-blue-600 mb-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <h3 className="font-bold text-lg mb-1">{t('Secure & Private')}</h3>
          <p className="text-blue-900/80 text-sm">{t('Your health data is encrypted and confidential.')}</p>
        </div>
      </div>

      {/* Testimonials */}
      <div className="w-full max-w-3xl mx-auto mb-12 animate-fade-in-up delay-300">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">{t('What our users say')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/90 rounded-2xl shadow p-6 border border-blue-100 flex flex-col items-center text-center">
            <p className="text-blue-900/90 italic mb-2">“{t('This app made healthcare so much easier for me and my family!')}”</p>
            <span className="font-semibold text-blue-600">— A. Patient</span>
          </div>
          <div className="bg-white/90 rounded-2xl shadow p-6 border border-blue-100 flex flex-col items-center text-center">
            <p className="text-blue-900/90 italic mb-2">“{t('Booking and video calls are seamless and secure. Highly recommended!')}”</p>
            <span className="font-semibold text-blue-600">— Dr. B. Provider</span>
          </div>
          <div className="bg-white/90 rounded-2xl shadow p-6 border border-blue-100 flex flex-col items-center text-center">
            <p className="text-blue-900/90 italic mb-2">“{t('The best telemedicine experience I have had so far.')}”</p>
            <span className="font-semibold text-blue-600">— C. User</span>
          </div>
        </div>
      </div>
      <div id="auth-form" className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md border border-blue-100 animate-fade-in-up delay-300">
        <h2 className="text-3xl font-extrabold mb-8 text-center tracking-tight text-blue-700 drop-shadow">
          {t('appName')} {isSignUp ? t('signup') : t('login')}
        </h2>

  <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <label htmlFor="email" className="sr-only">{t('username')}</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={t('username')}
            className={`w-full p-2 mb-1 border rounded ${errors.email ? 'border-red-500' : ''}`}
            {...register('email')}
            disabled={isSubmitting}
          />
          {errors.email && <p className="text-red-500 text-sm mb-2">{errors.email.message}</p>}

          <label htmlFor="password" className="sr-only">{t('password')}</label>
          <input
            id="password"
            type="password"
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            placeholder={t('password')}
            className={`w-full p-2 mb-1 border rounded ${errors.password ? 'border-red-500' : ''}`}
            {...register('password')}
            disabled={isSubmitting}
          />
          {errors.password && <p className="text-red-500 text-sm mb-2">{errors.password.message}</p>}

          {errorMsg && <p className="text-red-500 mb-4">{errorMsg}</p>}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSignUp ? t('signup') : t('login')}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            className="text-sm text-blue-500 hover:underline"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg('');
            }}
          >
            {isSignUp ? t('already_have_account') : t('create_account')}
          </button>
        </div>

        <div className="mt-4">
          <LanguageSwitcher />
        </div>
      </div>

  {/* UUID Modal */}
  {showUUID && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl max-w-md w-full text-center shadow-2xl border border-blue-100">
            <h3 className="text-2xl font-bold mb-4 text-blue-700">{t('account_created')}</h3>
            <p className="mb-2">{t('your_uuid')}:</p>
            <code className="block p-2 bg-gray-100 border rounded break-all mb-4">
              {userUUID}
            </code>
            <button
              onClick={handleCopy}
              className="bg-gray-200 px-4 py-2 rounded mr-2 hover:bg-gray-300"
            >
              {t('copy')}
            </button>
            <button
              onClick={handleContinue}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {t('continue')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Auth;
