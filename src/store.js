import { create } from 'zustand';

export const useStore = create((set) => ({
  user: null,
  loading: true, // Initially true while checking auth
  appointments: [],
  healthData: [],

  setUser: (user) => set({ user, loading: false }),
  clearUser: () => set({ user: null, loading: false, appointments: [], healthData: [] }),
  reset: () => set({ user: null, loading: false, appointments: [], healthData: [] }),

  setAppointments: (appointments) => set({ appointments }),

  addHealthData: (data) =>
    set((state) => {
      const exists = state.healthData.some((item) => item.id === data.id);
      if (exists) return {};
      return { healthData: [...state.healthData, data] };
    }),
}));
