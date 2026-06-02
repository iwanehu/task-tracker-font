import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);

      // Petición al endpoint de autenticación que configuramos en Spring Security
      const response = await api.post('/api/auth/login', { email, password });
      
      // En un entorno profesional, guardamos el token devuelto por el DTO
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        // Redirección limpia al dashboard protegido
        navigate('/dashboard');
      } else {
        setError('El servidor no devolvió un token válido.');
      }
    } catch (err) {
      console.error(err);
      // Captura de errores semánticos del backend
      if (err.response && err.response.status === 403) {
        setError('Credenciales incorrectas. Inténtalo de nuevo.');
      } else {
        setError('No se pudo conectar con el servidor de autenticación.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '30px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'sans-serif', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>🔐 Iniciar Sesión</h2>
      
      {error && <p style={{ color: '#721c24', background: '#f8d7da', padding: '10px', borderRadius: '4px', fontSize: '0.9em', marginBottom: '15px' }}>{error}</p>}

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '0.9em', fontWeight: 'bold', color: '#4a5568' }}>Correo Electrónico</label>
          <input 
            type="email" 
            placeholder="tu@email.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '0.9em', fontWeight: 'bold', color: '#4a5568' }}>Contraseña</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '12px', background: loading ? '#6c757d' : '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', marginTop: '10px' }}
        >
          {loading ? 'Autenticando...' : 'Entrar al Sistema'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9em', color: '#64748b' }}>
        ¿No tienes cuenta? <Link to="/register" style={{ color: '#007bff', textDecoration: 'none' }}>Regístrate aquí</Link>
      </p>
    </div>
  );
};

export default Login;