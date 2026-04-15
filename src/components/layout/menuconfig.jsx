export const menuSidebardByRole = {
  trabajador: [
    { label: "Inicio", icon: "Home", path: "/trabajador/inicio" },
    { label: "Historial", icon: "History", path: "/trabajador/historial" },
  ],

  gerente: [
    { label: "Inicio", icon: "Home", path: "/gerente" },
    { label: "Empleados", icon: "Users", path: "/gerente/empleados" },
    { label: "Tarifas", icon: "Banknote", path: "/gerente/tarifas" },

    { label: "Nómina", icon: "Wallet", path: "/gerente/nomina/fecha" },
    { label: "Historial", icon: "History", path: "/gerente/historial" },
  ],
};
