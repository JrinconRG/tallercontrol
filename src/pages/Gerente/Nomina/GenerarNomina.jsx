import StepperNomina from "../../../components/Stepper/StepperNomina";
import Card from "../../../components/card/Card";
import DatePicker from "../../../components/DatePicker/DatePicker";
import { useNavigate } from "react-router-dom";
import "./GenerarNomina.css";

export default function GenerarNomina() {
  const navigate = useNavigate();

  const handlePaso = (numero) => {
    const rutas = {
      1: "gerente/nomina/fecha",
      2: "gerente/nomina/detalle",
      3: "gerente/nomina/exportar",
    };
    navigate(rutas[numero]);
  };

  return (
    <div className="page-conten-nomina">
      <div className="header-page">
        <h1 className="page-tittle">Generar nueva nomina</h1>
      </div>
      <div className="page-nomina-stepper">
        <StepperNomina pasoActual={1} onSelectPaso={handlePaso} />
      </div>
      <div className="page-nomina-info">
        <div className="page-nomina-calendario">
          <Card>
            <DatePicker mode="range" />{" "}
          </Card>
        </div>
        <Card>
          <h3 className="page-nomina-subtittle">
            Información general de la nómina generada
          </h3>
        </Card>
      </div>
    </div>
  );
}
