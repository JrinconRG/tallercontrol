// src/layouts/PublicLayout.jsx
import { Outlet } from "react-router-dom";
import AccessibilityControl from "../accessibility/AccessibilityControl";

export default function PublicLayout() {
    return (
        <main className="public-layout">
            <Outlet />
            <AccessibilityControl />
        </main>
    );
}
