import { obtenerCargos } from "../service/cargosService";
import { cargoMapper } from "../domain/mappers/cargoMapper";

export const cargoRepository = {
  async getCargos() {
    const data = await obtenerCargos();
    return (data || []).map(cargoMapper);
  },
};
