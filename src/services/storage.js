import { supabase } from '../lib/supabase'


export async function subirEvidencia(file, path) {
    try {
        //verificar que el usuario esté autenticado
        const result = await supabase.auth.getUser();


        const { data: { user }, error: userError } = result;


        if (!user || userError) {
            throw new Error('Usuario no autenticado');
        }


        const { data, error } = await supabase.storage
            .from('evidencias-subprocesos')
            .upload(path, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error subiendo evidencia:', error);
        throw error;
    }
}