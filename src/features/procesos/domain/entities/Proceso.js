export class Proceso {
  constructor({
    id,
    codigoCofre,
    estado,
    totalAcumulado,
    fechaInicio,
    ultimaFaseOrden,
    siguienteFaseOrden,
    siguienteCargoId,
    siguienteCargoNombre,
    totalFases,
    fasesCompletadas,
    fechaFin,
    pagado,
    referenciaId,
    referenciaCodigoNombre,
    referenciaNombre,
    detalleSubprocesos = [],
  }) {
    this.id = id;
    this.totalAcumulado = totalAcumulado;
    this.referenciaId = referenciaId;
    this.codigoCofre = codigoCofre;
    this.estado = estado;
    this.fechaInicio = fechaInicio;
    this.ultimaFaseOrden = ultimaFaseOrden;
    this.siguienteFaseOrden = siguienteFaseOrden;
    this.siguienteCargoId = siguienteCargoId;
    this.siguienteCargoNombre = siguienteCargoNombre;
    this.totalFases = totalFases;
    this.fasesCompletadas = fasesCompletadas;
    this.fechaFin = fechaFin;
    this.pagado = pagado;
    this.referenciaCodigoNombre = referenciaCodigoNombre;
    this.referenciaNombre = referenciaNombre;
    this.detalleSubprocesos = detalleSubprocesos;
  }
  estaActivo() {
    return this.estado === "activo" || this.estado === "en_proceso";
  }
  estaFinalizado() {
    return this.estado === "finalizado";
  }

  obtenerEstadoDetallado() {
    const todasFinalizadas = this.detalleSubprocesos.every((sub) =>
      sub.estaFinalizado(),
    );
    if (todasFinalizadas) {
      return "Completado";
    }

    const faseEnCurso = this.detalleSubprocesos.find(
      (sub) => sub.estado === "en_proceso",
    );
    if (faseEnCurso) {
      return `En ${faseEnCurso.cargoNombre}`;
    }

    const primeraPendiente = this.detalleSubprocesos.find(
      (sub) => sub.estado === "pendiente",
    );

    if (primeraPendiente) {
      if (primeraPendiente.ordenProceso === 1) {
        return "Sin Iniciar";
      }
      return `Espera: ${primeraPendiente.cargoNombre}`;
    }

    return "Desconocido";
  }
}
