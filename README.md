# 🏥 CuidarSalud - Plataforma de Servicios de Enfermería

Sistema web completo para gestión de servicios de enfermería a domicilio. Incluye landing page pública, sistema de agendamiento, panel de administración y API REST.

![CuidarSalud](https://via.placeholder.com/800x400/0d9488/ffffff?text=CuidarSalud)

## 📋 Características

### Frontend (React + Vite)
- ✅ Landing page moderna y responsive
- ✅ Sistema de autenticación (login/registro)
- ✅ Panel de administración completo
- ✅ Editor de contenido del sitio
- ✅ Gestión de servicios CRUD
- ✅ Diseño con Tailwind CSS
- ✅ State management con Zustand

### Backend (Node.js + Express)
- ✅ API REST completa
- ✅ Autenticación JWT
- ✅ Base de datos PostgreSQL con Prisma ORM
- ✅ Validación de datos
- ✅ Manejo de errores centralizado
- ✅ Roles de usuario (Admin, Staff, User)

## 🚀 Instalación

### Requisitos Previos
- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/cuidarsalud.git
cd cuidarsalud
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de base de datos

# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Poblar base de datos con datos de ejemplo
npm run prisma:seed

# Iniciar servidor de desarrollo
npm run dev
```

### 3. Configurar Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

## 📁 Estructura del Proyecto

```
cuidarsalud/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Esquema de base de datos
│   │   └── seed.js            # Datos iniciales
│   └── src/
│       ├── config/            # Configuraciones
│       ├── controllers/       # Controladores
│       ├── middleware/        # Middlewares
│       ├── routes/            # Rutas de API
│       └── index.js           # Punto de entrada
│
└── frontend/
    └── src/
        ├── components/
        │   ├── common/        # Componentes reutilizables
        │   ├── layout/        # Layouts (Navbar, Footer, etc)
        │   ├── landing/       # Componentes de landing
        │   └── admin/         # Componentes de admin
        ├── pages/
        │   ├── public/        # Páginas públicas
        │   ├── auth/          # Login, Registro
        │   └── admin/         # Panel de administración
        ├── services/          # Servicios de API
        ├── context/           # Estado global (Zustand)
        ├── hooks/             # Custom hooks
        ├── utils/             # Utilidades
        └── styles/            # Estilos globales
```

## 🔐 Credenciales por Defecto

Después de ejecutar el seed, puedes acceder con:

```
Email: admin@cuidarsalud.com
Password: admin123
```

## 📡 Endpoints de API

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/login` | Inicio de sesión |
| GET | `/api/auth/me` | Obtener perfil actual |
| PUT | `/api/auth/me` | Actualizar perfil |
| PUT | `/api/auth/change-password` | Cambiar contraseña |

### Servicios
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/services` | Listar servicios |
| GET | `/api/services/:id` | Obtener servicio |
| POST | `/api/services` | Crear servicio (Admin) |
| PUT | `/api/services/:id` | Actualizar servicio (Admin) |
| DELETE | `/api/services/:id` | Eliminar servicio (Admin) |

### Citas
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/appointments` | Listar citas (Admin) |
| GET | `/api/appointments/my` | Mis citas |
| GET | `/api/appointments/slots` | Horarios disponibles |
| POST | `/api/appointments` | Crear cita |
| PUT | `/api/appointments/:id/status` | Actualizar estado (Admin) |
| PUT | `/api/appointments/:id/cancel` | Cancelar cita |

### Contenido
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/content` | Obtener contenido del sitio |
| PUT | `/api/content/:key` | Actualizar contenido (Admin) |
| GET | `/api/settings` | Obtener configuraciones |
| PUT | `/api/settings/:key` | Actualizar configuración (Admin) |

## 🔧 Integración con API de Agenda Externa

El sistema está preparado para integrarse con APIs de agenda externas. En `frontend/src/services/api.js` encontrarás el servicio `appointmentsAPI` que incluye:

```javascript
// Obtener horarios disponibles
appointmentsAPI.getSlots({ date: '2024-01-15', serviceId: 'xxx' })

// Crear una cita
appointmentsAPI.create({
  serviceId: 'xxx',
  date: '2024-01-15',
  time: '10:00',
  address: 'Dirección...',
  notes: 'Notas adicionales'
})
```

Para conectar con una API externa, modifica el archivo `backend/src/controllers/appointmentController.js`.

## 🛠️ Tecnologías

### Frontend
- React 18
- Vite
- React Router 6
- Tailwind CSS
- Zustand (State Management)
- Axios
- Lucide Icons
- React Hot Toast

### Backend
- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT (jsonwebtoken)
- bcryptjs
- express-validator

## 📱 Responsive Design

El diseño es completamente responsive y optimizado para:
- 📱 Móviles (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1280px+)

## 🚀 Despliegue

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Despliega la carpeta dist/
```

### Backend (Railway/Render/Heroku)
```bash
cd backend
# Configura las variables de entorno en tu plataforma
# DATABASE_URL, JWT_SECRET, etc.
npm start
```

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

## 👥 Contribuir

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

Desarrollado con ❤️ para CuidarSalud
