import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store'; // Zustand store

function Auth({ supabase }) {
  const { setUser, clearUser } = useStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const { email, password } = credentials;

    if (!email || !password) {
      setErrorMsg(t('please_fill_all_fields'));
      return;
    }

    try {
      const response = isSignUp
        ? await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: 'Test User',
                role: 'miner',
                language: 'fr',
              },
            },
          })
        : await supabase.auth.signInWithPassword({ email, password });

      const { data, error } = response;

      if (error || !data?.user) {
        console.error('Auth error:', error);
        clearUser();
        setErrorMsg(t(isSignUp ? 'signup_failed' : 'login_failed_invalid_credentials'));
        return;
      }

      setUser(data.user); // Zustand setUser
      navigate('/dashboard');
    } catch (err) {
      console.error('Unexpected auth error:', err);
      clearUser();
      setErrorMsg(t(isSignUp ? 'signup_failed' : 'login_failed_invalid_credentials'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {t('appName')} {isSignUp ? t('signup') : t('login')}
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder={t('username')}
            className="w-full p-2 mb-4 border rounded"
            value={credentials.email}
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
            required
          />
          <input
            type="password"
            name="password"
            placeholder={t('password')}
            className="w-full p-2 mb-4 border rounded"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            required
          />

          {errorMsg && <p className="text-red-500 mb-4">{errorMsg}</p>}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
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
    </div>
  );
}

export default Auth;
