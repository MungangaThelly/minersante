import { create } from 'zustand';

export const useStore = create((set) => ({
  user: null,
  appointments: [],
  healthData: [],
  setUser: (user) => set({ user }),
  setAppointments: (appointments) => set({ appointments }),
  addHealthData: (data) => set((state) => ({
    healthData: [...state.healthData, data]
  })),
}));
