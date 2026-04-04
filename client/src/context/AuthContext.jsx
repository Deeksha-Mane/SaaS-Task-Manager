import { createContext, useState, useEffect } from 'react';
import { login as loginAPI, register as registerAPI } from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
            setUser(JSON.parse(userData));
        }
        setLoading(false);
    }, []);

    // Register function
    const register = async (userData) => {
        const data = await registerAPI(userData);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
            _id: data._id,
            name: data.name,
            email: data.email
        }));
        setUser({ _id: data._id, name: data.name, email: data.email });
        return data;
    };

    // Login function
    const login = async (credentials) => {
        const data = await loginAPI(credentials);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
            _id: data._id,
            name: data.name,
            email: data.email
        }));
        setUser({ _id: data._id, name: data.name, email: data.email });
        return data;
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    // Update user function
    const updateUser = (userData) => {
        const updatedUser = { ...user, ...userData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
