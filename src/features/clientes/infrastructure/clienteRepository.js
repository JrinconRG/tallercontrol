import {
  obtenerClientes,
  crearCliente,
  eliminarCliente,
} from "../service/clientesService";

import { clienteMapper } from "../domain/mappers/clienteMapper";
import { clientesErrorMap } from "./errors/clientesErrorMap";
import { mapSupabaseError } from "../../../shared/errors/mapSupabaseError";

export const ClienteRepository = {
  async getClientesActivos() {
    try {
      const data = await obtenerClientes();
      return (data || []).map(clienteMapper);
    } catch (error) {
      throw mapSupabaseError(error, clientesErrorMap);
    }
  },

  async createCliente({ nombre, celular, direccion }) {
    try {
      const data = await crearCliente({ nombre, celular, direccion });
      return clienteMapper(data);
    } catch (error) {
      throw mapSupabaseError(error, clientesErrorMap);
    }
  },
  async deleteCliente(clienteId) {
    try {
      await eliminarCliente(clienteId);
      return clienteId;
    } catch (error) {
      throw mapSupabaseError(error, clientesErrorMap);
    }
  },
};
