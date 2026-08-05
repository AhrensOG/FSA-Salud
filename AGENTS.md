# FSA Salud

## Objetivo del proyecto

Sistema de reserva de turnos médicos para pacientes de la provincia de Formosa, Argentina. La aplicación permite a los pacientes registrarse, iniciar sesión, buscar profesionales médicos y reservar turnos en centros de salud de la provincia.

## Stack tecnológico

| Componente   | Tecnología                |
| ------------ | ------------------------- |
| **Backend**  | NestJS 11 + TypeScript    |
| **Frontend** | Next.js 16 + React 19     |
| **Estilos**  | Tailwind CSS 4            |
| **Base URL** | `/frontend-next/`, `/backend-nest/` |

## Estructura del proyecto (monorepo)

```
FSA Salud/
├── backend-nest/     → API REST (puerto 3001)
└── frontend-next/    → App web (puerto 3000)
```

## Decisiones y cambios realizados

| Cambio | Motivo |
|--------|--------|
| **Backend en puerto 3001** (antes 3000) | Next.js usa el 3000 por defecto, entraban en conflicto (`EADDRINUSE`) |
| **Quitado "Iniciar sesión con Google"** | Se reemplazó por inicio de sesión tradicional (email/contraseña) |
| **Slogan "Tu salud, más cerca"** | Reemplazó a "¿Cómo quieres acceder?" para reforzar la identidad de marca |
| **Entidad User con campos completos** | DNI, teléfono, dirección y ciudad obligatorios para que el doctor tenga datos suficientes del paciente |
| **Roles: paciente, doctor, farmacéutico** | El farmacéutico validará recetas digitales (QR/DNI) para evitar falsificaciones de recetas en papel |
| **Registro por defecto como paciente** | Se quitó el selector de rol del formulario, todos se registran como pacientes |
| **Dashboard con navbar inferior** | Navegación fija abajo con Inicio, Citas, Farmacia, Justificante |
| **Menú hamburguesa lateral** | Reemplazó al botón Salir, contiene items de navegación secundaria + cerrar sesión |
| **Módulo de citas (Appointments)** | Entidad y endpoints para crear, listar y consultar citas médicas por paciente |
| **Módulo de recetas (Prescriptions)** | Entidad con items, QR único, endpoints para crear y consultar recetas pendientes |

## Estado actual

- **Base de datos**: SQLite con tablas `users`, `appointments`, `prescriptions`, `prescription_items` (TypeORM, synchronize automático)
- **Auth**: JWT funcional (`POST /auth/register`, `POST /auth/login`)
- **Frontend**: Home (`/`), Login (`/login`), Registro (`/register`), Dashboard (`/dashboard`) con citas futuras y recetas pendientes
- **Pendiente**: formulario de solicitud de cita, vista de farmacia, QR scanner, justificante médico
