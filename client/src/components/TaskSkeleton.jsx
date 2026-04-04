import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const TaskSkeleton = () => {
    const { colors } = useContext(ThemeContext);

    return (
        <div style={{
            background: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            padding: '20px',
            transition: 'all 0.3s ease'
        }}>
            <style>
                {`
                    @keyframes shimmer {
                        0% {
                            background-position: -1000px 0;
                        }
                        100% {
                            background-position: 1000px 0;
                        }
                    }
                `}
            </style>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '16px'
            }}>
                <div style={{ flex: 1 }}>
                    {/* Title skeleton */}
                    <div style={{
                        height: '20px',
                        width: '60%',
                        background: `linear-gradient(90deg, ${colors.border} 0%, ${colors.cardHover} 50%, ${colors.border} 100%)`,
                        backgroundSize: '1000px 100%',
                        animation: 'shimmer 2s infinite',
                        borderRadius: '4px',
                        marginBottom: '12px'
                    }} />
                    
                    {/* Description skeleton */}
                    <div style={{
                        height: '14px',
                        width: '80%',
                        background: `linear-gradient(90deg, ${colors.border} 0%, ${colors.cardHover} 50%, ${colors.border} 100%)`,
                        backgroundSize: '1000px 100%',
                        animation: 'shimmer 2s infinite',
                        borderRadius: '4px',
                        marginBottom: '12px'
                    }} />
                    
                    {/* Badges skeleton */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{
                            height: '24px',
                            width: '80px',
                            background: `linear-gradient(90deg, ${colors.border} 0%, ${colors.cardHover} 50%, ${colors.border} 100%)`,
                            backgroundSize: '1000px 100%',
                            animation: 'shimmer 2s infinite',
                            borderRadius: '12px'
                        }} />
                        <div style={{
                            height: '24px',
                            width: '70px',
                            background: `linear-gradient(90deg, ${colors.border} 0%, ${colors.cardHover} 50%, ${colors.border} 100%)`,
                            backgroundSize: '1000px 100%',
                            animation: 'shimmer 2s infinite',
                            borderRadius: '12px'
                        }} />
                    </div>
                </div>
                
                {/* Buttons skeleton */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{
                        height: '36px',
                        width: '36px',
                        background: `linear-gradient(90deg, ${colors.border} 0%, ${colors.cardHover} 50%, ${colors.border} 100%)`,
                        backgroundSize: '1000px 100%',
                        animation: 'shimmer 2s infinite',
                        borderRadius: '6px'
                    }} />
                    <div style={{
                        height: '36px',
                        width: '36px',
                        background: `linear-gradient(90deg, ${colors.border} 0%, ${colors.cardHover} 50%, ${colors.border} 100%)`,
                        backgroundSize: '1000px 100%',
                        animation: 'shimmer 2s infinite',
                        borderRadius: '6px'
                    }} />
                </div>
            </div>
        </div>
    );
};

export default TaskSkeleton;
