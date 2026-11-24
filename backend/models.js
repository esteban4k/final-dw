const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  usuario: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true }
});

const resenaSchema = new mongoose.Schema({
  nombreRestaurante: { type: String, required: true, trim: true },
  calificacion: { type: Number, required: true, min: 1, max: 5 },
  fechaVisita: { type: Date, required: true },
  observaciones: { type: String, default: '' },
  // dueño de la reseña
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true }
}, { timestamps: true });

const Usuario = mongoose.model('Usuario', usuarioSchema);
const Resena = mongoose.model('Resena', resenaSchema);

module.exports = { Usuario, Resena };
