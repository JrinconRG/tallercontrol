import { useEffect, useState } from 'react'
import {
  obtenerProcesosActivos,
  obtenerFaseActualProcesos,
  crearProceso
} from '../../../services/procesos'
import { obtenerReferenciasCofre } from '../../../services/cofres'

import Card from '../../../components/card/card'
import Modal from '../../../components/modal/Modal'

import './InicioTrabajador.css'

export default function InicioTrabajador() {

  const [procesos, setProcesos] = useState([])
  const [fases, setFases] = useState([])
  const [referencias, setReferencias] = useState([])
  const [selectedReferenciaId, setSelectedReferenciaId] = useState('')

  const [loading, setLoading] = useState(true)
  const [mostrarModal, setMostrarModal] = useState(false)

  

    async function cargar() {
      try {
        setLoading(true)

        const [procesosData, fasesData, referenciasData] = await Promise.all([
          obtenerProcesosActivos(),
          obtenerFaseActualProcesos(),
          obtenerReferenciasCofre()
        ])
        setProcesos(procesosData)
        setFases(fasesData)
        setReferencias(referenciasData)
       } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }
    useEffect(() => {
      cargar()
    }, [])

  async function handleCrearProceso() {
    if (!selectedReferenciaId) return

    try {
      await crearProceso(selectedReferenciaId)
      setMostrarModal(false)
      setSelectedReferenciaId('')
      cargar()
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) return <p>Cargando procesos…</p>
  console.log(referencias)


  return (
    <div className='page-content-trabajador'>
      <div className='trabajador-header'>
        <div className='trabajador-header-title'>
        <h2>Procesos activos</h2>
        </div>
        <div className='trabajador-header-actions'>
          <button className='btn btn-primary' 
          onClick={() => setMostrarModal(true)}
          >
            Crear Proceso
          </button>
        </div>
      </div>


      <div className="grid-procesos">
      {procesos.map(p => {
        const avance =
          p.total_subprocesos > 0
            ? Math.round((p.sub_finalizados / p.total_subprocesos) * 100)
            : 0
        const fase = fases.find(
              f => f.pro_id_proceso === p.pro_id_proceso
            )


            
        return (
          <Card 
          key={p.pro_id_proceso}
          title= {`Cofre   ${p.rc_nombre} - ${p.rc_codigo}`}
          description= {`Id: ${p.pro_codigo_cofre}`}
          progress={
              <>
                <p>Estado: {p.pro_estado}</p>

                <progress
                  value={p.sub_finalizados}
                  max={p.total_subprocesos}
                />

            <p>{avance}% completado</p>
            {fase && (
              <div className="acciones-proceso">

                <button
                  className="btn-secondary"
                  onClick={() => abrirModalIniciarFase(p, fase)}
                >
                  Iniciar fase {fase.siguiente_fase_orden}
                </button>

              </div>
            )}

          </>
          }
          />
        );
      })}
      </div>

      {mostrarModal && (
        <Modal 
        isOpen={mostrarModal}
        onConfirm={handleCrearProceso}
        confirmText="Crear Proceso"
        onClose={() => setMostrarModal(false)} 
        title="Crear proceso"
        >
          <label>Referencia de cofre</label>
          <select value={selectedReferenciaId} 
                  onChange={(e) => setSelectedReferenciaId(e.target.value)}
                  >
          <option value="">Seleccione una referencia</option>
          {referencias.map(ref => (
            <option key={ref.rc_id} value={ref.rc_id}>
              {ref.rc_nombre}({ref.rc_codigo})
              </option>
          ))}
          </select>
        
        </Modal>
      )}
    </div>
  );
}

