import { useEffect, useState } from 'react'
import { useProcesosActivos, useFaseActualProcesos } from '../../../hooks/useProcesos'
import { calcularDuracion } from '../../../utils/tiempo'
import { useSubprocesoActual } from '../../../hooks/useSubprocesos'


import Card from '../../../components/card/card'
import CrearProceso from './components/CrearProceso'
import CrearSubproceso from './components/CrearSubproceso'
import FinalizarSubproceso from './components/FinalizarSubproceso'
import ProcesoDetail from './ProcesoDetail'

import './InicioTrabajador.css'

export default function InicioTrabajador() {
  const [modalCrearProceso, setModalCrearProceso] = useState(false)
  const [modalCrearSubproceso, setModalCrearSubproceso] = useState(false)
  const [contextoFase, setContextoFase] = useState(null)

  const [modalFinalizar, setModalFinalizar] = useState(false);
  const [subprocesoSeleccionado, setSubprocesoSeleccionado] = useState(null);




  //funcioon abrir modal finalizar subproceso
  function abrirModalFinalizar(subproceso) {
    setSubprocesoSeleccionado({
      subproceso,

    });


    setModalFinalizar(true);
  }


  //hook para obtener procesos activos
  const {
    procesos,
    loading: loadingProcesos,
    refetch: refetchProcesos
  } = useProcesosActivos();

  //hook para obtener fases actuales
  const {
    fases,
    loading: loadingFases,
    refetch: refetchFases
  } = useFaseActualProcesos();

  //hook para obtener información de subproceso actual
  const {
    data: subprocesosActivos,
    loading: loadingSubprocesos,
    refetch: refetchSubprocesos
  } = useSubprocesoActual();

  //Actualizar duraacion cada minuto
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 60000); // cada 60 segundos
    return () => clearInterval(interval);
  }, []);



  function abrirModalIniciarFase(proceso, fase) {
    setContextoFase({ proceso, fase })
    setModalCrearSubproceso(true)
  }

  async function handleSuccess() {
    await Promise.all([
      refetchProcesos(),
      refetchFases(),
      refetchSubprocesos()
    ]);
  }
  const loading = loadingProcesos || loadingFases || loadingSubprocesos;

  if (loading) return <p>Cargando procesos…</p>





  return (
    <div className='page-content-trabajador'>
      <div className='trabajador-header'>
        <div className='trabajador-header-title'>
          <h2>Procesos activos</h2>
        </div>
        <div className='trabajador-header-actions'>
          <button className='btn btn-primary'
            onClick={() => setModalCrearProceso(true)}
          >
            Crear Proceso
          </button>
        </div>
      </div>


      <div className="grid-procesos">
        {procesos.map(p => {

          const fase = fases.find(f => f.pro_id_proceso === p.pro_id_proceso);

          const fasesCompletadas = fase?.fases_completadas || 0;
          const totalFases = fase?.total_fases || 1;
          const avance = Math.round((fasesCompletadas / totalFases) * 100);


          //subproceso actuvo
          const subprocesoActual = subprocesosActivos.find(
            sub => sub.sub_proceso_id === p.pro_id_proceso
          );



          return (
            <Card
              key={p.pro_id_proceso}
              title={``}
            >
              <ProcesoDetail
                proceso={p}
                fase={fase}
                subprocesoActual={subprocesoActual}
                fasesCompletadas={fasesCompletadas}
                totalFases={totalFases}
                avance={avance}
                calcularDuracion={calcularDuracion}
                onIniciarFase={abrirModalIniciarFase}
                onFinalizarFase={(data) =>
                  abrirModalFinalizar({
                    ...data,
                    pro_id_proceso: p.pro_id_proceso,
                    rc_nombre: p.rc_nombre,
                    rc_codigo: p.rc_codigo,
                    id_nombre_proceso: p.pro_codigo_cofre,
                    nombre_fase: fase?.siguiente_cargo_nombre
                  })
                }
              />
            </Card>


          );

        })}
      </div>

      {modalCrearProceso && (
        <CrearProceso
          onClose={() => setModalCrearProceso(false)}
          onSuccess={handleSuccess}
        />
      )}
      {modalCrearSubproceso && (
        <CrearSubproceso
          contexto={contextoFase}
          onClose={() => setModalCrearSubproceso(false)}
          onSuccess={handleSuccess}
        />
      )}

      {modalFinalizar && (
        <FinalizarSubproceso
          subproceso={subprocesoSeleccionado}
          onClose={() => setModalFinalizar(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}