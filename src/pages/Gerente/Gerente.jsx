import { Outlet } from "react-router-dom";

export default function Gerente() {
    return (
        <div>
            Página de administración
            <Outlet />
        </div>
    );
}