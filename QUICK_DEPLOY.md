# 🚀 Despliegue Rápido en Vercel

## ⚡ Pasos Rápidos

### 1. Instalar Vercel CLI

```bash
npm install -g vercel
```

### 2. Login en Vercel

```bash
vercel login
```

### 3. Configurar Base de Datos

- **PlanetScale** (Recomendado): https://planetscale.com
- **Neon**: https://neon.tech
- **Railway**: https://railway.app

### 4. Desplegar

```bash
vercel --prod
```

### 5. Configurar Variables de Entorno

En el dashboard de Vercel, agregar:

```
DATABASE_URL=mysql://username:password@hostname:port/database_name
JWT_SECRET=tu-clave-super-secreta-aqui
NEXTAUTH_SECRET=tu-nextauth-secret-aqui
NEXTAUTH_URL=https://tu-app.vercel.app
```

## 🎯 ¡Listo!

Tu aplicación estará disponible en la URL proporcionada por Vercel.

## 📞 Soporte

- Revisa `DEPLOYMENT.md` para instrucciones detalladas
- Verifica los logs en Vercel si hay problemas
- Asegúrate de que la base de datos esté configurada
