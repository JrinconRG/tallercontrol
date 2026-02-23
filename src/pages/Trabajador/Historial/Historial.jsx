
import React, { useState } from "react";
import { useHistorialProcesos } from "../../../hooks/useProcesos";
import Table from "../../../components/Table/Table";
import TableHeader from "../../../components/Table/TableHeader";
import Card from "../../../components/card/card";
import "./Historial.css";
export default function Historial() {
    const [search, setSearch] = useState('');
    const [estado, setEstado] = useState('');


    // uso de hook personalizado para obtener el historial de procesos 
    const { historial, loading, error } = useHistorialProcesos();
    if (loading) return <p>Cargando historial..</p>




    return (

        <div className="page-content-historial">
            <Card className="card-historial" style={{ backgroundColor: '#ffffff' }} >
                <TableHeader
                    searchValue={search}
                    onSearchChange={setSearch}
                    filters={[
                        {
                            name: 'estado', value: estado, onChange: setEstado, options: [

                            ]
                        }
                    ]}
                ></TableHeader>

                <Table
                    columns={[
                        {
                            key: 'pro_codigo_cofre',
                            label: 'Código',
                            className: 'col-sh'
                        },
                        {
                            key: 'rc_nombre',
                            label: 'Nombre del Cofre',
                            className: 'col-main'
                        },
                        {
                            key: 'pro_fecha_inicio',
                            label: 'Inicio',
                            className: 'col-date',
                            render: (row) => new Date(row.pro_fecha_inicio).toLocaleDateString()
                        },
                        {
                            key: 'pro_fecha_fin',
                            label: 'Fin',
                            className: 'col-date',
                            render: (row) => row.pro_fecha_fin ? new Date(row.pro_fecha_fin).toLocaleDateString() : '-'
                        },
                        {
                            key: 'total_acumulado',
                            label: 'Total Ganado',
                            className: 'col-num',
                            render: (row) => `$${row.total_acumulado?.toLocaleString()}`
                        },
                        {
                            key: 'pro_estado',
                            label: 'Estado',
                            className: 'col-status',
                            render: (row) => (
                                <span className={`badge-${row.pro_estado}`}>
                                    {row.pro_estado.toUpperCase()}
                                </span>
                            )
                        },
                    ]}
                    data={historial}
                    onRowClick={(row) => console.log("Ver detalle del cofre", row.pro_id_proceso)}
                />
            </Card>

        </div>
    );

}




