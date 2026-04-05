import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { getProfile, updateProfile } from '../api/auth';
import Toast from '../components/Toast';
import { Sun, Moon } from 'lucide-react';

const Profile = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const { user, logout, updateUser } = useContext(AuthContext);
    const { colors, isDark, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate passwords if changing
        if (newPassword) {
            if (newPassword !== confirmPassword) {
                showToast('New passwords do not match', 'error');
                return;
            }
            if (newPassword.length < 6) {
                showToast('Password must be at least 6 characters', 'error');
                return;
            }
            if (!currentPassword) {
                showToast('Current password required to change password', 'error');
                return;
            }
        }

        setLoading(true);
        try {
            const updateData = { name, email };
            if (newPassword) {
                updateData.currentPassword = currentPassword;
                updateData.newPassword = newPassword;
            }

            const data = await updateProfile(updateData);
            
            // Update user in context
            updateUser({ name: data.name, email: data.email });
            
            // Clear password fields
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            
            showToast('Profile updated successfully!', 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to update profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: colors.bg,
            transition: 'background 0.3s ease'
        }}>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Header */}
            <div style={{
                background: colors.card,
                borderBottom: `1px solid ${colors.border}`,
                padding: '20px',
                position: 'sticky',
                top: 0,
                zIndex: 10,
                transition: 'all 0.3s ease'
            }}>
                <div style={{
                    maxWidth: '800px',
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '24px',
                            fontWeight: '600',
                            color: colors.text,
                            marginBottom: '4px'
                        }}>Profile Settings</h1>
                        <p style={{
                            color: colors.textSecondary,
                            fontSize: '14px'
                        }}>Manage your account information</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button
                            onClick={toggleTheme}
                            className="dashboard-icon-button"
                            style={{
                                padding: '8px 16px',
                                background: colors.bg,
                                border: `1px solid ${colors.border}`,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '18px',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                color: colors.text
                            }}
                        >
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            style={{
                                padding: '8px 16px',
                                background: colors.bg,
                                border: `1px solid ${colors.border}`,
                                color: colors.text,
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.background = colors.cardHover}
                            onMouseOut={(e) => e.target.style.background = colors.bg}
                        >
                            ← Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>

            {/* Profile Form */}
            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: '32px 20px'
            }}>
                <div style={{
                    background: colors.card,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '12px',
                    padding: '32px',
                    transition: 'all 0.3s ease'
                }}>
                    <form onSubmit={handleSubmit}>
                        {/* Account Information */}
                        <div style={{ marginBottom: '32px' }}>
                            <h2 style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: colors.text,
                                marginBottom: '16px'
                            }}>Account Information</h2>
                            
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: colors.text
                                }}>Name</label>
                                <input
                                    type="text"
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

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: colors.text
                                }}>Email</label>
                                <input
                                    type="email"
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
                        </div>

                        {/* Change Password */}
                        <div style={{ marginBottom: '32px' }}>
                            <h2 style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: colors.text,
                                marginBottom: '8px'
                            }}>Change Password</h2>
                            <p style={{
                                fontSize: '13px',
                                color: colors.textSecondary,
                                marginBottom: '16px'
                            }}>Leave blank to keep current password</p>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: colors.text
                                }}>Current Password</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter current password"
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

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: colors.text
                                }}>New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
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

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: colors.text
                                }}>Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
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
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '14px',
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
                            {loading ? 'Updating...' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
