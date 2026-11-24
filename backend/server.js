const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario, Resena } = require('./models');

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/resenas_restaurantes';
const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_desarrollo_web';

// evita que manden operadores como {"$ne": null} en los filtros
mongoose.set('sanitizeFilter', true);

const app = express();
app.use(cors());
app.use(express.json());




app.post('/api/registro', async (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ mensaje: 'Usuario y contraseña son obligatorios' });
  }

  const existe = await Usuario.findOne({ usuario });
  if (existe) {
    return res.status(400).json({ mensaje: 'El usuario ya existe' });
  }

  const passwordEncriptado = await bcrypt.hash(password, 10);
  await Usuario.create({ usuario, password: passwordEncriptado });

  res.status(201).json({ mensaje: 'Usuario registrado correctamente' });
});

app.post('/api/login', async (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ mensaje: 'Usuario y contraseña son obligatorios' });
  }

  const user = await Usuario.findOne({ usuario });
  if (!user) {
    return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos' });
  }

  const passwordCorrecto = await bcrypt.compare(password, user.password);
  if (!passwordCorrecto) {
    return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos' });
  }

  const token = jwt.sign({ id: user._id, usuario: user.usuario }, JWT_SECRET, { expiresIn: '2h' });

  res.json({ token, usuario: user.usuario });
});


// ================= MIDDLEWARE DEL TOKEN =================

function verificarToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ mensaje: 'No se envió el token' });
  }

  try {
    const datos = jwt.verify(token, JWT_SECRET);
    req.usuarioId = datos.id; // el id del usuario sale del token, no del body
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
}

// solo se toman estos campos del body, asi nadie puede cambiar el dueño de una reseña
function datosResena(body) {
  return {
    nombreRestaurante: body.nombreRestaurante,
    calificacion: body.calificacion,
    fechaVisita: body.fechaVisita,
    observaciones: body.observaciones
  };
}


// ================= CRUD DE RESEÑAS =================
// Todas las consultas filtran por usuarioId, entonces cada usuario
// solo puede ver, editar o borrar sus propias reseñas.

app.get('/api/resenas', verificarToken, async (req, res) => {
  const resenas = await Resena.find({ usuarioId: req.usuarioId }).sort({ fechaVisita: -1 });
  res.json(resenas);
});

app.get('/api/resenas/:id', verificarToken, async (req, res) => {
  const resena = await Resena.findOne({ _id: req.params.id, usuarioId: req.usuarioId });

  if (!resena) {
    return res.status(404).json({ mensaje: 'Reseña no encontrada' });
  }
  res.json(resena);
});

app.post('/api/resenas', verificarToken, async (req, res) => {
  const nueva = await Resena.create({
    ...datosResena(req.body),
    usuarioId: req.usuarioId
  });
  res.status(201).json(nueva);
});

app.put('/api/resenas/:id', verificarToken, async (req, res) => {
  const actualizada = await Resena.findOneAndUpdate(
    { _id: req.params.id, usuarioId: req.usuarioId },
    datosResena(req.body),
    { returnDocument: 'after', runValidators: true }
  );

  if (!actualizada) {
    return res.status(404).json({ mensaje: 'Reseña no encontrada' });
  }
  res.json(actualizada);
});

app.delete('/api/resenas/:id', verificarToken, async (req, res) => {
  const eliminada = await Resena.findOneAndDelete({ _id: req.params.id, usuarioId: req.usuarioId });

  if (!eliminada) {
    return res.status(404).json({ mensaje: 'Reseña no encontrada' });
  }
  res.json({ mensaje: 'Reseña eliminada' });
});


// manejo de errores general
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ mensaje: 'Datos inválidos, revise los campos' });
  }
  if (err.name === 'CastError') {
    return res.status(404).json({ mensaje: 'Reseña no encontrada' });
  }
  console.log(err);
  res.status(err.status || 500).json({ mensaje: 'Error en el servidor' });
});


mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Conectado a MongoDB');
    app.listen(PORT, () => {
      console.log('Servidor corriendo en http://localhost:' + PORT);
    });
  })
  .catch((err) => {
    console.log('Error conectando a MongoDB:', err.message);
  });
