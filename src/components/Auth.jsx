import { useState } from 'react';
import { create } from 'zustand';
import { useNavigate } from 'react-router-dom'; // 👈 Import navigate
import LanguageSwitcher from './LanguageSwitcher.jsx';
import { useTranslation } from 'react-i18next';


export const useStore = create((set) => ({
  user: null,
  appointments: [],
  healthData: [],
  setUser: (user) => set({ user }),
  setAppointments: (appointments) => set({ appointments }),
  addHealthData: (data) => set((state) => ({ healthData: [...state.healthData, data] })),
}));

function Auth({ supabase }) {
  const { setUser } = useStore();
  const { t } = useTranslation();
  const navigate = useNavigate(); // 👈 Hook to redirect after login

  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Login handler
  const handleLogin = async () => {
    console.log("Attempting login with:", credentials.email, credentials.password);
    setErrorMsg('');
    try {
      const response = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      console.log('Supabase login response:', response);

      const { data, error } = response;

      if (error) {
        console.error('Login error:', error);
        setErrorMsg(t('login_failed_invalid_credentials'));
        return;
      }

      if (data?.user) {
        console.log('Login success:', data.user);
        setUser(data.user);
        navigate('/dashboard'); // ✅ Redirect to dashboard
      } else {
        console.warn('Login failed: no user returned');
        setErrorMsg(t('login_failed_invalid_credentials'));
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      setErrorMsg(t('login_failed_invalid_credentials'));
    }
  };

  // Signup handler
  const handleSignUp = async () => {
    setErrorMsg('');
    try {
      const response = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: "Test User",
            role: "miner",
            language: "fr",
          },
        },
      });
      console.log('Supabase signup response:', response);

      const { data, error } = response;

      if (error) {
        console.error('Sign-up error:', error);
        setErrorMsg(t('signup_failed'));
        return;
      }

      if (data?.user) {
        console.log('User created:', data.user);
        setUser(data.user);
        navigate('/dashboard'); // ✅ Redirect after signup
      } else {
        console.warn('Sign-up failed: no user returned');
        setErrorMsg(t('signup_failed'));
      }
    } catch (error) {
      console.error('Unexpected sign-up error:', error);
      setErrorMsg(t('signup_failed'));
    }
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!credentials.email || !credentials.password) {
      setErrorMsg(t('please_fill_all_fields'));
      return;
    }

    try {
      if (isSignUp) {
        await handleSignUp();
      } else {
        await handleLogin();
      }
    } catch (error) {
      console.error('Unexpected submit error:', error);
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
            autoComplete={isSignUp ? "new-password" : "current-password"}
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
