import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // La URL se completa con baseURL de axios + '/api/auth/register'
      await api.post('/api/auth/register', { name, email, password });
      
      setSuccess('¡Cuenta creada con éxito! Redirigiéndote al login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Error en registro:', err);
      
      // Manejo más preciso de errores según código HTTP
      if (err.response) {
        const { status, data } = err.response;
        if (status === 400) {
          setError(data?.message || 'El correo ya está registrado o los datos no son válidos.');
        } else if (status === 409) {
          setError('El correo electrónico ya está en uso.');
        } else if (status === 500) {
          setError('Error interno del servidor. Inténtalo más tarde.');
        } else {
          setError(data?.message || 'Ocurrió un error al procesar el registro.');
        }
      } else if (err.request) {
        setError('No se pudo conectar con el servidor. Verifica tu conexión.');
      } else {
        setError('Error inesperado. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '30px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'sans-serif', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>📝 Registro de Usuario</h2>
      
      {error && <p style={{ color: '#721c24', background: '#f8d7da', padding: '10px', borderRadius: '4px', fontSize: '0.9em', marginBottom: '15px' }}>{error}</p>}
      {success && <p style={{ color: '#155724', background: '#d4edda', padding: '10px', borderRadius: '4px', fontSize: '0.9em', marginBottom: '15px' }}>{success}</p>}

      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '0.9em', fontWeight: 'bold', color: '#4a5568' }}>Nombre Completo</label>
          <input 
            type="text" 
            placeholder="Tu nombre aquí" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '0.9em', fontWeight: 'bold', color: '#4a5568' }}>Correo Electrónico</label>
          <input 
            type="email" 
            placeholder="ejemplo@correo.com" 
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
            placeholder="Mínimo 6 caracteres" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading || success}
          style={{ padding: '12px', background: (loading || success) ? '#6c757d' : '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: (loading || success) ? 'not-allowed' : 'pointer', fontWeight: 'bold', marginTop: '10px' }}
        >
          {loading ? 'Creando cuenta...' : 'Registrar Cuenta'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9em', color: '#64748b' }}>
        ¿Ya tienes cuenta? <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>Inicia sesión</Link>
      </p>
    </div>
  );
};

export default Register;