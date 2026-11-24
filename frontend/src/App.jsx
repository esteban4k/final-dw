import { useState } from 'react';
import Login from './Login';
import Resenas from './Resenas';

function App() {
  const [token, setToken] = useState(sessionStorage.getItem('token'));

  function cerrarSesion() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    setToken(null);
  }

  if (!token) {
    return <Login onLogin={setToken} />;
  }

  return <Resenas onLogout={cerrarSesion} />;
}

export default App;
