import { getMatrizPrecios, crearTarifa } from "../services/tarifaService";
import { matrizPreciosMapper } from "../domain/mappers/matrizPreciosMapper";
import { mapSupabaseError } from "../../../shared/errors/mapSupabaseError";
import { tarifasErrorMap } from "./errors/tarifasErrorMap";

export const tarifaRepository = {
  async getMatrizPrecios(trabajadorId) {
    try {
      const data = await getMatrizPrecios(trabajadorId);
      return matrizPreciosMapper(data);
    } catch (error) {
      throw mapSupabaseError(error, tarifasErrorMap);
    }
  },

  async guardarCambios(cambios) {
    try {
      return await Promise.all(
        cambios.map(({ trabajadorCargoId, cofreId, valor }) =>
          crearTarifa(trabajadorCargoId, cofreId, valor),
        ),
      );
    } catch (error) {
      throw mapSupabaseError(error, tarifasErrorMap);
    }
  },
};
