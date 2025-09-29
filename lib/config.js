// Configuración de la aplicación
const config = {
  // Base de datos
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrotico_db',
    url: process.env.DATABASE_URL
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'agrotico-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  
  // NextAuth
  nextauth: {
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    secret: process.env.NEXTAUTH_SECRET || 'nextauth-secret'
  },
  
  // AI
  ai: {
    deepseekApiKey: process.env.DEEPSEEK_API_KEY || null
  },
  
  // Vercel
  vercel: {
    url: process.env.VERCEL_URL || 'http://localhost:3000'
  },
  
  // Aplicación
  app: {
    name: 'AgroTico Smart Dashboard',
    version: '1.0.0',
    description: 'Sistema de Monitoreo Agrícola Inteligente',
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development'
  }
};

// Validar configuración requerida
function validateConfig() {
  const required = [
    'JWT_SECRET',
    'NEXTAUTH_SECRET'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn('⚠️  Variables de entorno faltantes:', missing.join(', '));
    console.warn('📝 Configura estas variables en Vercel para producción');
  }
  
  return missing.length === 0;
}

// Función para obtener la URL base
function getBaseUrl() {
  if (process.env.NODE_ENV === 'production') {
    return process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXTAUTH_URL;
  }
  return 'http://localhost:3000';
}

module.exports = {
  config,
  validateConfig,
  getBaseUrl
};
