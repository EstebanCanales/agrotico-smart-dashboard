# AgroTico Smart Dashboard

Sistema de Monitoreo Agrícola Inteligente con Next.js, análisis de IA y sensores IoT.

## 🚀 Despliegue en Vercel

### 1. Preparación del Proyecto

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example .env.local
```

### 2. Variables de Entorno en Vercel

Configura las siguientes variables en el dashboard de Vercel:

```env
# Base de datos (usar PlanetScale, Neon, o similar)
DATABASE_URL=mysql://username:password@hostname:port/database_name

# JWT Secret (genera una clave segura)
JWT_SECRET=your-super-secret-jwt-key-here

# DeepSeek AI (opcional)
DEEPSEEK_API_KEY=your-deepseek-api-key-here

# Next.js
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-here
```

### 3. Base de Datos

Para producción, usa una de estas opciones:

#### Opción A: PlanetScale (Recomendado)

1. Crea una cuenta en [PlanetScale](https://planetscale.com)
2. Crea una nueva base de datos
3. Ejecuta el script `database_schema.sql`
4. Copia la URL de conexión

#### Opción B: Neon

1. Crea una cuenta en [Neon](https://neon.tech)
2. Crea una nueva base de datos PostgreSQL
3. Adapta el schema para PostgreSQL
4. Copia la URL de conexión

### 4. Despliegue

#### Método 1: Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login en Vercel
vercel login

# Desplegar
vercel

# Seguir las instrucciones
```

#### Método 2: GitHub + Vercel

1. Sube el código a GitHub
2. Conecta el repositorio en Vercel
3. Configura las variables de entorno
4. Despliega automáticamente

### 5. Configuración Post-Despliegue

1. **Base de datos**: Asegúrate de que la base de datos esté configurada
2. **Dominio**: Configura tu dominio personalizado si es necesario
3. **SSL**: Vercel maneja SSL automáticamente
4. **Monitoreo**: Configura alertas en Vercel

## 🛠️ Desarrollo Local

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example .env.local

# Ejecutar en desarrollo
npm run dev

# Ejecutar servidor de base de datos (opcional)
npm run server
```

## 📁 Estructura del Proyecto

```
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API Routes
│   │   ├── robot/          # Páginas de robots
│   │   └── ...
│   ├── components/         # Componentes React
│   ├── services/           # Servicios (IA, API)
│   └── types/              # Tipos TypeScript
├── server.js               # Servidor Express (desarrollo)
├── database_schema.sql     # Schema de base de datos
├── vercel.json            # Configuración Vercel
└── next.config.js         # Configuración Next.js
```

## 🔧 Características

- ✅ **Dashboard en tiempo real** con datos de sensores
- ✅ **Análisis de IA** con DeepSeek para recomendaciones agrícolas
- ✅ **Autenticación JWT** segura
- ✅ **Visualizaciones** con Recharts
- ✅ **Responsive design** con Tailwind CSS
- ✅ **API REST** completa
- ✅ **Despliegue en Vercel** optimizado

## 🌐 URLs de Producción

- **Frontend**: `https://your-app.vercel.app`
- **API**: `https://your-app.vercel.app/api`
- **Dashboard**: `https://your-app.vercel.app/dashboard`

## 📞 Soporte

Para problemas o preguntas, contacta al equipo de desarrollo.
