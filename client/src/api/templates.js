import api from './axios';

export const createTemplate = async (templateData) => {
    const response = await api.post('/templates', templateData);
    return response.data;
};

export const getTemplates = async () => {
    const response = await api.get('/templates');
    return response.data;
};

export const deleteTemplate = async (id) => {
    const response = await api.delete(`/templates/${id}`);
    return response.data;
};
