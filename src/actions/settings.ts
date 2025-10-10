
"use server";

import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { RowDataPacket } from "mysql2";
import { revalidatePath } from "next/cache";

export async function updateUserProfile(userId: string, name: string, email: string) {
  try {
    await pool.query(
      "UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?",
      [name, email, userId]
    );
    revalidatePath("/settings");
    return { success: true, message: "Perfil actualizado exitosamente." };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { success: false, message: "Error al actualizar el perfil." };
  }
}

export async function changePassword(userId: string, oldPassword: string, newPassword: string) {
  try {
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT password_hash FROM usuarios WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return { success: false, message: "Usuario no encontrado." };
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(oldPassword, user.password_hash);

    if (!isValidPassword) {
      return { success: false, message: "Contraseña actual incorrecta." };
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    await pool.query(
      "UPDATE usuarios SET password_hash = ? WHERE id = ?",
      [newPasswordHash, userId]
    );
    revalidatePath("/settings");
    return { success: true, message: "Contraseña actualizada exitosamente." };
  } catch (error) {
    console.error("Error changing password:", error);
    return { success: false, message: "Error al cambiar la contraseña." };
  }
}

export async function saveAIModelPreferences(userId: string, aiModel: string) {
  try {
    // Assuming 'ai_model' column exists in 'usuarios' table
    await pool.query(
      "UPDATE usuarios SET ai_model = ? WHERE id = ?",
      [aiModel, userId]
    );
    revalidatePath("/settings");
    return { success: true, message: "Preferencias de IA guardadas exitosamente." };
  } catch (error) {
    console.error("Error saving AI model preferences:", error);
    return { success: false, message: "Error al guardar preferencias de IA." };
  }
}
