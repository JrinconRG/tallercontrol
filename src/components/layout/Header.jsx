import "../../styles/header.css";

export default function Header() {
  return (
    <header className="header">
      <div className="header-title">Nómina</div>

      <div className="header-actions">
        <button className="header-button">Generar nómina</button>
      </div>
    </header>
  );
}
