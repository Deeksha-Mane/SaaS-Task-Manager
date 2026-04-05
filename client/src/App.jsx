import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useContext } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import AuthCallback from './pages/AuthCallback';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    
    if (loading) return <div>Loading...</div>;
    
    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/auth/callback" element={<AuthCallback />} />
                        <Route 
                            path="/dashboard" 
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/profile" 
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/analytics" 
                            element={
                                <ProtectedRoute>
                                    <Analytics />
                                </ProtectedRoute>
                            } 
                        />
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                    </Routes>
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;
