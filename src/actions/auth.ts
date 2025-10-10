
"use server";

import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";

const SECRET_KEY = "agrotico-secret-key"; // Should be in environment variables

export async function registerUser(userData: any) {
  const { nombre, email, password, telefono, ubicacion } = userData;

  try {
    const [existingUser] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return { success: false, message: "El usuario ya existe" };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, telefono, ubicacion, tipo, estado) VALUES (?, ?, ?, ?, ?, 'usuario', 'activo')`,
      [nombre, email, passwordHash, telefono || null, ubicacion || null]
    );

    return { success: true, message: "Usuario registrado exitosamente" };
  } catch (error) {
    console.error("Error en registro:", error);
    return { success: false, message: "Error interno del servidor" };
  }
}

export async function loginUser(email: string, password: string) {
    try {
        
        const [users] = await pool.query<RowDataPacket[]>(
            "SELECT id, nombre, email, password_hash, tipo, estado FROM usuarios WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return { success: false, message: "Credenciales inválidas" };
        }

        const user = users[0];
        
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return { success: false, message: "Credenciales inválidas" };
        }

        if (user.estado !== "activo") {
            return { success: false, message: "Usuario inactivo" };
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, tipo: user.tipo },
            SECRET_KEY,
            { expiresIn: "24h" }
        );


        return {
            success: true,
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
        };
    } catch (error) {
        console.error("Auth Action: Error en login:", error);
        return { success: false, message: "Error interno del servidor" };
    }
}

export async function getProfile(token: string) {
    try {
        const decoded = jwt.verify(token, SECRET_KEY) as { userId: string };
        const [users] = await pool.query<RowDataPacket[]>(
            "SELECT id, nombre, email, tipo, estado, ultima_actividad FROM usuarios WHERE id = ?",
            [decoded.userId]
        );

        if (users.length === 0) {
            return { success: false, message: "Usuario no encontrado" };
        }

        return { success: true, data: users[0] };
    } catch (error) {
        return { success: false, message: "Token inválido" };
    }
}

export async function logoutUser(token: string) {
    try {
        // Verificar que el token es válido antes de hacer logout
        const decoded = jwt.verify(token, SECRET_KEY) as { userId: string };
        
        // Actualizar última actividad (opcional)
        await pool.query(
            "UPDATE usuarios SET ultima_actividad = NOW() WHERE id = ?",
            [decoded.userId]
        );

        return { success: true, message: "Logout exitoso" };
    } catch (error) {
        // Incluso si el token es inválido, consideramos el logout exitoso
        // ya que el usuario ya no puede acceder
        return { success: true, message: "Logout exitoso" };
    }
}
