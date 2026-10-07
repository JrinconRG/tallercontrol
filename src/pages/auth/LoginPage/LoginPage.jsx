import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";
import { validateLoginCredentials } from "../../../utils/authValidation";
import toast from "react-hot-toast";
import "../../../styles/login.css";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Invocación del utilitario modular de validaciones
    const validation = validateLoginCredentials(identifier, password);

    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    const result = await login(validation.cleanIdentifier, validation.password);

    if (result.success) {
      toast.success("Inicio de sesión exitoso.");

      if (result.role === "gerente") {
        navigate("/gerente", { replace: true });
      } else {
        navigate("/trabajador/inicio", { replace: true });
      }
    } else {
      toast.error(result.error || "Credenciales incorrectas.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <h2>Iniciar Sesión</h2>

          <p className="login-texto-imputs">Ingrese su usuario o correo:</p>
          <input
            className="input-login"
            type="text"
            placeholder="Usuario o Correo"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="username"
            disabled={isLoading}
          />

          <p className="login-texto-imputs">Ingrese su contraseña:</p>
          <input
            className="input-login"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            disabled={isLoading}
          />

          <div className="login-button-container">
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Ingresando..." : "Iniciar Sesión"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
