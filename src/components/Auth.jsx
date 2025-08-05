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
  const [showUUID, setShowUUID] = useState(false);
  const [userUUID, setUserUUID] = useState('');

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
    } catch (err) {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {t('appName')} {isSignUp ? t('signup') : t('login')}
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder={t('username')}
            className="w-full p-2 mb-4 border rounded"
            value={credentials.email}
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
            required
          />
          <input
            type="password"
            name="password"
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
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

      {/* UUID Modal */}
      {showUUID && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full text-center shadow-lg">
            <h3 className="text-xl font-semibold mb-4">{t('account_created')}</h3>
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
