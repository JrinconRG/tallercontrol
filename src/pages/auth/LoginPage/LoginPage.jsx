import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";
import toast from "react-hot-toast";
import "../../../styles/login.css";

export default function LoginPage() {
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');

    const { login, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!usuario || !password) {
            toast.error("Por favor, complete todos los campos.");
            return
        }

        const result = await login(usuario, password);

        if (result.success) {

            toast.success("Inicio de sesión exitoso.")

            if (result.role === 'gerente') {
                navigate("/gerente")
            } else {
                navigate("/InicioTrabajador")
            }
        } else {
            toast.error(result.error || "Error al iniciar sesión.");
        }
    }
    return (
        <div className="login-page">
            <div className="login-card">
                <form className="login-form" onSubmit={handleSubmit}>
                    <h2>Iniciar Sesión</h2>

                    <p className="login-texto-imputs"> Ingrese su usuario:</p>

                    <input
                        type="text"
                        placeholder="Usuario"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                    />
                    <p className="login-texto-imputs"> Ingrese su contraseña:</p>
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className="login-button-container">
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? "Cargando..." : "Iniciar Sesión"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}