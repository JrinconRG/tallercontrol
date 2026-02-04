import { supabase } from '../lib/supabase'


export async function subirEvidencia(file, path) {
    try {
        //verificar que el usuario esté autenticado
        console.log(' intentando obtener usuario...');
        const result = await supabase.auth.getUser();
        console.log('🔍 2. Resultado completo:', result);
        console.log('🔍 3. result.data:', result.data);


        const { data: { user }, error: userError } = result;

        console.log('🔍 4. user:', user);
        console.log('🔍 5. userError:', userError);

        if (!user || userError) {
            throw new Error('Usuario no autenticado');
        }
        console.log('✅ Usuario autenticado:', user.email);


        const { data, error } = await supabase.storage
            .from('evidencias-subprocesos')
            .upload(path, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error subiendo evidencia:', error);
        throw error;
    }
}