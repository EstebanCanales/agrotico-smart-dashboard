# 🚀 Guía de Despliegue en Vercel

## 📋 Pasos para Desplegar AgroTico Smart Dashboard

### 1. Preparación del Proyecto

```bash
# Clonar el repositorio (si no lo tienes)
git clone <tu-repositorio>
cd agrotico-smart-dashboard

# Instalar dependencias
npm install

# Instalar Vercel CLI globalmente
npm install -g vercel
```

### 2. Configurar Base de Datos

#### Opción A: PlanetScale (Recomendado para MySQL)

1. Ve a [PlanetScale](https://planetscale.com)
2. Crea una cuenta gratuita
3. Crea una nueva base de datos
4. Ve a "Connect" y copia la URL de conexión
5. Ejecuta el script `database_schema.sql` en la consola SQL

#### Opción B: Neon (Para PostgreSQL)

1. Ve a [Neon](https://neon.tech)
2. Crea una cuenta gratuita
3. Crea una nueva base de datos PostgreSQL
4. Copia la URL de conexión
5. Adapta el schema para PostgreSQL

#### Opción C: Railway

1. Ve a [Railway](https://railway.app)
2. Crea una cuenta
3. Crea un nuevo proyecto con MySQL
4. Copia la URL de conexión

### 3. Configurar Variables de Entorno

Crea un archivo `.env.local` con las siguientes variables:

```env
# Base de datos
DATABASE_URL=mysql://username:password@hostname:port/database_name

# JWT (genera una clave segura)
JWT_SECRET=tu-clave-super-secreta-aqui

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-nextauth-secret-aqui

# DeepSeek AI (opcional)
DEEPSEEK_API_KEY=tu-deepseek-api-key

# Vercel (se configura automáticamente)
VERCEL_URL=tu-app.vercel.app
```

### 4. Desplegar en Vercel

#### Método 1: Vercel CLI (Recomendado)

```bash
# Login en Vercel
vercel login

# Desplegar
vercel

# Seguir las instrucciones:
# - ¿Cuál es el directorio de tu proyecto? ./
# - ¿Quieres sobrescribir la configuración? No
# - ¿Cuál es el nombre de tu proyecto? agrotico-smart-dashboard
# - ¿En qué directorio está tu código? ./
```

#### Método 2: GitHub + Vercel

1. Sube tu código a GitHub
2. Ve a [Vercel](https://vercel.com)
3. Conecta tu cuenta de GitHub
4. Importa el repositorio
5. Configura las variables de entorno
6. Despliega

### 5. Configurar Variables de Entorno en Vercel

En el dashboard de Vercel:

1. Ve a tu proyecto
2. Ve a "Settings" > "Environment Variables"
3. Agrega las siguientes variables:

```
DATABASE_URL = mysql://username:password@hostname:port/database_name
JWT_SECRET = tu-clave-super-secreta-aqui
NEXTAUTH_SECRET = tu-nextauth-secret-aqui
NEXTAUTH_URL = https://tu-app.vercel.app
DEEPSEEK_API_KEY = tu-deepseek-api-key (opcional)
```

### 6. Verificar el Despliegue

1. Ve a tu URL de Vercel
2. Verifica que el dashboard cargue correctamente
3. Prueba la funcionalidad de login/registro
4. Verifica que los datos se muestren correctamente

### 7. Configuración Adicional

#### Dominio Personalizado (Opcional)

1. Ve a "Settings" > "Domains"
2. Agrega tu dominio personalizado
3. Configura los registros DNS según las instrucciones

#### Monitoreo

1. Ve a "Functions" para ver los logs
2. Configura alertas si es necesario
3. Monitorea el rendimiento

## 🔧 Solución de Problemas

### Error de Base de Datos

```bash
# Verificar conexión
vercel env ls

# Verificar logs
vercel logs
```

### Error de Build

```bash
# Verificar build local
npm run build

# Verificar dependencias
npm install
```

### Error de Variables de Entorno

```bash
# Verificar variables
vercel env ls

# Agregar variable
vercel env add VARIABLE_NAME
```

## 📊 URLs de Producción

- **Frontend**: `https://tu-app.vercel.app`
- **API**: `https://tu-app.vercel.app/api`
- **Dashboard**: `https://tu-app.vercel.app/dashboard`

## 🎉 ¡Listo!

Tu aplicación estará disponible en la URL proporcionada por Vercel.

### Próximos Pasos

1. **Configurar dominio personalizado** (opcional)
2. **Configurar monitoreo** y alertas
3. **Optimizar rendimiento** si es necesario
4. **Configurar backups** de la base de datos

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs en Vercel
2. Verifica las variables de entorno
3. Asegúrate de que la base de datos esté configurada
4. Contacta al equipo de desarrollo
