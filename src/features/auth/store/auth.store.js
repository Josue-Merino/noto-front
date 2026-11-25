import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      session: null,
      status: 'idle', // 'idle' | 'authenticated' | 'unauthenticated'

      setSession: (sessionData) =>
        set({
          user: sessionData?.user || null,
          session: sessionData?.session || sessionData || null,
          status: 'authenticated',
        }),

      updateUser: (updatedUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : updatedUser,
        })),

      clearSession: () =>
        set({
          user: null,
          session: null,
          status: 'unauthenticated',
        }),
    }),
    {
      name: 'noto_auth_storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        status: state.status === 'authenticated' ? 'authenticated' : 'unauthenticated',
      }),
    }
  )
)
