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
  <p><strong>Plataforma profesional de gestión de scripts y automatización</strong></p>
  <p>Editor de código • Organización por carpetas • Ejecución • Cron Jobs • Notificaciones • Control de acceso</p>
</div>

<p align="center">
  <b>Español</b> · <a href="#english">English</a>
</p>

---

## ✨ Características

### 📝 Editor de Código Profesional
- Editor **Monaco** (VS Code) con resaltado de sintaxis para **Bash**, **Python**, **JavaScript**, **PowerShell**, **PHP** y **Go**
- Autocompletado, IntelliSense, múltiples themes, minimapa
- Atajos de teclado (Ctrl+S para guardar)
- Historial de versiones automático con capacidad de restauración
- Scripts favoritos, bloqueo y protección contra ediciones no deseadas

### 📂 Organización por Carpetas
- Estructura jerárquica con árbol visual
- Colores e íconos personalizables por carpeta
- Arrastrar y soltar para reordenar

### ▶️ Ejecución de Scripts
- Ejecuta scripts directamente desde la web con sandbox seguro en `/tmp`
- Resultados en tiempo real con modal de terminal
- 6 lenguajes soportados: Bash, Python, JavaScript, PowerShell, PHP, Go
- Timeout automático de 30s para evitar bucles infinitos

### 📋 Historial de Ejecuciones
- Página dedicada con listado completo de todas las ejecuciones
- Filtros por estado (completado, fallido, ejecutando)
- Búsqueda por nombre de script
- Paginación integrada
- Modal de terminal para ver output y errores de cualquier ejecución pasada

### ⏰ Cron Jobs
- Creador visual con **10 presets rápidos** (cada minuto, cada 5 min, cada hora, diario, etc.)
- Expresión cron en tiempo real con validación
- Selector de zona horaria (timezone)
- Configuración de reintentos automáticos ante fallos
- Activar/desactivar jobs con un toggle
- Ejecuta scripts automáticamente según la programación

### 🔔 Sistema de Notificaciones
- **Campana en el header** con badge de notificaciones no leídas
- **Dropdown rápido** desde cualquier página con marcar como leída y eliminar
- **Página de historial** completo con filtros (todas / no leídas)
- Polling automático cada 30s
- Notificaciones automáticas al ejecutar scripts (éxito/error) y al crear cron jobs

### 📧 Notificaciones por Email (SMTP)
- Configuración SMTP desde la página de **Configuración**
- Soporte para **STARTTLS** (puerto 587) y **SSL/TLS** (puerto 465)
- Botón de **prueba** para verificar la conexión
- **Alertas automáticas** cuando un script falla — define los emails destinatarios en cada script
- Plantillas HTML con diseño oscuro profesional

### 👥 Gestión de Usuarios
- Panel de administración con listado de todos los usuarios
- Cambio de roles con modal informativo (admin, developer, viewer, operator)
- Activar/desactivar usuarios
- Eliminar usuarios (con protección para evitar auto-eliminación)
- Guardia de seguridad: solo administradores pueden acceder

### ⚙️ Configuración de Perfil
- Edición de username y email
- Cambio de contraseña con confirmación
- Visualización de rol y fecha de registro
- Configuración SMTP integrada

### 🔒 Control de Acceso
- Roles: **admin**, **developer**, **viewer**, **operator**
- Rutas protegidas con middleware de autenticación
- Guardias de rol en páginas administrativas

### 📊 Dashboard
- Panel de control con estadísticas y actividad reciente
- Total de scripts, ejecuciones, carpetas, usuarios
- Últimas ejecuciones con estado en tiempo real

### 🗄️ Auditoría Completa
- Registro de todas las acciones: creación, edición, eliminación, ejecución
- Trazabilidad por usuario y entidad afectada

