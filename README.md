<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</div>

<br />

<div align="center">
  <h1>🚀 ScriptFlow</h1>
  <p><strong>Aplicación web moderna para gestionar, editar y ejecutar scripts</strong></p>
  <p>Editor de código integrado • Organización por carpetas • Ejecución en tiempo real • Control de acceso por roles</p>
</div>

---

## ✨ Características

- **📝 Editor de código integrado** — Editor Monaco (VS Code) con resaltado de sintaxis para Bash, Python, JavaScript, PowerShell, PHP y Go
- **📂 Organización por carpetas** — Estructura jerárquica con colores e íconos personalizables
- **▶️ Ejecución de scripts** — Ejecuta scripts directamente desde la web y ve los resultados en tiempo real
- **📋 Historial de ejecuciones** — Registro detallado de cada ejecución con salida, errores y duración
- **🔄 Control de versiones** — Historial de versiones por script con capacidad de restauración
- **🔒 Control de acceso** — Roles: admin, developer, viewer, operator
- **⭐ Scripts favoritos** — Marca scripts como favoritos para acceso rápido
- **🔐 Bloqueo y protección** — Bloquea scripts para evitar ediciones no deseadas
- **🏷️ Etiquetas** — Sistema de tags para organizar scripts
- **⏰ Cron Jobs** — Programa ejecuciones automáticas con expresiones cron
- **🔑 Gestión de secretos** — Almacena variables de entorno y credenciales de forma segura
- **📊 Dashboard** — Panel de control con estadísticas y actividad reciente
- **📋 Auditoría** — Registro completo de todas las acciones del sistema

## 🛠️ Stack Tecnológico

