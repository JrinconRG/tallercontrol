import { calcularTiempoTranscurrido } from "../../../../utils/calcularTranscurrido";

export class ProcesoSinAsignar {
  constructor({
    id,
    codigoCofre,
    fechaInicio,
    fechaFin,
    referenciaNombre,
    empresaId,
    color,
    colorHex,
  }) {
    this.id = id;
    this.codigoCofre = codigoCofre;
    this.fechaInicio = fechaInicio;
    this.fechaFin = fechaFin;
    this.referenciaNombre = referenciaNombre;
    this.empresaId = empresaId;
    this.color = color;
    this.colorHex = colorHex;
  }

  duracionTotal() {
    return calcularTiempoTranscurrido(this.fechaInicio, this.fechaFin);
  }
}
