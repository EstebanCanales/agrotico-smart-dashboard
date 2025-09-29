#!/bin/bash

echo "🚀 Desplegando AgroTico Smart Dashboard en Vercel..."

# Verificar que Vercel CLI esté instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI no está instalado. Instalando..."
    npm install -g vercel
fi

# Verificar que estemos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ No se encontró package.json. Asegúrate de estar en el directorio del proyecto."
    exit 1
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Verificar que las variables de entorno estén configuradas
if [ ! -f ".env.local" ]; then
    echo "⚠️  No se encontró .env.local. Creando desde env.example..."
    cp env.example .env.local
    echo "📝 Por favor, configura las variables de entorno en .env.local antes de continuar."
    echo "🔧 Variables requeridas:"
    echo "   - DATABASE_URL"
    echo "   - JWT_SECRET"
    echo "   - NEXTAUTH_SECRET"
    echo "   - NEXTAUTH_URL"
    exit 1
fi

# Verificar que el build funcione
echo "🔨 Verificando que el build funcione..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ El build falló. Revisa los errores y vuelve a intentar."
    exit 1
fi

echo "✅ Build exitoso!"

# Desplegar en Vercel
echo "🚀 Desplegando en Vercel..."
vercel --prod

echo "🎉 ¡Despliegue completado!"
echo "🌐 Tu aplicación estará disponible en la URL proporcionada por Vercel."
echo "📊 Recuerda configurar las variables de entorno en el dashboard de Vercel."
