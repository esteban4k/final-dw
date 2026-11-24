const API_URL = 'http://localhost:3000/api';

// funcion para hacer las peticiones al backend, agrega el token si existe
export async function peticion(ruta, metodo = 'GET', datos = null) {
  const opciones = {
    method: metodo,
    headers: { 'Content-Type': 'application/json' }
  };

  const token = sessionStorage.getItem('token');
  if (token) {
    opciones.headers['Authorization'] = 'Bearer ' + token;
  }

  if (datos) {
    opciones.body = JSON.stringify(datos);
  }

  const respuesta = await fetch(API_URL + ruta, opciones);
  const json = await respuesta.json();

  if (!respuesta.ok) {
    const error = new Error(json.mensaje || 'Ocurrió un error');
    error.status = respuesta.status;
    throw error;
  }

  return json;
}
