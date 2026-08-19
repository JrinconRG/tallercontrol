import { calcularTiempoTranscurrido } from "../../../../utils/calcularTranscurrido";

export class ProcesoSinAsignar {
  constructor({
    id,
    codigoCofre,
    fechaInicio,
    fechaFin,
    referenciaNombre,
    empresaId,
  }) {
    this.id = id;
    this.codigoCofre = codigoCofre;
    this.fechaInicio = fechaInicio;
    this.fechaFin = fechaFin;
    this.referenciaNombre = referenciaNombre;
    this.empresaId = empresaId;
  }

  duracionTotal() {
    return calcularTiempoTranscurrido(this.fechaInicio, this.fechaFin);
  }
}
