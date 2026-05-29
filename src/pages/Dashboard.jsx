import { useEffect, useState } from 'react';
import api from '../api/axios';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); // ⏳ Estado de carga inicial
  const [isSubmitting, setIsSubmitting] = useState(false); // 🚀 Evita doble envío en el formulario

  // 1. Cargar las tareas del servidor
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/api/tasks');
      setTasks(response.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar las tareas del servidor');
    } finally {
      setLoading(false); // Apagamos el estado de carga siempre (falle o funcione)
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // 📤 2. Crear una nueva tarea
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setIsSubmitting(true); // Bloqueamos el botón de añadir

      const response = await api.post('/api/tasks', { title, description });
      
      // Actualización optimista: inyectamos la tarea nueva directamente en la lista
      setTasks((prevTasks) => [...prevTasks, response.data]);
      
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error(err);
      setError('No se pudo crear la tarea');
    } finally {
      setIsSubmitting(false); // Liberamos el botón
    }
  };

  // 🗑️ 3. Eliminar una tarea por ID
  const handleDeleteTask = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) return;

    try {
      setError('');
      // Llamamos al endpoint DELETE que ajustamos en Spring Boot
      await api.delete(`/api/tasks/${id}`);
      
      // Filtramos el estado local para borrarla visualmente al instante
      setTasks((prevTasks) => prevTasks.filter(task => (task.id || task._id) !== id));
    } catch (err) {
      console.error(err);
      setError('No se pudo eliminar la tarea del servidor');
    }
  };

  // 🚪 4. Salir del sistema
  const handleLogout = () => {
    localStorage.removeItem('token');
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
        <button 
          type="submit" 
          disabled={isSubmitting} // Se deshabilita durante el envío
          style={{ 
            padding: '10px 20px', 
            background: isSubmitting ? '#6c757d' : '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: isSubmitting ? 'not-allowed' : 'pointer' 
          }}
        >
          {isSubmitting ? 'Añadiendo...' : 'Añadir'}
        </button>
      </form>

      {/* Listado de tareas con control de estado de carga */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3>Tus tareas asignadas</h3>
        <button 
          onClick={fetchTasks} 
          disabled={loading}
          style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '0.9em' }}
        >
          {loading ? 'Sincronizando...' : '🔄 Sincronizar'}
        </button>
      </div>

      {loading ? (
        // ⏳ Contenedor visual de carga
        <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d', fontStyle: 'italic' }}>
          <p>⏳ Conectando con el servidor en Render y cargando tareas...</p>
        </div>
      ) : tasks.length === 0 ? (
        <p style={{ color: '#6c757d', fontStyle: 'italic' }}>No tienes ninguna tarea registrada todavía. ¡Crea la primera arriba!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {tasks.map((task) => {
            const taskId = task.id || task._id;
            return (
              <div key={taskId} style={{ border: '1px solid #e2e8f0', padding: '15px', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1, marginRight: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
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
                </div>

                {/* 🗑️ Botón de eliminar */}
                <button 
                  onClick={() => handleDeleteTask(taskId)}
                  style={{ padding: '6px 12px', background: '#fff', color: '#dc3545', border: '1px solid #dc3545', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}
                  onMouseEnter={(e) => { e.target.style.background = '#dc3545'; e.target.style.color = '#white'; }}
                  onMouseLeave={(e) => { e.target.style.background = '#fff'; e.target.style.color = '#dc3545'; }}
                >
                  Eliminar
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;