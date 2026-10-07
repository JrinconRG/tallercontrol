import { obtenerCargos } from "../service/cargosService";
import { cargoMapper } from "../domain/mappers/cargoMapper";
import { mapSupabaseError } from "../../../shared/errors/mapSupabaseError";

export const cargoRepository = {
  async getCargos() {
    try {
      const data = await obtenerCargos();
      return (data || []).map(cargoMapper);
    } catch (error) {
      throw mapSupabaseError(error);
    }
  },
};
