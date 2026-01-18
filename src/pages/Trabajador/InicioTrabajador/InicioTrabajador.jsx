import { useEffect, useState } from 'react'
import { obtenerProcesosActivos } from '../../../services/procesos'
import Card from '../../../components/card/card'
import './InicioTrabajador.css'
export default function InicioTrabajador() {

  const [procesos, setProcesos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargar() {
      try {
        const data = await obtenerProcesosActivos()
        setProcesos(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    cargar()
  }, [])

  if (loading) return <p>Cargando procesos…</p>

  return (
    <div className='page-content-trabajador'>
      
      <h2>Procesos activos</h2>

      {procesos.map(p => {
        const avance =
          p.total_subprocesos > 0
            ? Math.round((p.sub_finalizados / p.total_subprocesos) * 100)
            : 0

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
          </>
          }
          />
        );
      })}
    </div>
  );
}
