const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const helmet = require("helmet");
const axios = require("axios");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("./config");

const app = express();
const PORT = config.server.port;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Configuración de la conexión a la base de datos
const dbConfig = {
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  charset: config.database.charset,
  connectTimeout: config.database.connectTimeout,
  acquireTimeout: config.database.acquireTimeout,
  timeout: config.database.timeout,
};

// Pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para obtener todas las tablas de la base de datos
async function getAllTables() {
  try {
    const [rows] = await pool.execute(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?",
      [config.database.database]
    );
    return rows.map((row) => row.TABLE_NAME);
  } catch (error) {
    console.error("Error obteniendo tablas:", error);
    throw error;
  }
}

// Función para obtener información de una tabla específica
async function getTableInfo(tableName) {
  try {
    const [columns] = await pool.execute(
      `SELECT 
        COLUMN_NAME, 
        DATA_TYPE, 
        IS_NULLABLE, 
        COLUMN_DEFAULT, 
        COLUMN_KEY,
        EXTRA
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
       ORDER BY ORDINAL_POSITION`,
      [config.database.database, tableName]
    );

    const [data] = await pool.execute(
      `SELECT * FROM \`${tableName}\` LIMIT 100`
    );
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM \`${tableName}\``
    );

    return {
      name: tableName,
      columns: columns,
      data: data,
      totalRecords: countResult[0].total,
    };
  } catch (error) {
    console.error(
      `Error obteniendo información de la tabla ${tableName}:`,
      error
    );
    throw error;
  }
}

// Rutas de la API

// Ruta principal
app.get("/", (req, res) => {
  res.json({
    message: "🌱 Agrotico Smart Dashboard API",
    version: "1.0.0",
    status: "Activo",
    endpoints: {
      tables: "/api/tables",
      tableInfo: "/api/tables/:tableName",
      dashboard: "/api/dashboard",
    },
  });
});

// Obtener todas las tablas
app.get("/api/tables", async (req, res) => {
  try {
    const tables = await getAllTables();
    res.json({
      success: true,
      message: "Tablas obtenidas exitosamente",
      data: tables,
      count: tables.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error obteniendo las tablas",
      error: error.message,
    });
  }
});

