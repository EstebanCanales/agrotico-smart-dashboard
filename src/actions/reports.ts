"use server";

import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export interface Reporte {
  id: number;
  robot_uuid: string;
  fecha: string;
  reporte_md: string;
  timestamp: string;
  created_at: string;
}

export async function saveReport(
  robotUuid: string,
  reporteMd: string,
  fecha?: string
): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    
    const reportDate = fecha || new Date().toISOString().split('T')[0];
    
    const [result] = await pool.execute(
      `INSERT INTO reportes (robot_uuid, fecha, reporte_md) VALUES (?, ?, ?)`,
      [robotUuid, reportDate, reporteMd]
    );

    const insertResult = result as any;
    const reportId = insertResult.insertId;

    
    return {
      success: true,
      id: reportId
    };
  } catch (error) {
    console.error("❌ Error al guardar reporte:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido"
    };
  }
}

export async function getReportsByRobot(
  robotUuid: string,
  limit: number = 10
): Promise<{ success: boolean; reports?: Reporte[]; error?: string }> {
  try {
    
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM reportes 
       WHERE robot_uuid = ? 
       ORDER BY timestamp DESC 
       LIMIT ?`,
      [robotUuid, limit]
    );

    const reports: Reporte[] = rows.map(row => ({
      id: row.id,
      robot_uuid: row.robot_uuid,
      fecha: row.fecha,
      reporte_md: row.reporte_md,
      timestamp: row.timestamp,
      created_at: row.created_at
    }));

    
    return {
      success: true,
      reports
    };
  } catch (error) {
    console.error("❌ Error al obtener reportes:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido"
    };
  }
}

export async function getReportById(
  reportId: number
): Promise<{ success: boolean; report?: Reporte; error?: string }> {
  try {
    
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM reportes WHERE id = ?`,
      [reportId]
    );

    if (rows.length === 0) {
      return {
        success: false,
        error: "Reporte no encontrado"
      };
    }

    const report: Reporte = {
      id: rows[0].id,
      robot_uuid: rows[0].robot_uuid,
      fecha: rows[0].fecha,
      reporte_md: rows[0].reporte_md,
      timestamp: rows[0].timestamp,
      created_at: rows[0].created_at
    };

    
    return {
      success: true,
      report
    };
  } catch (error) {
    console.error("❌ Error al obtener reporte:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido"
    };
  }
}



