import {
  obtenerReferenciasCofre,
  eliminarReferenciaCofre,
  crearReferenciaCofre,
} from "../service/cofresService";

import { referenciaMapper } from "../domain/mappers/referenciaMapper";

import { mapSupabaseError } from "../../../shared/errors/mapSupabaseError";
import { cofresErrorMap } from "./errors/cofresErrorMap";

export const CofreRepository = {
  async getReferencias() {
    const data = await obtenerReferenciasCofre();
    return (data || []).map(referenciaMapper);
  },

  async deleteReferencia(referenciaId) {
    try {
      await eliminarReferenciaCofre(referenciaId);
      return referenciaId;
    } catch (error) {
      throw mapSupabaseError(error, cofresErrorMap);
    }
  },

  async createReferencia({ codigo, nombre, descripcion }) {
    try {
      const data = await crearReferenciaCofre({ codigo, nombre, descripcion });
      return referenciaMapper(data);
    } catch (error) {
      throw mapSupabaseError(error, cofresErrorMap);
    }
  },
};
