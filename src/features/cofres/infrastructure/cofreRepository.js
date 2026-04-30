import { obtenerReferenciasCofre } from "../service/cofresService";
import { referenciaMapper } from "../domain/mappers/referenciaMapper";

export const CofreRepository = {
  async getReferencias() {
    const data = await obtenerReferenciasCofre();
    return (data || []).map(referenciaMapper);
  },
};
