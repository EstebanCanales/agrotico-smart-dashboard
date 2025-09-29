#!/bin/bash

echo "🌱 Iniciando Agrotico Smart Dashboard..."
echo "=================================="

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor, instala Node.js primero."
    exit 1
fi

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado. Por favor, instala npm primero."
    exit 1
fi

echo "✅ Node.js y npm detectados"

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias del backend..."
    npm install
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Instalando dependencias del frontend..."
    cd client
    npm install
    cd ..
fi

echo "🚀 Iniciando servidores..."
echo "Backend: http://localhost:5001"
echo "Frontend: http://localhost:3000"
echo "Dashboard: http://localhost:3000"
echo ""
echo "Presiona Ctrl+C para detener los servidores"
echo "=================================="

# Ejecutar ambos servidores
npm run dev:full
