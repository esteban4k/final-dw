import { useState } from 'react';
import { peticion } from './api';

function Login({ onLogin }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [esRegistro, setEsRegistro] = useState(false);
  const [mensaje, setMensaje] = useState('');

  async function enviar(e) {
    e.preventDefault();
    setMensaje('');

    try {
      if (esRegistro) {
        await peticion('/registro', 'POST', { usuario, password });
        setMensaje('Usuario creado, ya puede iniciar sesión');
        setEsRegistro(false);
        setPassword('');
      } else {
        const datos = await peticion('/login', 'POST', { usuario, password });
        // se guarda el token en el session storage
        sessionStorage.setItem('token', datos.token);
        sessionStorage.setItem('usuario', datos.usuario);
        onLogin(datos.token);
      }
    } catch (error) {
      setMensaje(error.message);
    }
  }

  function cambiarModo() {
    setEsRegistro(!esRegistro);
    setMensaje('');
  }

  return (
    <div className="caja login">
      <h2>{esRegistro ? 'Crear cuenta' : 'Iniciar sesión'}</h2>

      <form onSubmit={enviar}>
        <label>Usuario</label>
        <input value={usuario} onChange={(e) => setUsuario(e.target.value)} required />

        <label>Contraseña</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit">{esRegistro ? 'Registrarse' : 'Ingresar'}</button>
      </form>

      {mensaje && <p className="mensaje">{mensaje}</p>}

      <button className="enlace" onClick={cambiarModo}>
        {esRegistro ? 'Ya tengo cuenta, iniciar sesión' : '¿No tiene cuenta? Regístrese'}
      </button>
    </div>
  );
}

export default Login;
