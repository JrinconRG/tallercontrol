export class SubProceso {
  constructor({
    id,
    idProceso,
    codigoCofre,
    trabajadorId,
    trabajadorNombreCompleto,
    trabajadorDocumento,
    referenciaId,
    referenciaNombre,
    fechaInicio,
    fechaFin,
    estado,
    fotosEvidencia = [],
    duracion,
    pagado,
    valor,
    cargoId,
    cargoNombre,
    ordenProceso,
  }) {
    this.id = id;
    this.idProceso = idProceso;
    this.trabajadorId = trabajadorId;
    this.codigoCofre = codigoCofre;
    this.referenciaId = referenciaId;
    this.referenciaNombre = referenciaNombre;
    this.trabajadorNombreCompleto = trabajadorNombreCompleto;
    this.trabajadorDocumento = trabajadorDocumento;
    this.fechaInicio = fechaInicio;
    this.fechaFin = fechaFin;
    this.estado = estado;
    this.fotosEvidencia = fotosEvidencia;
    this.duracion = duracion;
    this.pagado = pagado;
    this.valor = valor;
    this.cargoId = cargoId;
    this.cargoNombre = cargoNombre;
    this.ordenProceso = ordenProceso;
  }

  estaActivo() {
    return this.estado === "activo" || this.estado === "en_proceso";
  }
  estaFinalizado() {
    return this.estado === "finalizado";
  }
  esPagado() {
    return this.pagado === true;
  }

  duracionFormateada() {
    if (!this.duracion) return "Sin registro";
    return this.duracion;
  }
}
