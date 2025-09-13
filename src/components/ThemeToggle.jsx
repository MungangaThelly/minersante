import { useEffect, useState } from 'react';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('theme');
  if (stored) return stored;
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const isDark = theme === 'dark';
  return (
    <button
      className={`ml-4 px-3 py-1 rounded border transition font-semibold flex items-center gap-2
        ${isDark
          ? 'bg-gray-900 text-yellow-300 border-gray-700 hover:bg-gray-800'
          : 'bg-white text-blue-700 border-gray-300 hover:bg-gray-100'}
      `}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      type="button"
    >
      {isDark ? (
        <>
          <span role="img" aria-label="moon">🌙</span> <span>Dark</span>
        </>
      ) : (
        <>
          <span role="img" aria-label="sun">☀️</span> <span>Light</span>
        </>
      )}
    </button>
  );
}
