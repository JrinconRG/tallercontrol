//
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

export default function TrabajadorLayout() {
    return (
        <div className="app-layout">
            <Sidebar role="trabajador" />
            <Header />

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
