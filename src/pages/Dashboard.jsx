import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('PENDING');
  const [editPriority, setEditPriority] = useState('MEDIUM'); // Nuevo

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/api/tasks');
      setTasks(response.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar las tareas del servidor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setIsSubmitting(true);
      // Si quieres que las nuevas tareas tengan prioridad por defecto, añade 'priority: "MEDIUM"'
      const response = await api.post('/api/tasks', { title, description });
      setTasks((prev) => [...prev, response.data]);
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error(err);
      setError('No se pudo crear la tarea');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) return;
    try {
      setError('');
      await api.delete(`/api/tasks/${id}`);
      setTasks((prev) => prev.filter(task => (task.id || task._id) !== id));
    } catch (err) {
      console.error(err);
      setError('No se pudo eliminar la tarea del servidor');
    }
  };

  const openEditModal = (task) => {
    const taskId = task.id || task._id;
    setEditTaskId(taskId);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditStatus(task.status || 'PENDING');
    setEditPriority(task.priority || 'MEDIUM'); // Cargar prioridad
    setIsEditing(true);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const updatedTask = {
        title: editTitle,
        description: editDescription,
        status: editStatus,
        priority: editPriority, // Incluir prioridad
      };
      const response = await api.put(`/api/tasks/${editTaskId}`, updatedTask);
      setTasks((prev) =>
        prev.map(task =>
          (task.id || task._id) === editTaskId ? response.data : task
        )
      );
      setIsEditing(false);
      setEditTaskId(null);
    } catch (err) {
      console.error(err);
      setError('No se pudo actualizar la tarea');
    }
  };

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

      <form onSubmit={handleCreateTask} style={{ display: 'flex', gap: '10px', marginBottom: '30px', background: '#f8f9fa', padding: '15px', borderRadius: '6px' }}>
        <input type="text" placeholder="Título..." value={title} onChange={(e) => setTitle(e.target.value)} required style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #aaa', backgroundColor: '#fff', color: '#000' }} />
        <input type="text" placeholder="Descripción..." value={description} onChange={(e) => setDescription(e.target.value)} required style={{ flex: 2, padding: '10px', borderRadius: '4px', border: '1px solid #aaa', backgroundColor: '#fff', color: '#000' }} />
        <button type="submit" disabled={isSubmitting} style={{ padding: '10px 20px', background: isSubmitting ? '#6c757d' : '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{isSubmitting ? 'Añadiendo...' : 'Añadir'}</button>
      </form>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3>Tus tareas asignadas</h3>
        <button onClick={fetchTasks} disabled={loading} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '0.9em' }}>{loading ? 'Sincronizando...' : '🔄 Sincronizar'}</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>Cargando...</div>
      ) : tasks.length === 0 ? (
        <p style={{ color: '#6c757d' }}>No hay tareas. ¡Crea una!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {tasks.map((task) => {
            const taskId = task.id || task._id;
            return (
              <div key={taskId} style={{ border: '1px solid #e2e8f0', padding: '15px', borderRadius: '6px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '5px' }}>
                    <strong style={{ fontSize: '1.1em', color: '#000' }}>{task.title}</strong>
                    {/* Badge de prioridad */}
                    <span style={{ 
                      padding: '2px 8px', borderRadius: '12px', fontSize: '0.75em',
                      background: task.priority === 'LOW' ? '#d4edda' : task.priority === 'MEDIUM' ? '#fff3cd' : '#f8d7da',
                      color: task.priority === 'LOW' ? '#155724' : task.priority === 'MEDIUM' ? '#856404' : '#721c24'
                    }}>
                      {task.priority === 'LOW' ? 'Baja' : task.priority === 'MEDIUM' ? 'Media' : 'Alta'}
                    </span>
                    {/* Badge de estado */}
                    <span style={{ 
                      padding: '3px 8px', borderRadius: '12px', fontSize: '0.85em',
                      background: task.status === 'PENDING' ? '#ffeeba' : task.status === 'IN_PROGRESS' ? '#cce5ff' : '#c3e6cb',
                      color: task.status === 'PENDING' ? '#856404' : task.status === 'IN_PROGRESS' ? '#004085' : '#155724'
                    }}>
                      {task.status === 'PENDING' ? 'Pendiente' : task.status === 'IN_PROGRESS' ? 'En curso' : 'Completada'}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: '#1e293b' }}>{task.description}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => openEditModal(task)} style={{ padding: '6px 12px', background: '#fff', color: '#007bff', border: '1px solid #007bff', borderRadius: '4px', cursor: 'pointer' }}>Editar</button>
                  <button onClick={() => handleDeleteTask(taskId)} style={{ padding: '6px 12px', background: '#fff', color: '#dc3545', border: '1px solid #dc3545', borderRadius: '4px', cursor: 'pointer' }}>Eliminar</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isEditing && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#f0f2f5', padding: '25px', borderRadius: '8px', width: '90%', maxWidth: '500px' }}>
            <h3 style={{ marginTop: 0 , color: '#000' }}>✏️ Editar tarea</h3>
            <form onSubmit={handleUpdateTask}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold' ,color: '#000'}}>Título</label>
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #aaa', backgroundColor: '#fff', color: '#000' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold' ,color: '#000'}}>Descripción</label>
                <input type="text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #aaa', backgroundColor: '#fff', color: '#000' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold' ,color: '#000'}}>Estado</label>
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #aaa', backgroundColor: '#fff', color: '#000' }}>
                  <option value="PENDING">Pendiente</option>
                  <option value="IN_PROGRESS">En curso</option>
                  <option value="COMPLETED">Completada</option>
                </select>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 'bold' ,color: '#000'}}>Prioridad</label>
                <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #aaa', backgroundColor: '#fff', color: '#000' }}>
                  <option value="LOW">Baja</option>
                  <option value="MEDIUM">Media</option>
                  <option value="HIGH">Alta</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsEditing(false)} style={{ padding: '8px 16px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ padding: '8px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;