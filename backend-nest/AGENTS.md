@../AGENTS.md

# Backend - NestJS

- **Puerto**: 3001
- **Entry point**: `src/main.ts`
- **Base de datos**: PostgreSQL (local con `.env` o `DATABASE_URL` en Railway), TypeORM + `synchronize: true`
- **Config**: `DATABASE_URL` tiene prioridad sobre `DB_HOST/DB_PORT/DB_USER/DB_PASS/DB_NAME`

## Entidades
| Entidad | Tabla | Descripción |
|---------|-------|-------------|
| `User` | `users` | Pacientes, doctores, farmacéuticos |
| `Appointment` | `appointments` | Citas médicas |
| `Prescription` | `prescriptions` | Recetas digitales (QR) |
| `PrescriptionItem` | `prescription_items` | Medicamentos de cada receta |
| `MedicalRecord` | `medical_records` | Historial clínico por consulta |

## Estructura
```
src/
├── common/
│   └── guards/
│       ├── roles.guard.ts          → @Roles(UserRole.DOCTOR)
│       └── patient-access.guard.ts → Verifica que doctor y paciente tengan cita
├── users/
├── auth/
├── appointments/
├── prescriptions/
└── medical-records/
```

## Endpoints
| Método | Ruta | Acceso |
|--------|------|--------|
| `POST` | `/auth/register` | Público |
| `POST` | `/auth/login` | Público |
| `GET` | `/appointments/mine` | JWT |
| `POST` | `/appointments` | JWT |
| `GET` | `/prescriptions/pending` | JWT |
| `POST` | `/prescriptions` | JWT (doctor) |
| `GET` | `/prescriptions/qr/:code` | JWT |
| `POST` | `/appointments/:id/medical-record` | JWT (doctor, dueño de la cita) |
| `GET` | `/patients/:id/medical-records` | JWT (doctor con cita con el paciente) |
| `GET` | `/medical-records/:id` | JWT (doctor) |

## Control de acceso al historial clínico
Un doctor solo puede ver/escribir el historial de un paciente si existe al menos una cita entre ambos (`PatientAccessGuard`).
