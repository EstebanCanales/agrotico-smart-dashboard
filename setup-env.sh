#!/bin/bash
# setup-env.sh - Script para configurar variables de entorno

echo "🔧 Configurando variables de entorno para Agrotico Smart Dashboard..."

# Verificar si .env.local existe
if [ ! -f .env.local ]; then
    echo "📝 Creando .env.local..."
    touch .env.local
fi

# Agregar variables si no existen
if ! grep -q "DEEPSEEK_API_KEY" .env.local; then
    echo "DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here" >> .env.local
    echo "✅ DEEPSEEK_API_KEY agregada"
else
    echo "⚠️  DEEPSEEK_API_KEY ya existe en .env.local"
fi

if ! grep -q "NEXTAUTH_URL" .env.local; then
    echo "NEXTAUTH_URL=http://localhost:3000" >> .env.local
    echo "✅ NEXTAUTH_URL agregada"
else
    echo "⚠️  NEXTAUTH_URL ya existe en .env.local"
fi

if ! grep -q "NEXTAUTH_SECRET" .env.local; then
    echo "NEXTAUTH_SECRET=your-nextauth-secret-here" >> .env.local
    echo "✅ NEXTAUTH_SECRET agregada"
else
    echo "⚠️  NEXTAUTH_SECRET ya existe en .env.local"
fi

echo ""
echo "🎉 Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Obtén tu API key de DeepSeek en: https://platform.deepseek.com/"
echo "2. Reemplaza 'sk-your-deepseek-api-key-here' con tu API key real"
echo "3. Reemplaza 'your-nextauth-secret-here' con un secreto seguro"
echo "4. Ejecuta: npm run dev"
echo ""
echo "🔑 Para obtener tu API key:"
echo "   - Ve a https://platform.deepseek.com/"
echo "   - Crea una cuenta o inicia sesión"
echo "   - Ve a 'API Keys' y crea una nueva"
echo "   - Copia la API key y reemplázala en .env.local"



