import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            role: null, // 'trabajador' | 'gerente'
            empresaId: null,
            empresaNombre: null,
            isAuthenticated: false,
            isLoading: false,

            login: async (usuario, password) => {
                set({ isLoading: true })

                try {
                    console.log('🔐 Iniciando login para:', usuario)

                    // Validar credenciales con la tabla personalizada tbl_usuarios
                    const { data: userData, error: validationError } = await supabase.rpc('validar_login', {
                        p_usuario: usuario,
                        p_password: password
                    })

                    if (validationError) throw validationError
                    if (!userData || userData.length === 0) {
                        throw new Error('Usuario o contraseña incorrectos')
                    }

                    const user = userData[0]


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
                    //3. actualizar u_auth_user_id si no existe
                    if (!user.u_auth_user_id) {
                        console.log('🔗 Vinculando usuario...')
                        const { error: updateError } = await supabase
                            .from('tbl_usuarios')
                            .update({ u_auth_user_id: authData.user.id })
                            .eq('u_id', user.u_id)

                        if (updateError) {
                            console.error('⚠️ Error vinculando usuario:', updateError)
                        } else {
                            console.log('✅ Usuario vinculado exitosamente')
                        }
                    }
                    // guardar datos en zustand
                    const newState = {
                        user: {
                            id: user.u_id,
                            nombre: user.u_nombre,
                            usuario: user.u_usuario,
                            authUserId: authData.user.id
                        },
                        role: user.u_rol,
                        empresaId: user.u_empresa_id,
                        empresaNombre: user.empresa_nombre,
                        isAuthenticated: true,
                        isLoading: false
                    }

                    console.log('💾 Guardando estado:', newState)
                    set(newState)

                    console.log('✅ Login exitoso')
                    return {
                        success: true,
                        role: user.u_rol
                    }

                } catch (error) {
                    set({
                        isLoading: false,
                        isAuthenticated: false,
                    })
                    return { success: false, error: error.message }
                }
            },

            logout: async () => {
                // Cerrar sesión en Supabase Auth
                await supabase.auth.signOut()
                set({
                    user: null,
                    role: null,
                    empresaId: null,
                    empresaNombre: null,
                    isAuthenticated: false,
                    authUserId: null


                })
            },
            // Helper para debugging
            getState: () => get()

        }),
        {
            name: 'tallercontrol-auth'
        }
    )
)