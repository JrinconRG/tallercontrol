// src/layouts/PrivateLayout.jsx
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

export default function GerenteLayout() {
    return (
        <div className="app-layout">
            <Sidebar role="gerente" />
            <Header />

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
