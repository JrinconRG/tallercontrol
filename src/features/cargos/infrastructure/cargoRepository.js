import { obtenerCargos } from "../service/cargosService";
import { cargoMapper } from "../domain/mappers/cargoMapper";
import { mapSupabaseError } from "../../../shared/errors/mapSupabaseError";
import { cargosErrorMap } from "./errors/cargosErrorMap";

export const cargoRepository = {
  async getCargos() {
    try {
      const data = await obtenerCargos();
      return (data || []).map(cargoMapper);
    } catch (error) {
      throw mapSupabaseError(error, cargosErrorMap);
    }
  },
};
