import api from './axios';

// Register user
export const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

// Login user
export const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

// Get user profile
export const getProfile = async () => {
    const response = await api.get('/auth/profile');
    return response.data;
};

// Update user profile
export const updateProfile = async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
};
