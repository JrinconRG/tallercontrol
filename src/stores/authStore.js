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
                    // Validar credenciales con la tabla personalizada tbl_usuarios
                    const { data, error } = await supabase.rpc('validar_login', {
                        p_usuario: usuario,
                        p_password: password
                    })

                    if (error) throw error
                    if (!data || data.length === 0) throw new Error('Usuario o contraseña incorrectos')

                    const userData = data[0]

                    //Crear sesion real de supabase Auth con el email del usuario
                    const email = `${usuario}@tuempresa.local`
                    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                        email: email,
                        password: password

                    })

                    if (authError) {
                        console.error('Error creando sesion de supabase:', authError)
                        throw new Error('Error de autenticación')

                    }
                    console.log('✅ Sesión de Supabase creada:', authData.user.email)
                    // guardar datos en zustand
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

            logout: async () => {
                // Cerrar sesión en Supabase Auth
                await supabase.auth.signOut()
                console.log('✅ Sesión de Supabase cerrada')
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