// Configuración de la base de datos y servicios
const config = {
  database: {
    host: '35.212.35.192',
    port: 3306,
    database: 'db2gyaonrb8o1x',
    user: 'umupmauydlvie',
    password: '2e2]%m@;1&s>',
    charset: 'utf8mb4',
    connectTimeout: 30000,
    acquireTimeout: 30000,
    timeout: 30000
  },
  server: {
    port: process.env.PORT || 5001
  },
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY || 'your_deepseek_api_key_here',
    baseURL: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat'
  }
};

module.exports = config;
