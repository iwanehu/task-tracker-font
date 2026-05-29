import api from './api'; // Importamos tu cliente configurado arriba

export const taskService = {
    // GET: Obtener todas las tareas (soporta filtros opcionales como ?status=PENDING)
    getTasks: async (filters = {}) => {
        const response = await api.get('/api/tasks', { params: filters });
        return response.data;
    },

    // POST: Crear una tarea pasando el DTO
    createTask: async (taskData) => {
        const response = await api.post('/api/tasks', taskData);
        return response.data;
    },

    // PUT: Actualizar una tarea por ID
    updateTask: async (id, taskData) => {
        const response = await api.put(`/api/tasks/${id}`, taskData);
        return response.data;
    },

    // DELETE: Borrar una tarea por ID
    deleteTask: async (id) => {
        const response = await api.delete(`/api/tasks/${id}`);
        return response.data;
    }
};