# 🌱 Agrotico Smart Dashboard - Next.js con JWT

## ✨ Nuevas Características Implementadas

### 1. **Migración a Next.js 14**

- ✅ App Router de Next.js 14
- ✅ TypeScript configurado
- ✅ Tailwind CSS para estilos
- ✅ Server-side rendering (SSR)
- ✅ API Routes integradas

### 2. **Sistema de Autenticación JWT**

- ✅ NextAuth.js para autenticación
- ✅ JWT tokens seguros
- ✅ Login y registro de usuarios
- ✅ Middleware de autenticación
- ✅ Protección de rutas

### 3. **Páginas de Autenticación**

- ✅ Página de login moderna
- ✅ Página de registro completa
- ✅ Validación de formularios
- ✅ Manejo de errores
- ✅ Redirección automática

### 4. **Dashboard Protegido**

- ✅ Solo usuarios autenticados
- ✅ Información del usuario en header
- ✅ Botón de logout
- ✅ Interfaz moderna con Tailwind

### 5. **Base de Datos Actualizada**

- ✅ Tabla `usuarios` para autenticación
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Índices optimizados
- ✅ Datos de ejemplo incluidos

## 🚀 Instalación y Configuración

### 1. **Instalar Dependencias**

```bash
# Instalar todas las dependencias
npm install

# O instalar por separado
npm install next@latest react@latest react-dom@latest
npm install next-auth@latest jsonwebtoken@latest bcryptjs@latest
npm install tailwindcss@latest @types/node@latest @types/react@latest
```

### 2. **Configurar Variables de Entorno**

Crear archivo `.env.local` en la raíz del proyecto:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secreto-super-seguro-para-nextauth

# JWT Secret
JWT_SECRET=tu-secreto-jwt-super-seguro

# API Configuration
API_URL=http://localhost:5001

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=agrotico_dashboard
DB_CHARSET=utf8mb4

# Server Configuration
PORT=5001
NODE_ENV=development
```

### 3. **Configurar Base de Datos**

```bash
# Conectar a MySQL/MariaDB
mysql -u root -p

# Ejecutar el esquema SQL actualizado
source database_schema.sql
```

### 4. **Ejecutar la Aplicación**

```bash
# Terminal 1 - Servidor API (puerto 5001)
npm run server

# Terminal 2 - Next.js App (puerto 3000)
npm run dev

# O ejecutar ambos con concurrently
npm run dev:full
```

## 🔐 Sistema de Autenticación

### Usuarios de Prueba

| Email              | Contraseña | Tipo    | Estado    |
| ------------------ | ---------- | ------- | --------- |
| admin@agrotico.com | admin123   | admin   | activo    |
| juan@agrotico.com  | user123    | usuario | activo    |
| maria@agrotico.com | user123    | usuario | pendiente |

### Flujo de Autenticación

1. **Registro**: `/auth/register`

   - Formulario completo con validaciones
   - Contraseña hasheada con bcrypt
   - Redirección automática al login

2. **Login**: `/auth/login`

   - Autenticación con NextAuth
   - JWT token generado
   - Redirección al dashboard

3. **Dashboard**: `/`
   - Protegido por middleware
   - Información del usuario
   - Logout disponible

## 📁 Estructura del Proyecto

```
agrotico-smart-dashboard/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── api/
│   │   │   └── auth/
│   │   │       ├── [...nextauth]/route.ts
│   │   │       └── register/route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── providers.tsx
│   ├── components/
│   │   ├── Dashboard.tsx
│   │   └── LoadingSpinner.tsx
│   └── types/
│       └── index.ts
├── server.js
├── database_schema.sql
├── next.config.js
├── tailwind.config.js
└── package.json
```

## 🎨 Tecnologías Utilizadas

### Frontend

- **Next.js 14** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utilitarios
- **NextAuth.js** - Autenticación
- **Lucide React** - Iconos

### Backend

- **Express.js** - Servidor API
- **JWT** - Tokens de autenticación
- **bcryptjs** - Hash de contraseñas
- **MySQL2** - Base de datos
- **CORS** - Cross-origin requests

### Base de Datos

- **MySQL/MariaDB** - Base de datos principal
- **Índices optimizados** - Rendimiento
- **Relaciones FK** - Integridad de datos

## 🔧 API Endpoints

### Autenticación

- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/profile` - Obtener perfil (requiere JWT)

### Dashboard

- `GET /api/dashboard` - Datos del dashboard
- `GET /api/tables` - Lista de tablas
- `GET /api/registros` - Gestión de registros

## 🛡️ Seguridad Implementada

### 1. **Autenticación JWT**

- Tokens firmados con secreto
- Expiración de 30 días
- Middleware de verificación

### 2. **Contraseñas Seguras**

- Hash con bcrypt (12 rounds)
- Validación de longitud mínima
- No almacenamiento en texto plano

### 3. **Protección de Rutas**

- Middleware de NextAuth
- Redirección automática
- Verificación de sesión

### 4. **CORS Configurado**

- Origen específico permitido
- Credenciales habilitadas
- Headers de seguridad

## 📱 Características del Frontend

### Páginas de Autenticación

- **Diseño moderno** con Tailwind CSS
- **Validación en tiempo real**
- **Manejo de errores** visual
- **Responsive design** completo
- **Iconos intuitivos** con Lucide

### Dashboard

- **Protección de rutas** automática
- **Información del usuario** en header
- **Botón de logout** funcional
- **Métricas principales** en tarjetas
- **Tabla de registros** interactiva

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Solo Next.js
npm run server       # Solo API server
npm run dev:full     # Ambos simultáneamente

# Producción
npm run build        # Build de Next.js
npm run start        # Start de Next.js
npm run server       # Start del API server

# Base de datos
npm run db:setup     # Configurar BD (requiere MySQL)
```

## 🔍 Próximas Mejoras

1. **Perfil de Usuario**: Editar datos personales
2. **Roles y Permisos**: Control de acceso granular
3. **Recuperación de Contraseña**: Email de reset
4. **Verificación de Email**: Confirmación de cuenta
5. **Auditoría**: Log de actividades
6. **2FA**: Autenticación de dos factores

## 🐛 Solución de Problemas

### Error de NextAuth

```bash
# Verificar variables de entorno
echo $NEXTAUTH_SECRET
echo $NEXTAUTH_URL
```

### Error de Base de Datos

```bash
# Verificar conexión MySQL
mysql -u root -p -e "SHOW DATABASES;"

# Verificar tabla usuarios
mysql -u root -p -e "USE agrotico_dashboard; SELECT * FROM usuarios;"
```

### Error de CORS

```javascript
// Verificar configuración en server.js
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
```

## 📞 Soporte

Para reportar problemas o solicitar nuevas características:

1. Crear issue en el repositorio
2. Incluir logs de error
3. Describir pasos para reproducir
4. Especificar versión de Node.js

---

**Desarrollado con ❤️ para Agrotico Smart Dashboard - Next.js Edition**