### ⭐ Extras
- Scripts favoritos para acceso rápido
- Sistema de tags para organizar scripts
- Bloqueo y protección de scripts
- Docker Compose para despliegue rápido

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
| [Nodemailer](https://nodemailer.com/) | ^6.10 | Envío de emails |

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
│   ├── frontend/                         # React SPA
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── Dashboard.tsx         # Panel de control
│   │   │   │   ├── Scripts.tsx           # Lista de scripts
│   │   │   │   ├── ScriptEditor.tsx      # Editor de código Monaco
│   │   │   │   ├── Folders.tsx           # Gestión de carpetas
│   │   │   │   ├── Executions.tsx        # Historial de ejecuciones
│   │   │   │   ├── CronJobs.tsx          # Cron jobs con creador visual
│   │   │   │   ├── Users.tsx             # Administración de usuarios (admin)
│   │   │   │   ├── Settings.tsx          # Configuración de perfil + SMTP
│   │   │   │   ├── Notifications.tsx     # Historial de notificaciones
│   │   │   │   ├── Login.tsx             # Inicio de sesión
│   │   │   │   └── Register.tsx          # Registro de usuarios
│   │   │   ├── components/
│   │   │   │   ├── Layout.tsx            # Layout principal
│   │   │   │   ├── Sidebar.tsx           # Barra lateral con navegación
│   │   │   │   ├── Header.tsx            # Encabezado con campana de notificaciones
│   │   │   │   ├── TerminalModal.tsx     # Modal de terminal para outputs
│   │   │   │   └── ProtectedRoute.tsx    # Ruta protegida por autenticación
│   │   │   ├── api/                      # Clientes HTTP por módulo
│   │   │   │   ├── client.ts             # Cliente Axios base
│   │   │   │   ├── auth.ts               # Autenticación
│   │   │   │   ├── scripts.ts            # Scripts
│   │   │   │   ├── folders.ts            # Carpetas
│   │   │   │   ├── executions.ts         # Ejecuciones
│   │   │   │   ├── cron.ts               # Cron jobs
│   │   │   │   ├── users.ts              # Usuarios
│   │   │   │   ├── notifications.ts      # Notificaciones
│   │   │   │   └── smtp.ts               # Configuración SMTP
│   │   │   ├── store/                    # Estados globales (Zustand)
│   │   │   │   ├── authStore.ts          # Estado de autenticación
│   │   │   │   └── uiStore.ts            # Estado de UI
│   │   │   ├── types/                    # Tipos TypeScript compartidos
│   │   │   ├── App.tsx                   # Componente raíz con routing
│   │   │   ├── main.tsx                  # Entry point
│   │   │   └── index.css                 # Estilos globales
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js
│   │   └── Dockerfile
│   │
│   └── backend/                          # Express API
│       ├── src/
│       │   ├── routes/                   # Rutas HTTP
│       │   │   ├── auth.ts               # Autenticación + perfil
│       │   │   ├── scripts.ts            # CRUD scripts + ejecución
│       │   │   ├── folders.ts            # CRUD carpetas
│       │   │   ├── dashboard.ts          # Dashboard stats
│       │   │   ├── cron.ts               # CRUD cron jobs
│       │   │   ├── users.ts              # Admin de usuarios
│       │   │   ├── executions.ts         # Listado global de ejecuciones
│       │   │   ├── notifications.ts      # Notificaciones del sistema
│       │   │   └── smtp.ts               # Configuración SMTP
│       │   ├── services/                 # Lógica de negocio
│       │   │   ├── prisma.ts             # Cliente Prisma
│       │   │   ├── auth.service.ts       # Lógica de autenticación
│       │   │   ├── scripts.service.ts    # CRUD + ejecución de scripts
│       │   │   ├── folders.service.ts    # Lógica de carpetas
│       │   │   ├── cron.service.ts       # Lógica de cron jobs
│       │   │   ├── notifications.service.ts # Sistema de notificaciones
│       │   │   └── email.service.ts      # Envío de emails (nodemailer)
│       │   ├── middleware/
│       │   │   ├── auth.ts               # JWT + verificación de roles
│       │   │   └── validation.ts         # Validación Zod
│       │   ├── types/                    # Tipos TypeScript
│       │   ├── config.ts                 # Configuración (variables de entorno)
│       │   ├── index.ts                  # Entry point del servidor
│       │   └── seed.ts                   # Datos de prueba
│       ├── prisma/
│       │   ├── schema.prisma             # Esquema de base de datos
│       │   └── migrations/               # Migraciones
│       └── Dockerfile
│
├── docker-compose.yml                    # Orquestación Docker con health checks
├── .env.example                          # Variables de entorno de ejemplo
├── LICENSE                               # Licencia MIT
├── package.json                          # Monorepo (npm workspaces)
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

# Configurar variables de entorno
cp .env.example .env

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
| Método | Ruta | Descripción | Auth | Roles |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Registro de nuevo usuario | ❌ | — |
| `POST` | `/api/auth/login` | Inicio de sesión | ❌ | — |
| `GET` | `/api/auth/profile` | Obtener perfil del usuario | ✅ | Todos |
| `PATCH` | `/api/auth/profile` | Actualizar perfil (username, email) | ✅ | Todos |
| `POST` | `/api/auth/change-password` | Cambiar contraseña | ✅ | Todos |

### Scripts
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `GET` | `/api/scripts` | Listar scripts (`?folderId=&search=`) | ✅ |
| `GET` | `/api/scripts/:id` | Obtener script con versiones | ✅ |
| `POST` | `/api/scripts` | Crear script | ✅ |
| `PATCH` | `/api/scripts/:id` | Actualizar script | ✅ |
| `DELETE` | `/api/scripts/:id` | Eliminar script | ✅ |
| `POST` | `/api/scripts/:id/execute` | Ejecutar script (sandbox) | ✅ |
| `GET` | `/api/scripts/:id/executions` | Ejecuciones del script | ✅ |

### Carpetas
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `GET` | `/api/folders` | Listar carpetas | ✅ |
| `GET` | `/api/folders/tree` | Árbol jerárquico de carpetas | ✅ |
| `GET` | `/api/folders/:id` | Obtener carpeta | ✅ |
| `POST` | `/api/folders` | Crear carpeta | ✅ |
| `PATCH` | `/api/folders/:id` | Actualizar carpeta | ✅ |
| `DELETE` | `/api/folders/:id` | Eliminar carpeta | ✅ |

### Cron Jobs
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `GET` | `/api/cron` | Listar cron jobs del usuario | ✅ |
| `POST` | `/api/cron` | Crear cron job | ✅ |
| `PATCH` | `/api/cron/:id` | Actualizar cron job | ✅ |
| `DELETE` | `/api/cron/:id` | Eliminar cron job | ✅ |

### Ejecuciones
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `GET` | `/api/executions` | Listar ejecuciones (`?status=&search=&page=&limit=`) | ✅ |

### Notificaciones
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `GET` | `/api/notifications` | Listar notificaciones (`?page=&limit=`) | ✅ |
| `GET` | `/api/notifications/unread-count` | Contador de no leídas | ✅ |
| `PATCH` | `/api/notifications/:id/read` | Marcar como leída | ✅ |
| `POST` | `/api/notifications/mark-all-read` | Marcar todas como leídas | ✅ |
| `DELETE` | `/api/notifications/:id` | Eliminar notificación | ✅ |

### SMTP
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `GET` | `/api/smtp` | Obtener configuración SMTP | ✅ |
| `PUT` | `/api/smtp` | Crear/actualizar configuración SMTP | ✅ |
| `POST` | `/api/smtp/test` | Enviar email de prueba | ✅ |

### Usuarios (solo admin)
| Método | Ruta | Descripción | Auth | Roles |
|---|---|---|---|---|
| `GET` | `/api/users` | Listar usuarios | ✅ | admin |
| `PATCH` | `/api/users/:id` | Actualizar usuario (rol, activo) | ✅ | admin |
| `DELETE` | `/api/users/:id` | Eliminar usuario | ✅ | admin |

### Dashboard
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `GET` | `/api/dashboard` | Estadísticas del dashboard | ✅ |

### Salud
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/health` | Health check del servidor |

## 🗄️ Modelo de Datos

La base de datos SQLite incluye las siguientes entidades:

- **User** — Usuarios con roles (admin, developer, viewer, operator), estado activo/inactivo
- **Session** — Sesiones de autenticación
- **Folder** — Carpetas organizativas con jerarquía padre-hijo, colores personalizables
- **Script** — Scripts con contenido, lenguaje, tags, bloqueo/protección, favoritos, emails de notificación
- **ScriptVersion** — Versionado automático con contenido completo por versión
- **Execution** — Registro de ejecuciones (output, errores, duración, estado)
- **CronJob** — Tareas programadas con expresión cron, timezone, reintentos, activo/inactivo
- **Secret** — Almacenamiento seguro de credenciales y variables de entorno
- **AuditLog** — Registro de auditoría de todas las acciones
- **Notification** — Notificaciones del sistema por tipo (success, error, info, warning)
- **SmtpConfig** — Configuración de servidor SMTP por usuario

## 🔒 Seguridad

- Contraseñas hasheadas con **bcrypt** (10 rondas)
- Autenticación stateless con **JWT**
- Validación de datos con **Zod**
- Rutas protegidas con middleware de autenticación
- Control de acceso basado en roles (admin, developer, viewer, operator)
- Registro de auditoría de todas las acciones
- Protección contra auto-eliminación de usuarios administradores
- Ejecución de scripts en sandbox aislado (`/tmp`)

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo [LICENSE](./LICENSE) para más detalles.

---

<div align="center">
  <p>Desarrollado con ❤️ por <strong>@nolbertog</strong></p>
</div>
