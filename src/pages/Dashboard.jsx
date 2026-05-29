import { useEffect, useState } from 'react';
import api from '../api/axios';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  // 1. Cargar las tareas (Ruta corregida a /api/tasks)
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get('/api/tasks'); // 👈 Añadido /api
        setTasks(response.data);
      } catch (err) {
        console.error(err);
        setError('Error al cargar las tareas del servidor');
      }
    };

    fetchTasks();
  }, []);

  // 📤 2. Crear una nueva tarea con actualización optimista de red
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      setError('');
      
      // El POST nos devuelve la tarea recién creada en la Base de Datos con su ID y Status por defecto
      const response = await api.post('/api/tasks', { title, description }); // 👈 Añadido /api
      
      // ✅ PRÁCTICA EMPRESARIAL: Añadimos el objeto directamente al estado.
      // Así ahorramos una petición GET completa a Render, ahorrando ancho de banda.
      setTasks((prevTasks) => [...prevTasks, response.data]);
      
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error(err);
      setError('No se pudo crear la tarea');
    }
  };

  // 🚪 3. Salir del sistema de forma limpia (Sin provocar bucles raros de recarga)
  const handleLogout = () => {
    localStorage.removeItem('token');
    // En lugar de reload(), redirigimos para que la ruta protegida limpie el árbol de componentes
    window.location.href = '/login';
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>📋 Panel de Tareas SaaS</h1>
        <button onClick={handleLogout} style={{ padding: '8px 15px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Cerrar Sesión
        </button>
      </div>

      {error && <p style={{ color: 'red', background: '#f8d7da', padding: '10px', borderRadius: '4px' }}>{error}</p>}

      {/* Formulario de creación */}
      <form onSubmit={handleCreateTask} style={{ display: 'flex', gap: '10px', marginBottom: '30px', background: '#f8f9fa', padding: '15px', borderRadius: '6px' }}>
        <input 
          type="text" 
          placeholder="Título de la tarea..." 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
          style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
        <input 
          type="text" 
          placeholder="Descripción corta..." 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          required 
          style={{ flex: 2, padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
        <button type="submit" style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Añadir
        </button>
      </form>

      {/* Listado de tareas */}
      <h3>Tus tareas asignadas</h3>
      {tasks.length === 0 ? (
        <p style={{ color: '#6c757d', fontStyle: 'italic' }}>No tienes ninguna tarea registrada todavía. ¡Crea la primera arriba!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {tasks.map((task) => (
            // 🔍 Nota: Si en tu TaskResponseDTO de Java el campo se llama 'id', se queda como task.id. 
            // Si mapeaste la entidad pura de Mongo, cámbialo a task._id
            <div key={task.id || task._id} style={{ border: '1px solid #e2e8f0', padding: '15px', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <strong style={{ fontSize: '1.1em' }}>{task.title}</strong>
                <span style={{ 
                  padding: '3px 8px', 
                  borderRadius: '12px', 
                  fontSize: '0.85em', 
                  background: task.status === 'PENDING' ? '#ffeeba' : '#c3e6cb', 
                  color: task.status === 'PENDING' ? '#856404' : '#155724' 
                }}>
                  {task.status || 'PENDING'}
                </span>
              </div>
              <p style={{ margin: 0, color: '#4a5568' }}>{task.description}</p>
              {task.createdAt && (
                <small style={{ color: '#a0aec0', display: 'block', marginTop: '10px' }}>
                  Creada el: {new Date(task.createdAt).toLocaleString()}
                </small>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;