import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { nombre, email, password, telefono, ubicacion } = await request.json();

    // Validaciones básicas
    if (!nombre || !email || !password) {
      return NextResponse.json(
        { message: 'Nombre, email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Llamar a la API real del servidor Express
    const response = await fetch('http://localhost:5001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre,
        email,
        password,
        telefono,
        ubicacion,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Error al crear la cuenta' },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { 
        message: 'Usuario creado exitosamente',
        user: data.data 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
