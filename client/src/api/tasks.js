import api from './axios';

// Get all tasks
export const getTasks = async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/tasks?${params}`);
    return response.data;
};

// Create task
export const createTask = async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
};

// Update task
export const updateTask = async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
};

// Delete task
export const deleteTask = async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
};

export const checkRecurringTasks = async () => {
    const response = await api.post('/tasks/check-recurring');
    return response.data;
};

export const checkReminders = async () => {
    const response = await api.post('/tasks/check-reminders');
    return response.data;
};

// Add comment to task
export const addComment = async (taskId, text) => {
    const response = await api.post(`/tasks/${taskId}/comments`, { text });
    return response.data;
};

// Delete comment from task
export const deleteComment = async (taskId, commentId) => {
    const response = await api.delete(`/tasks/${taskId}/comments/${commentId}`);
    return response.data;
};
