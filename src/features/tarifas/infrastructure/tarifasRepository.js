import { getMatrizPrecios, crearTarifa } from "../services/tarifaService";
import { matrizPreciosMapper } from "../domain/mappers/matrizPreciosMapper";

export const tarifaRepository = {
  async getMatrizPrecios(trabajadorId) {
    const data = await getMatrizPrecios(trabajadorId);
    return matrizPreciosMapper(data);
  },

  async guardarCambios(cambios) {
    return Promise.all(
      cambios.map(({ trabajadorCargoId, cofreId, valor }) =>
        crearTarifa(trabajadorCargoId, cofreId, valor),
      ),
    );
  },
};
