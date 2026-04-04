import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useContext(AuthContext);
    const { colors } = useContext(ThemeContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register({ name, email, password });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: colors.bg,
            transition: 'background 0.3s ease'
        }}>
            <div style={{
                background: colors.card,
                borderRadius: '16px',
                boxShadow: `0 4px 24px ${colors.shadow}`,
                padding: '48px',
                width: '100%',
                maxWidth: '440px',
                transition: 'all 0.3s ease'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        fontSize: '40px',
                        marginBottom: '16px'
                    }}>🚀</div>
                    <h2 style={{
                        fontSize: '28px',
                        fontWeight: '600',
                        color: colors.text,
                        marginBottom: '8px'
                    }}>Create account</h2>
                    <p style={{
                        color: colors.textSecondary,
                        fontSize: '15px'
                    }}>Start organizing your tasks today</p>
                </div>

                {error && (
                    <div style={{
                        background: '#fef2f2',
                        color: '#dc2626',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        marginBottom: '24px',
                        fontSize: '14px',
                        border: '1px solid #fecaca'
                    }}>{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: colors.text
                        }}>Name</label>
                        <input
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: `1px solid ${colors.border}`,
                                borderRadius: '8px',
                                fontSize: '15px',
                                outline: 'none',
                                background: colors.bg,
                                color: colors.text,
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = colors.primary}
                            onBlur={(e) => e.target.style.borderColor = colors.border}
                        />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: colors.text
                        }}>Email</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: `1px solid ${colors.border}`,
                                borderRadius: '8px',
                                fontSize: '15px',
                                outline: 'none',
                                background: colors.bg,
                                color: colors.text,
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = colors.primary}
                            onBlur={(e) => e.target.style.borderColor = colors.border}
                        />
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: colors.text
                        }}>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: `1px solid ${colors.border}`,
                                borderRadius: '8px',
                                fontSize: '15px',
                                outline: 'none',
                                background: colors.bg,
                                color: colors.text,
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = colors.primary}
                            onBlur={(e) => e.target.style.borderColor = colors.border}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: loading ? colors.border : colors.primary,
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => !loading && (e.target.style.background = colors.primaryHover)}
                        onMouseOut={(e) => !loading && (e.target.style.background = colors.primary)}
                    >
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>
                </form>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    margin: '24px 0',
                    color: colors.textSecondary,
                    fontSize: '14px'
                }}>
                    <div style={{ flex: 1, height: '1px', background: colors.border }} />
                    <span style={{ padding: '0 16px' }}>or continue with</span>
                    <div style={{ flex: 1, height: '1px', background: colors.border }} />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    <button
                        onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: colors.bg,
                            border: `1px solid ${colors.border}`,
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            color: colors.text,
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.background = colors.cardHover}
                        onMouseOut={(e) => e.target.style.background = colors.bg}
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18">
                            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                            <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z"/>
                            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
                        </svg>
                        Google
                    </button>
                    <button
                        onClick={() => window.location.href = 'http://localhost:5000/api/auth/github'}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: colors.bg,
                            border: `1px solid ${colors.border}`,
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            color: colors.text,
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.background = colors.cardHover}
                        onMouseOut={(e) => e.target.style.background = colors.bg}
                    >
                        <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                        </svg>
                        GitHub
                    </button>
                </div>

                <p style={{
                    marginTop: '24px',
                    textAlign: 'center',
                    color: colors.textSecondary,
                    fontSize: '14px'
                }}>
                    Already have an account? <Link to="/login" style={{
                        color: colors.primary,
                        textDecoration: 'none',
                        fontWeight: '600'
                    }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
