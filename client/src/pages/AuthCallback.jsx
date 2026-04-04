import { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setUser } = useContext(AuthContext);

    useEffect(() => {
        const token = searchParams.get('token');
        const userStr = searchParams.get('user');

        if (token && userStr) {
            try {
                const user = JSON.parse(decodeURIComponent(userStr));
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                // Update context if you have a setUser function
                navigate('/dashboard');
            } catch (error) {
                console.error('OAuth callback error:', error);
                navigate('/login');
            }
        } else {
            navigate('/login');
        }
    }, [searchParams, navigate]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                <p>Completing sign in...</p>
            </div>
        </div>
    );
};

export default AuthCallback;
