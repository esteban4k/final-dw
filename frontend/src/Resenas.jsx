import { useEffect, useState } from 'react';
import { peticion } from './api';

const formularioVacio = {
  nombreRestaurante: '',
  calificacion: 5,
  fechaVisita: '',
  observaciones: ''
};

function Resenas({ onLogout }) {
  const [resenas, setResenas] = useState([]);
  const [form, setForm] = useState(formularioVacio);
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState('');

  const usuario = sessionStorage.getItem('usuario');

  useEffect(() => {
    cargarResenas();
  }, []);

  function manejarError(err) {
    // si el token vencio o no es valido se devuelve al login
    if (err.status === 401) {
      onLogout();
    } else {
      setError(err.message);
    }
  }

  async function cargarResenas() {
    try {
      const datos = await peticion('/resenas');
      setResenas(datos);
    } catch (err) {
      manejarError(err);
    }
  }

  function cambiarCampo(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function guardar(e) {
    e.preventDefault();
    setError('');

    try {
      if (editandoId) {
        await peticion('/resenas/' + editandoId, 'PUT', form);
      } else {
        await peticion('/resenas', 'POST', form);
      }
      limpiarFormulario();
      cargarResenas();
    } catch (err) {
      manejarError(err);
    }
  }

  function editar(resena) {
    setEditandoId(resena._id);
    setForm({
      nombreRestaurante: resena.nombreRestaurante,
      calificacion: resena.calificacion,
      fechaVisita: resena.fechaVisita.substring(0, 10),
      observaciones: resena.observaciones
    });
  }

  async function eliminar(id) {
    if (!confirm('¿Seguro que desea eliminar esta reseña?')) return;

    try {
      await peticion('/resenas/' + id, 'DELETE');
      cargarResenas();
    } catch (err) {
      manejarError(err);
    }
  }

  function limpiarFormulario() {
    setEditandoId(null);
    setForm(formularioVacio);
  }

  return (
    <div className="contenedor">
      <div className="encabezado">
        <h2>Mis reseñas de restaurantes</h2>
        <div>
          <span>Usuario: <b>{usuario}</b></span>
          <button className="secundario" onClick={onLogout}>Cerrar sesión</button>
        </div>
      </div>

      <div className="caja">
        <h3>{editandoId ? 'Editar reseña' : 'Nueva reseña'}</h3>

        <form onSubmit={guardar}>
          <label>Nombre del restaurante</label>
          <input name="nombreRestaurante" value={form.nombreRestaurante} onChange={cambiarCampo} required />

          <label>Calificación</label>
          <select name="calificacion" value={form.calificacion} onChange={cambiarCampo}>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>

          <label>Fecha de visita</label>
          <input type="date" name="fechaVisita" value={form.fechaVisita} onChange={cambiarCampo} required />

          <label>Observaciones</label>
          <textarea name="observaciones" value={form.observaciones} onChange={cambiarCampo} rows="3" />

          <button type="submit">{editandoId ? 'Actualizar' : 'Guardar'}</button>
          {editandoId && (
            <button type="button" className="secundario" onClick={limpiarFormulario}>Cancelar</button>
          )}
        </form>

        {error && <p className="mensaje">{error}</p>}
      </div>

      <div className="caja">
        <h3>Listado</h3>

        {resenas.length === 0 ? (
          <p>Todavía no tiene reseñas registradas.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Restaurante</th>
                <th>Calificación</th>
                <th>Fecha visita</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {resenas.map((r) => (
                <tr key={r._id}>
                  <td>{r.nombreRestaurante}</td>
                  <td>{'★'.repeat(r.calificacion)} ({r.calificacion})</td>
                  <td>{r.fechaVisita.substring(0, 10)}</td>
                  <td>{r.observaciones}</td>
                  <td>
                    <button onClick={() => editar(r)}>Editar</button>
                    <button className="peligro" onClick={() => eliminar(r._id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Resenas;
