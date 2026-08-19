export const menuSidebardByRole = {
  trabajador: [
    { label: "Inicio", icon: "Home", path: "/trabajador/inicio" },
    { label: "Historial", icon: "History", path: "/trabajador/historial" },
  ],

  gerente: [
    { label: "Inicio", icon: "Home", path: "/gerente", end: true },

    {
      label: "Procesos",
      icon: "Layers",
      children: [
        { label: "En curso", icon: "PlayCircle", path: "/gerente", end: true },
        {
          label: "Terminados",
          icon: "CheckCircle",
          path: "/gerente/procesos/terminados",
          end: true,
        },
      ],
    },

    {
      label: "Empleados",
      icon: "Users",
      path: "/gerente/empleados",
      end: true,
    },

    {
      label: "Nómina",
      icon: "Wallet",
      children: [
        {
          label: "Generar",
          icon: "FileText",
          path: "/gerente/nomina/fecha",
          end: true,
        },
        {
          label: "Historial",
          icon: "History",
          path: "/gerente/nomina/historial",
          end: true,
        },
      ],
    },

    {
      label: "Configuración",
      icon: "Settings",
      children: [
        {
          label: "Referencias",
          icon: "Tag",
          path: "/gerente/configuracion/referencias",
          end: true,
        },
        {
          label: "Clientes",
          icon: "Building",
          path: "/gerente/configuracion/clientes",
          end: true,
        },
        {
          label: "Tarifas",
          icon: "Banknote",
          path: "/gerente/tarifas",
          end: true,
        },
      ],
    },

    {
      label: "Historial",
      icon: "History",
      path: "/gerente/historial",
      end: true,
    },
  ],
};
