import { use, useEffect, useState } from 'react'
import { useProcesosActivos, useFaseActualProcesos } from '../../../hooks/useProcesos'
import { calcularDuracion } from '../../../utils/tiempo'
import { useSubprocesoActual } from '../../../hooks/useSubprocesos'


import Card from '../../../components/card/card'
import CrearProceso from './components/CrearProceso'
import CrearSubproceso from './components/CrearSubproceso'
import FinalizarSubproceso from './components/FinalizarSubproceso'


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
              title={`Cofre   ${p.rc_nombre} - ${p.rc_codigo}`}
              description="">
              <div className={`card-body ${subprocesoActual ? "activo" : "inactivo"}`}>
                {/*lado izquiero - info del proceso */}
                <div className="info-principal">
                  <div className="info-titulo">
                    <p><span className="label">Id:</span>  {p.pro_codigo_cofre}</p>
                    <p><span className="label">Estado:</span> {p.pro_estado}</p>
                  </div>

                  <progress
                    value={fasesCompletadas}
                    max={totalFases}
                  />

                  <p>{avance}% completado ({fasesCompletadas}/{totalFases} fases)</p>
                  {fase?.siguiente_fase_orden && !subprocesoActual && (
                    <div className="acciones-proceso">
                      <button
                        className="btn-secondary"
                        onClick={() => abrirModalIniciarFase(p, fase)}
                      >
                        Iniciar fase {fase.siguiente_fase_orden}
                      </button>
                    </div>
                  )}
                </div>

                {subprocesoActual ? (
                  <div className="panel-activo">
                    <h4>Fase en Proceso</h4>
                    <div className="info-subproceso">
                      <p>
                        <strong>Fase:</strong> {fase?.siguiente_fase_orden} - {fase?.siguiente_cargo_nombre}
                      </p>
                      <p>
                        <strong>Encargado:</strong> {subprocesoActual.t_nombre}
                      </p>
                      <p>
                        <strong>Estado:</strong>
                        <span className="badge badge-proceso">
                          {subprocesoActual.sub_estado}
                        </span>
                      </p>
                      <p>
                        <strong>Duración:</strong>
                        <span className="duracion">
                          {calcularDuracion(subprocesoActual.sub_fecha_inicio)}
                        </span>
                      </p>
                      <button
                        className="btn btn-danger"
                        onClick={() => abrirModalFinalizar({
                          ...subprocesoActual,
                          pro_id_proceso: p.pro_id_proceso,
                          rc_nombre: p.rc_nombre,
                          rc_codigo: p.rc_codigo,
                          id_nombre_proceso: p.pro_codigo_cofre,

                          nombre_fase: fase?.siguiente_cargo_nombre
                        })}
                      >
                        Finalizar fase
                      </button>


                    </div>
                  </div>
                ) : (
                  <div className="estado-espera">
                    <p>   Aún no ha iniciado el proceso</p>
                  </div>
                )}
              </div>
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