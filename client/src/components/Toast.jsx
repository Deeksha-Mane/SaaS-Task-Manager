import { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const colors = {
        success: { bg: '#10b981', icon: '✓' },
        error: { bg: '#ef4444', icon: '✕' },
        info: { bg: '#6366f1', icon: 'ℹ' }
    };

    const { bg, icon } = colors[type] || colors.success;

    return (
        <div style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            background: bg,
            color: 'white',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '15px',
            fontWeight: '500',
            zIndex: 1000,
            animation: 'slideIn 0.3s ease-out',
            minWidth: '250px'
        }}>
            <style>
                {`
                    @keyframes slideIn {
                        from {
                            transform: translateX(400px);
                            opacity: 0;
                        }
                        to {
                            transform: translateX(0);
                            opacity: 1;
                        }
                    }
                `}
            </style>
            <span style={{ fontSize: '20px' }}>{icon}</span>
            <span>{message}</span>
            <button
                onClick={onClose}
                style={{
                    marginLeft: 'auto',
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: 'white',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
            >
                ×
            </button>
        </div>
    );
};

export default Toast;
