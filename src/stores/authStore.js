import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            role: null, // 'trabajador' | 'gerente'
            isAuthenticated: false,
            isLoading: false,

            login: async (usuario, password) => {
                set({ isLoading: true })

                try {
                    // Validar credenciales
                    const { data, error } = await supabase.rpc('validar_login', {
                        p_usuario: usuario,
                        p_password: password
                    })

                    if (error) throw error
                    if (!data || data.length === 0) throw new Error('Usuario o contraseña incorrectos')

                    const userData = data[0]

                    set({
                        user: userData,
                        role: userData.rol,
                        isAuthenticated: true,
                        isLoading: false
                    })

                    return { success: true, role: userData.rol }
                } catch (error) {
                    set({ isLoading: false })
                    return { success: false, error: error.message }
                }
            },

            logout: () => {
                set({
                    user: null,
                    role: null,
                    isAuthenticated: false
                })
            }
        }),
        {
            name: 'tallercontrol-auth'
        }
    )
)