### Frontend
| Tecnología | Versión | Propósito |
|---|---|---|
| [React](https://react.dev/) | ^19.1 | UI Framework |
| [TypeScript](https://www.typescriptlang.org/) | ^5.8 | Tipado estático |
| [Vite](https://vitejs.dev/) | ^6.3 | Build tool / Dev server |
| [Tailwind CSS](https://tailwindcss.com/) | ^3.4 | Estilos utilitarios |
| [React Router](https://reactrouter.com/) | ^7.5 | Enrutamiento SPA |
| [Zustand](https://zustand-demo.pmnd.rs/) | ^5.0 | Manejo de estado |
| [Monaco Editor](https://microsoft.github.io/monaco-editor/) | via `@monaco-editor/react` | Editor de código |
| [Lucide React](https://lucide.dev/) | ^0.483 | Iconos SVG |
| [Axios](https://axios-http.com/) | ^1.8 | Cliente HTTP |
| [React Hot Toast](https://react-hot-toast.com/) | ^2.5 | Notificaciones toast |

### Backend
| Tecnología | Versión | Propósito |
|---|---|---|
| [Node.js](https://nodejs.org/) | ^20 | Runtime |
| [Express](https://expressjs.com/) | ^4.21 | Framework HTTP |
| [TypeScript](https://www.typescriptlang.org/) | ^5.8 | Tipado estático |
| [Prisma](https://www.prisma.io/) | ^6.5 | ORM / Migraciones |
| [SQLite](https://www.sqlite.org/) | — | Base de datos embebida |
| [JWT](https://jwt.io/) (jsonwebtoken) | ^9.0 | Autenticación stateless |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | ^2.4 | Hash de contraseñas |
| [Zod](https://zod.dev/) | ^3.24 | Validación de esquemas |

### Infraestructura
| Tecnología | Propósito |
|---|---|
| [Docker](https://www.docker.com/) | Contenedorización |
| [Docker Compose](https://docs.docker.com/compose/) | Orquestación multi-servicio |
| [Nginx](https://nginx.org/) | Servidor web (producción) |

## 📁 Estructura del Proyecto

```
scriptflow/
├── packages/
│   ├── frontend/                    # React SPA
│   │   ├── src/
│   │   │   ├── pages/              # Páginas de la aplicación
│   │   │   │   ├── Dashboard.tsx   # Panel de control
│   │   │   │   ├── Scripts.tsx     # Lista de scripts
│   │   │   │   ├── ScriptEditor.tsx# Editor de código
│   │   │   │   ├── Folders.tsx     # Gestión de carpetas
│   │   │   │   ├── Login.tsx       # Inicio de sesión
│   │   │   │   └── Register.tsx    # Registro de usuarios
│   │   │   ├── components/         # Componentes reutilizables
│   │   │   │   ├── Layout.tsx      # Layout principal
│   │   │   │   ├── Sidebar.tsx     # Barra lateral
│   │   │   │   ├── Header.tsx      # Encabezado
│   │   │   │   ├── TerminalModal.tsx # Modal de terminal
│   │   │   │   └── ProtectedRoute.tsx # Ruta protegida
│   │   │   ├── api/                # Clientes HTTP
│   │   │   ├── store/              # Estados globales (Zustand)
│   │   │   ├── types/              # Tipos TypeScript
│   │   │   ├── App.tsx             # Componente raíz
│   │   │   └── main.tsx            # Entry point
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js
│   │   └── Dockerfile
│   │
│   └── backend/                    # Express API
│       ├── src/
│       │   ├── routes/             # Rutas HTTP
│       │   │   ├── auth.ts         # Autenticación
│       │   │   ├── scripts.ts      # CRUD scripts + ejecución
│       │   │   ├── folders.ts      # CRUD carpetas
│       │   │   └── dashboard.ts    # Dashboard stats
│       │   ├── services/           # Lógica de negocio
│       │   ├── middleware/         # Middleware (auth, validación)
│       │   ├── types/              # Tipos TypeScript
│       │   ├── config.ts           # Configuración
│       │   ├── index.ts            # Entry point
│       │   └── seed.ts             # Datos de prueba
│       ├── prisma/
│       │   ├── schema.prisma       # Esquema de base de datos
│       │   └── migrations/         # Migraciones de la base de datos
│       └── Dockerfile
│
├── docker-compose.yml              # Orquestación Docker
├── .env.example                    # Variables de entorno de ejemplo
├── LICENSE                         # Licencia MIT
├── package.json                    # Monorepo (npm workspaces)
└── README.md
```

## 🚀 Requisitos Previos

- **Node.js** v20+
- **npm** v9+
- **Docker** y **Docker Compose** (opcional, para ejecución con contenedores)

## 🔧 Instalación y Ejecución

### Opción 1: Docker (recomendado para producción)

```bash
# Clonar el repositorio
git clone https://github.com/nolbertog/scriptflow.git
cd scriptflow

# Construir e iniciar los servicios
docker compose up --build
```

- **Frontend:** http://localhost:80
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/api/health

### Opción 2: Desarrollo Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/nolbertog/scriptflow.git
cd scriptflow

# 2. Instalar dependencias
npm install

# 3. Generar el cliente de Prisma
npx -w packages/backend prisma generate

# 4. Ejecutar migraciones (crea la base de datos SQLite)
npm run db:migrate

# 5. (Opcional) Poblar la base de datos con datos de prueba
npm run db:seed

# 6. Iniciar backend (terminal 1)
npm run backend:dev
# → http://localhost:3001

# 7. Iniciar frontend (terminal 2)
npm run frontend:dev
# → http://localhost:5173

# O todo junto:
npm run dev
```

### Scripts Disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia frontend y backend en desarrollo |
| `npm run backend:dev` | Inicia solo el backend con hot-reload |
| `npm run frontend:dev` | Inicia solo el frontend con Vite |
| `npm run build` | Compila ambos paquetes |
| `npm run db:migrate` | Ejecuta migraciones de Prisma |
| `npm run db:seed` | Pobla la base de datos con datos de prueba |

## ⚙️ Variables de Entorno

Todas las variables tienen valores por defecto para desarrollo local:

| Variable | Default | Descripción |
|---|---|---|
| `PORT` | `3001` | Puerto del servidor backend |
| `JWT_SECRET` | `scriptflow-dev-secret-change-in-production` | Secreto para firmar tokens JWT |
| `JWT_EXPIRES_IN` | `7d` | Tiempo de expiración del token |
| `CORS_ORIGIN` | `http://localhost:5173` | Origen permitido para CORS |

Para producción, crea un archivo `.env` en la raíz del proyecto:

```env
JWT_SECRET=tu-secreto-seguro-aqui
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://tudominio.com
```

## 📡 API Endpoints

### Autenticación
| Método | Ruta | Descripción | Autenticación |
|---|---|---|---|
| `POST` | `/api/auth/register` | Registro de nuevo usuario | ❌ |
| `POST` | `/api/auth/login` | Inicio de sesión | ❌ |
| `GET` | `/api/auth/profile` | Obtener perfil del usuario | ✅ |

### Scripts
| Método | Ruta | Descripción | Autenticación |
|---|---|---|---|
| `GET` | `/api/scripts` | Listar scripts (filtro: `?folderId=&search=`) | ✅ |
| `GET` | `/api/scripts/:id` | Obtener script por ID | ✅ |
| `POST` | `/api/scripts` | Crear nuevo script | ✅ |
| `PATCH` | `/api/scripts/:id` | Actualizar script | ✅ |
| `DELETE` | `/api/scripts/:id` | Eliminar script | ✅ |
| `POST` | `/api/scripts/:id/execute` | Ejecutar script | ✅ |
| `GET` | `/api/scripts/:id/executions` | Obtener ejecuciones del script | ✅ |

### Carpetas
| Método | Ruta | Descripción | Autenticación |
|---|---|---|---|
| `GET` | `/api/folders` | Listar carpetas | ✅ |
| `GET` | `/api/folders/tree` | Obtener árbol de carpetas | ✅ |
| `GET` | `/api/folders/:id` | Obtener carpeta por ID | ✅ |
| `POST` | `/api/folders` | Crear nueva carpeta | ✅ |
| `PATCH` | `/api/folders/:id` | Actualizar carpeta | ✅ |
| `DELETE` | `/api/folders/:id` | Eliminar carpeta | ✅ |

### Dashboard
| Método | Ruta | Descripción | Autenticación |
|---|---|---|---|
| `GET` | `/api/dashboard` | Estadísticas del dashboard | ✅ |

### Salud
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/health` | Health check del servidor |

## 🗄️ Modelo de Datos

La base de datos SQLite incluye las siguientes entidades:

- **User** — Usuarios con roles (admin, developer, viewer, operator)
- **Session** — Sesiones de autenticación
- **Folder** — Carpetas organizativas (jerárquicas)
- **Script** — Scripts con contenido, lenguaje, tags, bloqueo/protección
- **ScriptVersion** — Historial de versiones de scripts
- **Execution** — Registro de ejecuciones (output, errores, duración)
- **CronJob** — Tareas programadas
- **Secret** — Almacenamiento seguro de credenciales
- **AuditLog** — Registro de auditoría
- **Notification** — Notificaciones del sistema

## 🔒 Seguridad

- Contraseñas hasheadas con **bcrypt** (10 rondas)
- Autenticación stateless con **JWT**
- Validación de datos con **Zod**
- Rutas protegidas con middleware de autenticación
- Control de acceso basado en roles
- Registro de auditoría de todas las acciones

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo [LICENSE](./LICENSE) para más detalles.

---

<div align="center">
  <p>Desarrollado con ❤️ por <strong>@nolbertog</strong></p>
</div>
