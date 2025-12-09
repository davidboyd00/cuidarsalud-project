import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      // Login
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.login({ email, password });
          const { user, token } = response.data.data;
          
          localStorage.setItem('token', token);
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            message: error.response?.data?.message || 'Error al iniciar sesión',
          };
        }
      },

      // Register
      register: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.register(userData);
          const { user, token } = response.data.data;
          
          localStorage.setItem('token', token);
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            message: error.response?.data?.message || 'Error al registrarse',
          };
        }
      },

      // Logout
      logout: () => {
        localStorage.removeItem('token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      // Fetch current user
      fetchUser: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        try {
          const response = await authAPI.getMe();
          set({
            user: response.data.data,
            isAuthenticated: true,
          });
        } catch (error) {
          localStorage.removeItem('token');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },

      // Update profile
      updateProfile: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.updateProfile(userData);
          set({
            user: response.data.data,
            isLoading: false,
          });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            message: error.response?.data?.message || 'Error al actualizar perfil',
          };
        }
      },

      // Change password
      changePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true });
        try {
          await authAPI.changePassword({ currentPassword, newPassword });
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            message: error.response?.data?.message || 'Error al cambiar contraseña',
          };
        }
      },

      // Check if user is admin
      isAdmin: () => get().user?.role === 'ADMIN',
      
      // Check if user is staff or admin
      isStaff: () => ['ADMIN', 'STAFF'].includes(get().user?.role),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
