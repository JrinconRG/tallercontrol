Sigec - Frontend

Sistema de gestión de procesos de fabricación de cofres fúnebres. Permite a los trabajadores registrar actividades con evidencia fotográfica y tiempos exactos, mientras el gerente supervisa en tiempo real y genera nóminas automáticas.

## 🎯 Características

- 🔐 **Autenticación dual**: Modo trabajador y gerente
- 📸 **Evidencia fotográfica**: Captura de fotos por subproceso
- ⏱️ **Registro de tiempos**: Cálculo automático de duración
- 💰 **Generación de nómina**: Automática basada en trabajo registrado
- 📊 **Dashboard en tiempo real**: Estado de procesos activos
- 📱 **PWA**: Instalable en tablets para uso en taller

## 🛠️ Tecnologías

- **React 18** - Framework UI
- **Vite** - Build tool y dev server
- **Supabase** - Backend as a Service (PostgreSQL)
- **Zustand** - State management
- **React Router** - Navegación
- **TailwindCSS** - Estilos (opcional)

## 📋 Prerequisitos

- Node.js 18+ y npm
- Cuenta en [Supabase](https://supabase.com)
- Navegador moderno (Chrome, Firefox, Safari)

## 🚀 Instalación

1. **Clonar el repositorio**
```bash
   git clone https://github.com/tu-usuario/tallercontrol-frontend.git
   cd tallercontrol-frontend
```

2. **Instalar dependencias**
```bash
   npm install
```

3. **Configurar variables de entorno**
   
   Crea un archivo `.env` en la raíz del proyecto:
```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

4. **Iniciar servidor de desarrollo**
```bash
   npm run dev
```

5. **Abrir en el navegador**
```
   http://localhost:5173

