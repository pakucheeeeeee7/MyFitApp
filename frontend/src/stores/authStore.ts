// import { create } from 'zustand';
// import type { User } from '../types/auth';

// interface AuthState {
//   user: User | null;
//   isLoading: boolean;
//   isAuthenticated: boolean;
//   setUser: (user: User | null) => void;
//   setLoading: (loading: boolean) => void;
//   logout: () => void;
// }

// export const useAuthStore = create<AuthState>((set) => ({
//   user: null,
//   isLoading: true, // 初期状態では認証チェック中
//   isAuthenticated: false,
  
//   setUser: (user) =>
//     set({ 
//       user, 
//       isAuthenticated: !!user,
//       isLoading: false 
//     }),
  
//   setLoading: (isLoading) => set({ isLoading }),
  
//   logout: () =>
//     set({ 
//       user: null, 
//       isAuthenticated: false,
//       isLoading: false 
//     }),
// }));

import { create } from 'zustand';
import type { User } from '../types/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  
  setUser: (user) => {
    console.log('🔥 authStore.setUser called with:', user);
    set({ 
      user, 
      isAuthenticated: !!user,
      isLoading: false 
    });
    console.log('🔥 authStore updated. isAuthenticated:', !!user);
  },
  
  setLoading: (isLoading) => set({ isLoading }),
  
  logout: () =>
    set({ 
      user: null, 
      isAuthenticated: false,
      isLoading: false 
    }),
}));