export function calcularDuracion(fechaInicio) {
    if(!fechaInicio) return 'Sin Iniciar';

    const inicio = new Date(fechaInicio);
    const ahora = new Date();
    const diffMs = ahora - inicio ;


    const minutos = Math.floor(diffMs / 60000);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if(dias > 0){
        return `${dias} día${dias > 1 ? 's' : ''} ${horas % 24}h`;
    }
    if(horas > 0){
        return `${horas}h ${minutos % 60}min`;
    }  
    return `${minutos} min`;

}