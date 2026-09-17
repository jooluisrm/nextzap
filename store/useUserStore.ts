import { TypeUser } from '@/types/type-user'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type UserStore = {
    user: TypeUser | null
    setUser: (user: TypeUser | null) => void
    clearUser: () => void
}

export const useUserStore = create<UserStore>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
            clearUser: () => set({ user: null }),
        }),
        {
            name: 'user-storage', // salva no localStorage para manter os dados no refresh
        }
    )
)
