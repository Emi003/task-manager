# Task Manager — Fullstack App

Aplicación de gestión de tareas con autenticación JWT, construida con React, Node.js y MySQL.

## Stack
- **Frontend:** React, Axios, Bootstrap
- **Backend:** Node.js, Express, MySQL2, JWT, bcryptjs
- **Base de datos:** MySQL

## Estructura del proyecto
```
task-manager/
├── backend/
│   ├── src/
│   │   ├── config/       # Conexión a BD y schema SQL
│   │   ├── controllers/  # Lógica de auth y tareas
│   │   ├── middleware/   # Verificación de JWT
│   │   └── routes/       # Rutas de la API
│   ├── .env.example
│   └── package.json
└── frontend/
    └── src/
        ├── components/   # Componentes reutilizables
        ├── pages/        # Páginas (Login, Register, Tasks)
        └── services/     # Llamadas a la API
```

## Instalación

### Base de datos
1. Crea la BD ejecutando el schema:
```bash
mysql -u root -p < backend/src/config/schema.sql
```

### Backend
```bash
cd backend
cp .env.example .env   # Llena tus credenciales
npm install
npm run dev            # Corre en http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
npm start              # Corre en http://localhost:3000
```

## Endpoints de la API

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | /api/auth/register | Registrar usuario | No |
| POST | /api/auth/login | Iniciar sesión | No |
| GET | /api/tasks | Obtener mis tareas | Sí |
| POST | /api/tasks | Crear tarea | Sí |
| PUT | /api/tasks/:id | Editar tarea | Sí |
| DELETE | /api/tasks/:id | Eliminar tarea | Sí |

## Screenshots
<img width="959" height="479" alt="image" src="https://github.com/user-attachments/assets/1215abde-df07-4957-bf9a-85d638150aeb" />
<img width="959" height="476" alt="image" src="https://github.com/user-attachments/assets/245d9094-ac38-4630-9afb-9f7226a93c3e" />


