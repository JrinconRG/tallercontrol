import "../../styles/header.css";

export default function Header() {
  return (
    <header className="header">
      <div className="header-title">Nómina</div>

      <div className="header-actions">
        <div className="header-contenedor-boton">
        <button className="btn btn-header">
            Generar nómina</button>
        </div>
      </div>
    </header>
  );
}
