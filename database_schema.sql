CREATE DATABASE IF NOT EXISTS agrotico_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE agrotico_dashboard;
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  ubicacion VARCHAR(255),
  tipo ENUM('usuario', 'admin') NOT NULL DEFAULT 'usuario',
  estado ENUM('activo', 'inactivo', 'pendiente') NOT NULL DEFAULT 'pendiente',
  ultima_actividad TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_tipo (tipo),
  INDEX idx_estado (estado),
  INDEX idx_ultima_actividad (ultima_actividad)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Tabla de robots agrícolas
CREATE TABLE IF NOT EXISTS robots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  modelo VARCHAR(50) NOT NULL,
  tipo_robot ENUM(
    'riego',
    'siembra',
    'cosecha',
    'monitoreo',
    'fumigacion'
  ) NOT NULL,
  estado ENUM('activo', 'inactivo', 'mantenimiento', 'error') DEFAULT 'activo',
  ubicacion VARCHAR(100),
  coordenadas_lat DECIMAL(10, 8),
  coordenadas_lng DECIMAL(11, 8),
  bateria INT DEFAULT 100,
  nivel_combustible INT DEFAULT 100,
  temperatura DECIMAL(5, 2),
  humedad DECIMAL(5, 2),
  velocidad DECIMAL(5, 2) DEFAULT 0,
  area_cubierta DECIMAL(10, 2) DEFAULT 0,
  horas_trabajo INT DEFAULT 0,
  ultima_actividad TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  proximo_mantenimiento DATE,
  notas TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tipo_robot (tipo_robot),
  INDEX idx_estado (estado),
  INDEX idx_ubicacion (ubicacion),
  INDEX idx_ultima_actividad (ultima_actividad)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;