// Obtener información específica de una tabla
app.get("/api/tables/:tableName", async (req, res) => {
  try {
    const { tableName } = req.params;
    const tableInfo = await getTableInfo(tableName);

    res.json({
      success: true,
      message: `Información de la tabla ${tableName} obtenida exitosamente`,
      data: tableInfo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error obteniendo información de la tabla ${req.params.tableName}`,
      error: error.message,
    });
  }
});

// Dashboard completo con todas las tablas y sus datos
app.get("/api/dashboard", async (req, res) => {
  try {
    const tables = await getAllTables();
    const dashboardData = [];

    for (const tableName of tables) {
      try {
        const tableInfo = await getTableInfo(tableName);
        dashboardData.push(tableInfo);
      } catch (tableError) {
        console.error(`Error procesando tabla ${tableName}:`, tableError);
        dashboardData.push({
          name: tableName,
          error: tableError.message,
          columns: [],
          data: [],
          totalRecords: 0,
        });
      }
    }

    res.json({
      success: true,
      message: "Dashboard generado exitosamente",
      data: {
        tables: dashboardData,
        summary: {
          totalTables: tables.length,
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generando el dashboard",
      error: error.message,
    });
  }
});

// Analytics endpoints para el dashboard visual

// Obtener métricas generales del sistema
app.get("/api/analytics/overview", async (req, res) => {
  try {
    const [robotsCount] = await pool.execute(
      "SELECT COUNT(*) as total FROM robots"
    );
    const [activeRobots] = await pool.execute(
      'SELECT COUNT(*) as total FROM robots WHERE estado = "activo"'
    );
    const [totalReadings] = await pool.execute(
      "SELECT COUNT(*) as total FROM lecturas"
    );
    const [todayReadings] = await pool.execute(
      "SELECT COUNT(*) as total FROM lecturas WHERE DATE(created_at) = CURDATE()"
    );
    const [lastReading] = await pool.execute(
      "SELECT MAX(created_at) as last_reading FROM lecturas"
    );

    res.json({
      success: true,
      data: {
        totalRobots: robotsCount[0].total,
        activeRobots: activeRobots[0].total,
        totalReadings: totalReadings[0].total,
        todayReadings: todayReadings[0].total,
        lastReading: lastReading[0].last_reading,
        uptime: Math.floor(process.uptime()),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error obteniendo métricas generales",
      error: error.message,
    });
  }
});

// Obtener datos de sensores para gráficos
app.get("/api/analytics/sensors", async (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 24;

    // Datos de temperatura (BMP390)
    const [tempData] = await pool.execute(
      `
      SELECT 
        DATE_FORMAT(timestamp, '%H:%i') as time,
        AVG(temperatura_celsius) as temperature,
        AVG(presion_hpa) as pressure
      FROM sensor_bmp390 
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
      GROUP BY DATE_FORMAT(timestamp, '%Y-%m-%d %H:%i')
      ORDER BY timestamp DESC
      LIMIT 50
    `,
      [hours]
    );

    // Datos de humedad y CO2 (SCD30)
    const [humidityData] = await pool.execute(
      `
      SELECT 
        DATE_FORMAT(timestamp, '%H:%i') as time,
        AVG(humedad_pct) as humidity,
        AVG(co2_ppm) as co2
      FROM sensor_scd30 
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
      GROUP BY DATE_FORMAT(timestamp, '%Y-%m-%d %H:%i')
      ORDER BY timestamp DESC
      LIMIT 50
    `,
      [hours]
    );

    // Datos de luz (LTR390)
    const [lightData] = await pool.execute(
      `
      SELECT 
        DATE_FORMAT(timestamp, '%H:%i') as time,
        AVG(lux) as light,
        AVG(indice_uv) as uv
      FROM sensor_ltr390 
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
      GROUP BY DATE_FORMAT(timestamp, '%Y-%m-%d %H:%i')
      ORDER BY timestamp DESC
      LIMIT 50
    `,
      [hours]
    );

    // Datos de suelo
    const [soilData] = await pool.execute(
      `
      SELECT 
        DATE_FORMAT(timestamp, '%H:%i') as time,
        AVG(humedad_suelo) as soilMoisture,
        AVG(temperatura_suelo_celsius) as soilTemp
      FROM sensor_suelo 
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
      GROUP BY DATE_FORMAT(timestamp, '%Y-%m-%d %H:%i')
      ORDER BY timestamp DESC
      LIMIT 50
    `,
      [hours]
    );

    res.json({
      success: true,
      data: {
        temperature: tempData.reverse(),
        humidity: humidityData.reverse(),
        light: lightData.reverse(),
        soil: soilData.reverse(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error obteniendo datos de sensores",
      error: error.message,
    });
  }
});

// Obtener valores actuales de sensores
app.get("/api/analytics/current", async (req, res) => {
  try {
    // Últimos valores de cada sensor
    const [tempCurrent] = await pool.execute(`
      SELECT temperatura_celsius, presion_hpa, timestamp
      FROM sensor_bmp390 
      ORDER BY timestamp DESC 
      LIMIT 1
    `);

    const [humidityCurrent] = await pool.execute(`
      SELECT humedad_pct, co2_ppm, temperatura_celsius, timestamp
      FROM sensor_scd30 
      ORDER BY timestamp DESC 
      LIMIT 1
    `);

    const [lightCurrent] = await pool.execute(`
      SELECT lux, indice_uv, timestamp
      FROM sensor_ltr390 
      ORDER BY timestamp DESC 
      LIMIT 1
    `);

    const [soilCurrent] = await pool.execute(`
      SELECT humedad_suelo, temperatura_suelo_celsius, timestamp
      FROM sensor_suelo 
      ORDER BY timestamp DESC 
      LIMIT 1
    `);

    res.json({
      success: true,
      data: {
        temperature: tempCurrent[0] || null,
        humidity: humidityCurrent[0] || null,
        light: lightCurrent[0] || null,
        soil: soilCurrent[0] || null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error obteniendo valores actuales",
      error: error.message,
    });
  }
});

// Obtener estadísticas por robot
app.get("/api/analytics/robots", async (req, res) => {
  try {
    const [robotStats] = await pool.execute(`
      SELECT 
        r.nombre,
        r.uuid,
        r.estado,
        COUNT(l.id) as total_readings,
        MAX(l.timestamp) as last_reading,
        TIMESTAMPDIFF(MINUTE, MAX(l.timestamp), NOW()) as minutes_since_last
      FROM robots r
      LEFT JOIN lecturas l ON r.uuid = l.robot_uuid
      GROUP BY r.id, r.nombre, r.uuid, r.estado
      ORDER BY total_readings DESC
    `);

    res.json({
      success: true,
      data: robotStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error obteniendo estadísticas de robots",
      error: error.message,
    });
  }
});

// Generar informe IA con DeepSeek
app.get("/api/ai/forecast", async (req, res) => {
  try {
    // Obtener datos recientes para el análisis
    const [recentData] = await pool.execute(`
      SELECT 
        AVG(sb.temperatura_celsius) as avg_temp,
        AVG(sb.presion_hpa) as avg_pressure,
        AVG(sc.humedad_pct) as avg_humidity,
        AVG(sc.co2_ppm) as avg_co2,
        AVG(sl.lux) as avg_light,
        AVG(sl.indice_uv) as avg_uv,
        AVG(ss.humedad_suelo) as avg_soil_moisture,
        AVG(ss.temperatura_suelo_celsius) as avg_soil_temp,
        DATE(sb.timestamp) as fecha
      FROM sensor_bmp390 sb
      JOIN sensor_scd30 sc ON DATE(sb.timestamp) = DATE(sc.timestamp)
      JOIN sensor_ltr390 sl ON DATE(sb.timestamp) = DATE(sl.timestamp)
      JOIN sensor_suelo ss ON DATE(sb.timestamp) = DATE(ss.timestamp)
      WHERE sb.timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(sb.timestamp)
      ORDER BY fecha DESC
      LIMIT 7
    `);

    if (recentData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No hay suficientes datos para generar el informe",
      });
    }

    // Preparar datos para la IA
    const sensorSummary = {
      temperatura_promedio:
        recentData.reduce(
          (sum, day) => sum + parseFloat(day.avg_temp || 0),
          0
        ) / recentData.length,
      humedad_promedio:
        recentData.reduce(
          (sum, day) => sum + parseFloat(day.avg_humidity || 0),
          0
        ) / recentData.length,
      presion_promedio:
        recentData.reduce(
          (sum, day) => sum + parseFloat(day.avg_pressure || 0),
          0
        ) / recentData.length,
      co2_promedio:
        recentData.reduce((sum, day) => sum + parseFloat(day.avg_co2 || 0), 0) /
        recentData.length,
      luz_promedio:
        recentData.reduce(
          (sum, day) => sum + parseFloat(day.avg_light || 0),
          0
        ) / recentData.length,
      uv_promedio:
        recentData.reduce((sum, day) => sum + parseFloat(day.avg_uv || 0), 0) /
        recentData.length,
      humedad_suelo_promedio:
        recentData.reduce(
          (sum, day) => sum + parseFloat(day.avg_soil_moisture || 0),
          0
        ) / recentData.length,
      temperatura_suelo_promedio:
        recentData.reduce(
          (sum, day) => sum + parseFloat(day.avg_soil_temp || 0),
          0
        ) / recentData.length,
      dias_analizados: recentData.length,
    };

    // Generar informe local como fallback
    const generateLocalReport = (data) => {
      const temp = data.temperatura_promedio;
      const humidity = data.humedad_promedio;
      const co2 = data.co2_promedio;
      const light = data.luz_promedio;
      const soil = data.humedad_suelo_promedio;

      let conditions = "";
      let crops = "";
      let viability = 0;
      let recommendations = "";
      let alerts = "";

      // Análisis de condiciones
      if (temp > 30) {
        conditions = "Ambiente cálido-tropical";
        crops = "Sorgo, maíz, yuca";
        viability = 75;
      } else if (temp > 20) {
        conditions = "Temperatura óptima";
        crops = "Tomate, pimiento, lechuga";
        viability = 85;
      } else {
        conditions = "Temperatura fresca";
        crops = "Espinaca, col, zanahoria";
        viability = 70;
      }

      // Análisis de humedad
      if (humidity < 40) {
        conditions += " con baja humedad";
        recommendations = "Riego frecuente, mulching";
        alerts = "Riesgo de estrés hídrico";
      } else if (humidity > 80) {
        conditions += " con alta humedad";
        recommendations = "Ventilación, drenaje";
        alerts = "Riesgo de hongos";
      } else {
        conditions += " con humedad adecuada";
        recommendations = "Monitoreo regular";
      }

      // Análisis de CO2
      if (co2 < 300) {
        recommendations += ", suplementar CO₂";
        viability -= 10;
      }

      // Análisis de luz
      if (light < 1000) {
        recommendations += ", iluminación suplementaria";
        viability -= 15;
        alerts += ", luz insuficiente";
      }

      return `**ANÁLISIS AGRÍCOLA**

**1. Condiciones:** ${conditions}
**2. Cultivos:** ${crops}
**3. Viabilidad:** ${viability}%
**4. Recomendaciones:** ${recommendations}
**5. Alertas:** ${alerts || "Ninguna"}

*Análisis basado en datos de ${data.dias_analizados} días*`;
    };

    // Generar informe de mockup (sin IA real)
    const mockupReports = [
      `**ANÁLISIS AGRÍCOLA INTELIGENTE**

**1. Condiciones:** Ambiente tropical semiárido con temperatura óptima (${sensorSummary.temperatura_promedio.toFixed(
        1
      )}°C) y humedad relativa moderada (${sensorSummary.humedad_promedio.toFixed(
        1
      )}%). Presión atmosférica estable (${sensorSummary.presion_promedio.toFixed(
        1
      )} hPa) indica estabilidad climática.

**2. Cultivos Recomendados:** 
• Maíz híbrido tolerante al calor
• Sorgo forrajero de ciclo corto
• Yuca resistente a sequía
• Tomate cherry en invernadero

**3. Viabilidad:** 78% - Condiciones favorables para cultivos seleccionados

**4. Recomendaciones Clave:**
• Implementar riego por goteo para optimizar agua
• Aplicar mulching orgánico para conservar humedad
• Monitorear CO₂ y considerar suplementación
• Rotación de cultivos cada 3 meses

**5. Alertas Importantes:**
• Vigilar humedad del suelo (actual: ${sensorSummary.humedad_suelo_promedio.toFixed(
        0
      )} raw)
• Temperatura del suelo elevada (${sensorSummary.temperatura_suelo_promedio.toFixed(
        1
      )}°C)
• Luminosidad subóptima (${sensorSummary.luz_promedio.toFixed(1)} lux)

*Análisis generado por IA Agrícola v2.0 - ${
        sensorSummary.dias_analizados
      } días de datos*`,

      `**PRONÓSTICO AGRONÓMICO AVANZADO**

**1. Condiciones:** Clima cálido-húmedo ideal para agricultura tropical. Temperatura ${sensorSummary.temperatura_promedio.toFixed(
        1
      )}°C dentro del rango óptimo, humedad ${sensorSummary.humedad_promedio.toFixed(
        1
      )}% adecuada para fotosíntesis.

**2. Cultivos Óptimos:**
• Arroz de secano (variedad resistente)
• Frijol de mata baja
• Calabaza de invierno
• Hierbas aromáticas (albahaca, orégano)

**3. Viabilidad:** 82% - Excelente potencial productivo

**4. Estrategias Recomendadas:**
• Siembra escalonada cada 15 días
• Fertilización orgánica con compost
• Control biológico de plagas
• Cosecha temprana para evitar lluvias

**5. Alertas del Sistema:**
• CO₂ bajo (${sensorSummary.co2_promedio.toFixed(
        1
      )} ppm) - considerar invernadero
• Luz insuficiente - evaluar sombreado
• Suelo cálido - mantener cobertura vegetal

*Sistema de monitoreo IoT activo - ${new Date().toLocaleDateString("es-ES")}*`,

      `**INFORME TÉCNICO AGRÍCOLA**

**1. Condiciones:** Microclima estable con ${sensorSummary.temperatura_promedio.toFixed(
        1
      )}°C promedio, humedad relativa ${sensorSummary.humedad_promedio.toFixed(
        1
      )}% y presión ${sensorSummary.presion_promedio.toFixed(
        1
      )} hPa. Condiciones ideales para agricultura de precisión.

**2. Cultivos Sugeridos:**
• Lechuga hidropónica
• Pimiento morrón
• Pepino de invernadero
• Albahaca y perejil

**3. Viabilidad:** 85% - Condiciones excepcionales

**4. Plan de Acción:**
• Instalar sistema de riego automatizado
• Configurar sensores de humedad del suelo
• Programar fertilización líquida
• Establecer calendario de siembra

**5. Monitoreo Continuo:**
• Temperatura del suelo: ${sensorSummary.temperatura_suelo_promedio.toFixed(
        1
      )}°C
• Humedad del suelo: ${sensorSummary.humedad_suelo_promedio.toFixed(0)} unidades
• Índice UV: ${sensorSummary.uv_promedio.toFixed(2)} (bajo)

*Análisis basado en ${sensorSummary.dias_analizados} días de datos históricos*`,
    ];

    // Seleccionar un informe aleatorio
    const randomIndex = Math.floor(Math.random() * mockupReports.length);
    const selectedReport = mockupReports[randomIndex];

    res.json({
      success: true,
      data: {
        report: selectedReport,
        sensorData: sensorSummary,
        generatedAt: new Date().toISOString(),
        model: "mockup-analysis-v1.0",
      },
    });
  } catch (error) {
    console.error("Error generando informe:", error);
    res.status(500).json({
      success: false,
      message: "Error generando informe",
      error: error.message,
    });
  }
});

// Generar nuevo registro de sensores
app.post("/api/registros/generate", async (req, res) => {
  try {
    const { robotUuid } = req.body;
    
    // Si no se proporciona robotUuid, usar el robot por defecto
    const targetRobotUuid = robotUuid || "f7e6de09-0d83-45e2-9d1b-a4dc4aa1c8cc";
    
    const now = new Date();
    const timestamp = new Date(now.getTime() - Math.random() * 1000 * 60 * 60); // Última hora aleatoria
    
    // Generar datos realistas de sensores
    const temperatura = (20 + Math.random() * 15).toFixed(2); // 20-35°C
    const presion = (850 + Math.random() * 100).toFixed(2); // 850-950 hPa
    const humedad = (40 + Math.random() * 40).toFixed(2); // 40-80%
    const co2 = (200 + Math.random() * 200).toFixed(2); // 200-400 ppm
    const lux = (Math.random() * 1000).toFixed(2); // 0-1000 lux
    const indice_uv = (Math.random() * 11).toFixed(2); // 0-11 UV
    const humedad_suelo = Math.floor(200 + Math.random() * 400); // 200-600
    const temperatura_suelo = (15 + Math.random() * 20).toFixed(2); // 15-35°C
    const latitud = (9.0 + Math.random() * 2).toFixed(6); // Costa Rica
    const longitud = (-84.0 + Math.random() * 2).toFixed(6); // Costa Rica
    
    // Insertar en tabla de lecturas y obtener el ID
    const [lecturaResult] = await pool.execute(
      `INSERT INTO lecturas (robot_uuid, timestamp, latitud, longitud) VALUES (?, ?, ?, ?)`,
      [targetRobotUuid, timestamp, latitud, longitud]
    );
    const lecturaId = lecturaResult.insertId;
    
    // Insertar datos de temperatura (BMP390)
    await pool.execute(
      `INSERT INTO sensor_bmp390 (lectura_id, robot_uuid, timestamp, temperatura_celsius, presion_hpa) VALUES (?, ?, ?, ?, ?)`,
      [lecturaId, targetRobotUuid, timestamp, temperatura, presion]
    );
    
    // Insertar datos de humedad y CO2 (SCD30)
    await pool.execute(
      `INSERT INTO sensor_scd30 (lectura_id, robot_uuid, timestamp, humedad_pct, co2_ppm, temperatura_celsius) VALUES (?, ?, ?, ?, ?, ?)`,
      [lecturaId, targetRobotUuid, timestamp, humedad, co2, temperatura]
    );
    
    // Insertar datos de luz (LTR390)
    await pool.execute(
      `INSERT INTO sensor_ltr390 (lectura_id, robot_uuid, timestamp, lux, indice_uv) VALUES (?, ?, ?, ?, ?)`,
      [lecturaId, targetRobotUuid, timestamp, lux, indice_uv]
    );
    
    // Insertar datos de suelo
    await pool.execute(
      `INSERT INTO sensor_suelo (lectura_id, robot_uuid, timestamp, humedad_suelo, temperatura_suelo_celsius) VALUES (?, ?, ?, ?, ?)`,
      [lecturaId, targetRobotUuid, timestamp, humedad_suelo, temperatura_suelo]
    );
    
    res.json({
      success: true,
      message: "Nuevo registro de sensores generado exitosamente",
      data: {
        robotUuid: targetRobotUuid,
        timestamp: timestamp,
        sensores: {
          temperatura: `${temperatura}°C`,
          presion: `${presion} hPa`,
          humedad: `${humedad}%`,
          co2: `${co2} ppm`,
          lux: `${lux} lux`,
          indice_uv: indice_uv,
          humedad_suelo: humedad_suelo,
          temperatura_suelo: `${temperatura_suelo}°C`,
          ubicacion: `${latitud}, ${longitud}`
        }
      }
    });
  } catch (error) {
    console.error("Error generando registro:", error);
    res.status(500).json({
      success: false,
      message: "Error generando nuevo registro",
      error: error.message,
    });
  }
});

// Endpoints de autenticación
app.post("/api/auth/register", async (req, res) => {
  try {
    const { nombre, email, password, telefono, ubicacion } = req.body;

    // Validar datos requeridos
    if (!nombre || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Nombre, email y contraseña son requeridos",
      });
    }

    // Verificar si el usuario ya existe
    const [existingUser] = await pool.execute(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: "El usuario ya existe",
      });
    }

    // Hashear la contraseña
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insertar nuevo usuario
    const [result] = await pool.execute(
      `INSERT INTO usuarios (nombre, email, password_hash, telefono, ubicacion, tipo, estado) 
       VALUES (?, ?, ?, ?, ?, 'usuario', 'activo')`,
      [nombre, email, passwordHash, telefono || null, ubicacion || null]
    );

    res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      data: {
        id: result.insertId,
        nombre,
        email,
        tipo: "usuario",
        estado: "activo",
      },
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar datos requeridos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email y contraseña son requeridos",
      });
    }

    // Buscar usuario en la base de datos
    const [users] = await pool.execute(
      "SELECT id, nombre, email, password_hash, tipo, estado FROM usuarios WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    const user = users[0];

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    // Verificar que el usuario esté activo
    if (user.estado !== "activo") {
      return res.status(401).json({
        success: false,
        message: "Usuario inactivo",
      });
    }

    // Actualizar última actividad
    await pool.execute(
      "UPDATE usuarios SET ultima_actividad = NOW() WHERE id = ?",
      [user.id]
    );

    // Generar JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        tipo: user.tipo 
      },
      "agrotico-secret-key", // En producción usar variable de entorno
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      message: "Login exitoso",
      data: {
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          tipo: user.tipo,
          estado: user.estado,
        },
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
});

app.get("/api/auth/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token de acceso requerido",
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, "agrotico-secret-key");
    
    // Buscar usuario
    const [users] = await pool.execute(
      "SELECT id, nombre, email, tipo, estado, ultima_actividad FROM usuarios WHERE id = ?",
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    res.json({
      success: true,
      data: users[0],
    });
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    res.status(401).json({
      success: false,
      message: "Token inválido",
      error: error.message,
    });
  }
});

// Verificar conexión a la base de datos
app.get("/api/health", async (req, res) => {
  try {
    await pool.execute("SELECT 1");
    res.json({
      success: true,
      message: "Conexión a la base de datos exitosa",
      database: config.database.database,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error conectando a la base de datos",
      error: error.message,
    });
  }
});

// Manejo de errores 404
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint no encontrado",
    availableEndpoints: [
      "GET /",
      "GET /api/health",
      "GET /api/dashboard",
      "GET /api/tables",
      "GET /api/tables/:tableName",
      "POST /api/auth/login",
      "POST /api/auth/register",
      "GET /api/auth/profile",
      "GET /api/analytics/overview",
      "GET /api/analytics/sensors",
      "GET /api/analytics/current",
      "GET /api/analytics/robots",
      "GET /api/ai/forecast",
      "POST /api/registros/generate",
    ],
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
  console.log(`🌱 Agrotico Smart Dashboard API v1.0.0`);
  console.log(
    `📊 Dashboard disponible en: http://localhost:${PORT}/api/dashboard`
  );
  console.log(`🌐 Frontend disponible en: http://localhost:3000`);
});

// Manejo de cierre graceful
process.on("SIGINT", async () => {
  console.log("\n🛑 Cerrando servidor...");
  await pool.end();
  process.exit(0);
});
