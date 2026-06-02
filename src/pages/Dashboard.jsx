import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; //  Importar
import api from '../api/axios';

const Dashboard = () => {
  const navigate = useNavigate(); //  Hook para redirección SPA

  // Estados de tareas y formulario
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para edición
  const [isEditing, setIsEditing] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('PENDING');
  const [editPriority, setEditPriority] = useState('MEDIUM');

  // Estados para filtros
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterSort, setFilterSort] = useState('desc');

  // Cargar tareas con filtros
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterPriority) params.append('priority', filterPriority);
      if (filterSort) params.append('sort', filterSort);
      const url = `/api/tasks${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get(url);
      setTasks(response.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar las tareas del servidor');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterPriority, filterSort]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Crear tarea con prioridad
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setIsSubmitting(true);
      const response = await api.post('/api/tasks', { title, description, priority });
      setTasks((prev) => [...prev, response.data]);
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
    } catch (err) {
      console.error(err);
      setError('No se pudo crear la tarea');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar tarea
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

  // Abrir modal de edición
  const openEditModal = (task) => {
    const taskId = task.id || task._id;
    setEditTaskId(taskId);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditStatus(task.status || 'PENDING');
    setEditPriority(task.priority || 'MEDIUM');
    setIsEditing(true);
  };

  // Guardar cambios (editar tarea)
  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const updatedTask = {
        title: editTitle,
        description: editDescription,
        status: editStatus,
        priority: editPriority,
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

  // Cerrar sesión (redirección SPA)
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login'); // Cambio importante
  };

  const clearFilters = () => {
    setFilterStatus('');
    setFilterPriority('');
    setFilterSort('desc');
  };

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
      {/* Cabecera */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#0f172a' }}>📋 Panel de Tareas SaaS</h1>
        <button onClick={handleLogout} style={{ padding: '8px 15px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          Cerrar Sesión
        </button>
      </div>

      {error && <p style={{ color: '#b91c1c', background: '#fee2e2', padding: '10px', borderRadius: '6px' }}>{error}</p>}

      {/* Formulario de creación */}
      <form onSubmit={handleCreateTask} style={{ display: 'flex', gap: '10px', marginBottom: '30px', background: '#ffffff', padding: '15px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Título de la tarea..." 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
          style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#0f172a' }}
        />
        <input 
          type="text" 
          placeholder="Descripción corta..." 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          required 
          style={{ flex: 2, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#0f172a' }}
        />
        <select 
          value={priority} 
          onChange={(e) => setPriority(e.target.value)} 
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#0f172a', cursor: 'pointer' }}
        >
          <option value="LOW">Baja</option>
          <option value="MEDIUM">Media</option>
          <option value="HIGH">Alta</option>
        </select>
        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{ padding: '10px 20px', background: isSubmitting ? '#64748b' : '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {isSubmitting ? 'Añadiendo...' : 'Añadir'}
        </button>
      </form>

      {/* Barra de filtros */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', alignItems: 'flex-end', flexWrap: 'wrap', background: '#ffffff', padding: '15px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8em', fontWeight: 'bold', marginBottom: '5px', color: '#334155' }}>Estado</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#0f172a' }}>
            <option value="">Todos</option>
            <option value="PENDING">Pendiente</option>
            <option value="IN_PROGRESS">En curso</option>
            <option value="COMPLETED">Completada</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8em', fontWeight: 'bold', marginBottom: '5px', color: '#334155' }}>Prioridad</label>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#0f172a' }}>
            <option value="">Todas</option>
            <option value="LOW">Baja</option>
            <option value="MEDIUM">Media</option>
            <option value="HIGH">Alta</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8em', fontWeight: 'bold', marginBottom: '5px', color: '#334155' }}>Orden</label>
          <select value={filterSort} onChange={(e) => setFilterSort(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#0f172a' }}>
            <option value="desc">Más recientes primero</option>
            <option value="asc">Más antiguas primero</option>
          </select>
        </div>
        <button onClick={clearFilters} style={{ padding: '8px 16px', background: '#64748b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '2px' }}>
          Limpiar filtros
        </button>
      </div>

      {/* Listado de tareas */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ color: '#0f172a' }}>Tus tareas</h3>
        <button onClick={fetchTasks} disabled={loading} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.9em' }}>
          {loading ? 'Sincronizando...' : '🔄 Sincronizar'}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>⏳ Cargando tareas...</div>
      ) : tasks.length === 0 ? (
        <p style={{ color: '#64748b', fontStyle: 'italic', background: '#f1f5f9', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>No hay tareas que coincidan con los filtros. ¡Crea una nueva!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tasks.map((task) => {
            const taskId = task.id || task._id;
            return (
              <div key={taskId} style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px', background: '#ffffff', boxShadow: '0 1px 2px rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: '0.2s' }}>
                <div style={{ flex: 1, marginRight: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '1.1em', color: '#0f172a' }}>{task.title}</strong>
                    <span style={{ 
                      padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold',
                      background: task.priority === 'LOW' ? '#dcfce7' : task.priority === 'MEDIUM' ? '#fef9c3' : '#fee2e2',
                      color: task.priority === 'LOW' ? '#166534' : task.priority === 'MEDIUM' ? '#854d0e' : '#991b1b'
                    }}>
                      {task.priority === 'LOW' ? 'Baja' : task.priority === 'MEDIUM' ? 'Media' : 'Alta'}
                    </span>
                    <span style={{ 
                      padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold',
                      background: task.status === 'PENDING' ? '#fef3c7' : task.status === 'IN_PROGRESS' ? '#dbeafe' : '#dcfce7',
                      color: task.status === 'PENDING' ? '#92400e' : task.status === 'IN_PROGRESS' ? '#1e40af' : '#166534'
                    }}>
                      {task.status === 'PENDING' ? 'Pendiente' : task.status === 'IN_PROGRESS' ? 'En curso' : 'Completada'}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: '#334155' }}>{task.description}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => openEditModal(task)} style={{ padding: '6px 12px', background: '#fff', color: '#3b82f6', border: '1px solid #3b82f6', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Editar</button>
                  <button onClick={() => handleDeleteTask(taskId)} style={{ padding: '6px 12px', background: '#fff', color: '#dc3545', border: '1px solid #dc3545', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Eliminar</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de edición */}
      {isEditing && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#f1f5f9', padding: '25px', borderRadius: '16px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, color: '#0f172a' }}>✏️ Editar tarea</h3>
            <form onSubmit={handleUpdateTask}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#334155' }}>Título</label>
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#0f172a' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#334155' }}>Descripción</label>
                <input type="text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#0f172a' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#334155' }}>Estado</label>
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#0f172a' }}>
                  <option value="PENDING">Pendiente</option>
                  <option value="IN_PROGRESS">En curso</option>
                  <option value="COMPLETED">Completada</option>
                </select>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#334155' }}>Prioridad</label>
                <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#0f172a' }}>
                  <option value="LOW">Baja</option>
                  <option value="MEDIUM">Media</option>
                  <option value="HIGH">Alta</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsEditing(false)} style={{ padding: '8px 16px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
                <button type="submit" style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;