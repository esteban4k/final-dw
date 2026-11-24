# Reseñas de restaurantes

Proyecto final de Desarrollo Web.

- Frontend: React
- Backend: Node.js con Express
- Base de datos: MongoDB

## Como correrlo

Primero tener MongoDB corriendo en localhost:27017

Backend:

```
cd backend
npm install
npm start
```

Frontend:

```
cd frontend
npm install
npm run dev
```

Despues entrar a http://localhost:5173, crear un usuario e iniciar sesion.

## Endpoints

- POST /api/registro
- POST /api/login
- GET /api/resenas
- GET /api/resenas/:id
- POST /api/resenas
- PUT /api/resenas/:id
- DELETE /api/resenas/:id

Las rutas de reseñas piden el token en el header `Authorization: Bearer <token>`. Cada usuario solo puede ver y modificar sus propias reseñas.
