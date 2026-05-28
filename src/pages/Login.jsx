import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // 1. LIMPIAR AVISOS ANTERIORES
    setError('');

    // 2. VALIDACIÓN: Evitar que manden campos vacíos o con puros espacios
    if (!email.trim() || !password.trim()) {
      setError('¡Todos los campos son obligatorios! Introduce tus credenciales.');
      return; // 🛑 Detiene la ejecución aquí, no gasta petición a Render
    }

    try {
      // Consumimos tu endpoint enviando los datos limpios de espacios vacíos
      const response = await api.post('/auth/login', { 
        email: email.trim(), 
        password: password 
      });
      
      // Guardamos el token en el almacenamiento del navegador
      localStorage.setItem('token', response.data.token);
      
      // Saltamos al panel de tareas
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      // Intentamos capturar el mensaje exacto de Spring Boot si existe
      const servidorMensaje = err.response?.data?.message;
      setError(servidorMensaje || 'Credenciales incorrectas o error en el servidor.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>TaskTracker - Iniciar Sesión</h2>
      
      {error && <p style={{ color: 'red', background: '#f8d7da', padding: '10px', borderRadius: '4px' }}>{error}</p>}
      
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="email" 
          placeholder="Correo electrónico" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
        <input 
          type="password" 
          placeholder="Contraseña" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
        <button type="submit" style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Entrar
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9em' }}>
        ¿No tienes cuenta? <Link to="/register" style={{ color: '#007bff', textDecoration: 'none' }}>Regístrate aquí</Link>
      </p>
    </div>
  );
};

export default Login;