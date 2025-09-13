import { render, screen } from '@testing-library/react';
import App from '../App';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

/* global describe, it, expect */
// Mock Zustand store for test isolation
vi.mock('../store', () => {
  return {
    useStore: () => ({ user: null, loading: false }),
  };
});

// Mock i18n to always return the key
vi.mock('react-i18next', async () => {
  const actual = await vi.importActual('react-i18next');
  return {
    ...actual,
    useTranslation: () => ({ t: (k) => k, i18n: { language: 'en', changeLanguage: () => {} } }),
  };
});

describe('App', () => {
  it('renders login button', () => {
    render(<App supabase={{}} />);
    // Look for the login button by role and label
    const loginBtn = screen.getByRole('button', { name: /login/i });
    expect(loginBtn).toBeInTheDocument();
  });
});
