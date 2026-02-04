import { useState , useEffect } from 'react'
import Modal from '../../../../components/modal/Modal'
import { obtenerReferenciasCofre } from '../../../../services/cofres'
import { crearProceso } from '../../../../services/procesos'


export default function CrearProceso({ onClose, onSuccess }) {
    const[referencias, setReferencias] = useState([])
    const[referenciaId, setReferenciaId] = useState('')
    const[loading, setLoading] = useState(false)


    useEffect(() => {
        async function cargarReferencias() {
            try {
                const data = await obtenerReferenciasCofre()
                setReferencias(data)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        cargarReferencias()
    }, [])


    async function handleConfirmar() {
        if (!referenciaId) return
    
        try {
          await crearProceso(referenciaId)
          onSuccess()
          onClose()
        } catch (error) {
          console.error(error)
        }
      }

      return (
        <Modal
        isOpen
        title="Crear proceso"
        confirmText="Crear Proceso"
        onConfirm={handleConfirmar}
        onClose={onClose}
        >
            {loading? (
                <p>Cargando referencias...</p>
            ) : (
            <>
            <label>Referencia de cofre</label>
                <select 
                value={referenciaId} 
                onChange={(e) => setReferenciaId(e.target.value)}
            >
                <option value="">Seleccione una referencia</option>
                {referencias.map(ref => (
                  <option key={ref.rc_id} value={ref.rc_id}>
                    {ref.rc_nombre}({ref.rc_codigo})
                    </option>
                ))}
                </select>
    
    
            </>
            )}
        </Modal>
        )
    }
