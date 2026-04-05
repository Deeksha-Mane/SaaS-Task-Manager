import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import api from '../api/axios';
import { ArrowLeft, ClipboardList, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

const Analytics = () => {
    const navigate = useNavigate();
    const { colors } = useContext(ThemeContext);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await api.get('/tasks');
            const tasksData = response.data.tasks || response.data || [];
            setTasks(Array.isArray(tasksData) ? tasksData : []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setTasks([]);
            setLoading(false);
        }
    };

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const highPriority = tasks.filter(t => t.priority === 'high').length;
    const mediumPriority = tasks.filter(t => t.priority === 'medium').length;
    const lowPriority = tasks.filter(t => t.priority === 'low').length;

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: colors.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    border: `4px solid ${colors.border}`,
                    borderTopColor: colors.primary,
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{ color: colors.textSecondary, fontSize: '15px' }}>Loading your insights...</p>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: colors.bg,
            transition: 'background 0.3s ease'
        }}>
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
                    maxWidth: '1200px',
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
                        }}>Analytics Dashboard</h1>
                        <p style={{
                            color: colors.textSecondary,
                            fontSize: '14px'
                        }}>Track your productivity and performance</p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="dashboard-icon-button"
                        style={{
                            padding: '8px 16px',
                            background: colors.bg,
                            border: `1px solid ${colors.border}`,
                            color: colors.text,
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <ArrowLeft size={16} /> Back to Dashboard
                    </button>
                </div>
            </div>

            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '32px 20px'
            }}>
                {/* Stats Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '20px',
                    marginBottom: '32px'
                }}>
                    <div style={{
                        background: colors.card,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '12px',
                        padding: '24px',
                        transition: 'all 0.3s ease'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '16px'
                        }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'rgba(59, 130, 246, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#3b82f6'
                            }}>
                                <ClipboardList size={24} />
                            </div>
                            <div>
                                <p style={{
                                    fontSize: '13px',
                                    color: colors.textSecondary,
                                    marginBottom: '4px',
                                    fontWeight: '500'
                                }}>Total Tasks</p>
                                <h2 style={{
                                    fontSize: '32px',
                                    fontWeight: '600',
                                    color: colors.text,
                                    lineHeight: 1
                                }}>{totalTasks}</h2>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        background: colors.card,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '12px',
                        padding: '24px',
                        transition: 'all 0.3s ease'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '16px'
                        }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'rgba(16, 185, 129, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: colors.success
                            }}>
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <p style={{
                                    fontSize: '13px',
                                    color: colors.textSecondary,
                                    marginBottom: '4px',
                                    fontWeight: '500'
                                }}>Completed</p>
                                <h2 style={{
                                    fontSize: '32px',
                                    fontWeight: '600',
                                    color: colors.success,
                                    lineHeight: 1
                                }}>{completedTasks}</h2>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        background: colors.card,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '12px',
                        padding: '24px',
                        transition: 'all 0.3s ease'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '16px'
                        }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'rgba(245, 158, 11, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: colors.warning
                            }}>
                                <Clock size={24} />
                            </div>
                            <div>
                                <p style={{
                                    fontSize: '13px',
                                    color: colors.textSecondary,
                                    marginBottom: '4px',
                                    fontWeight: '500'
                                }}>Pending</p>
                                <h2 style={{
                                    fontSize: '32px',
                                    fontWeight: '600',
                                    color: colors.warning,
                                    lineHeight: 1
                                }}>{pendingTasks}</h2>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        background: colors.card,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '12px',
                        padding: '24px',
                        transition: 'all 0.3s ease'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '16px'
                        }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'rgba(139, 92, 246, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#8b5cf6'
                            }}>
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p style={{
                                    fontSize: '13px',
                                    color: colors.textSecondary,
                                    marginBottom: '4px',
                                    fontWeight: '500'
                                }}>Completion Rate</p>
                                <h2 style={{
                                    fontSize: '32px',
                                    fontWeight: '600',
                                    color: colors.text,
                                    lineHeight: 1
                                }}>{completionRate}%</h2>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: '20px',
                    marginBottom: '32px'
                }}>
                    {/* Priority Distribution */}
                    <div style={{
                        background: colors.card,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '12px',
                        padding: '24px',
                        transition: 'all 0.3s ease'
                    }}>
                        <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: colors.text,
                            marginBottom: '24px'
                        }}>Task Priority Distribution</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '8px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            background: colors.danger
                                        }}></div>
                                        <span style={{
                                            fontSize: '14px',
                                            color: colors.text,
                                            fontWeight: '500'
                                        }}>High Priority</span>
                                    </div>
                                    <span style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: colors.text
                                    }}>{highPriority}</span>
                                </div>
                                <div style={{
                                    width: '100%',
                                    height: '8px',
                                    background: colors.border,
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${totalTasks > 0 ? (highPriority / totalTasks) * 100 : 0}%`,
                                        height: '100%',
                                        background: colors.danger,
                                        borderRadius: '4px',
                                        transition: 'width 0.5s ease'
                                    }}></div>
                                </div>
                            </div>

                            <div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '8px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            background: colors.warning
                                        }}></div>
                                        <span style={{
                                            fontSize: '14px',
                                            color: colors.text,
                                            fontWeight: '500'
                                        }}>Medium Priority</span>
                                    </div>
                                    <span style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: colors.text
                                    }}>{mediumPriority}</span>
                                </div>
                                <div style={{
                                    width: '100%',
                                    height: '8px',
                                    background: colors.border,
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${totalTasks > 0 ? (mediumPriority / totalTasks) * 100 : 0}%`,
                                        height: '100%',
                                        background: colors.warning,
                                        borderRadius: '4px',
                                        transition: 'width 0.5s ease'
                                    }}></div>
                                </div>
                            </div>

                            <div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '8px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            background: colors.success
                                        }}></div>
                                        <span style={{
                                            fontSize: '14px',
                                            color: colors.text,
                                            fontWeight: '500'
                                        }}>Low Priority</span>
                                    </div>
                                    <span style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: colors.text
                                    }}>{lowPriority}</span>
                                </div>
                                <div style={{
                                    width: '100%',
                                    height: '8px',
                                    background: colors.border,
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${totalTasks > 0 ? (lowPriority / totalTasks) * 100 : 0}%`,
                                        height: '100%',
                                        background: colors.success,
                                        borderRadius: '4px',
                                        transition: 'width 0.5s ease'
                                    }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Completion Progress */}
                    <div style={{
                        background: colors.card,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '12px',
                        padding: '24px',
                        transition: 'all 0.3s ease'
                    }}>
                        <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: colors.text,
                            marginBottom: '24px'
                        }}>Completion Progress</h3>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '24px'
                        }}>
                            <div style={{ position: 'relative', width: '200px', height: '200px' }}>
                                <svg viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r="80"
                                        fill="none"
                                        stroke={colors.border}
                                        strokeWidth="16"
                                    />
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r="80"
                                        fill="none"
                                        stroke={colors.primary}
                                        strokeWidth="16"
                                        strokeDasharray={`${(completionRate / 100) * 502.4} 502.4`}
                                        strokeLinecap="round"
                                        style={{ transition: 'stroke-dasharray 0.5s ease' }}
                                    />
                                </svg>
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    textAlign: 'center'
                                }}>
                                    <div style={{
                                        fontSize: '36px',
                                        fontWeight: '700',
                                        color: colors.text
                                    }}>{completionRate}%</div>
                                    <div style={{
                                        fontSize: '13px',
                                        color: colors.textSecondary,
                                        marginTop: '4px'
                                    }}>Complete</div>
                                </div>
                            </div>
                            <div style={{
                                display: 'flex',
                                gap: '32px',
                                width: '100%',
                                justifyContent: 'center'
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                        fontSize: '24px',
                                        fontWeight: '600',
                                        color: colors.success
                                    }}>{completedTasks}</div>
                                    <div style={{
                                        fontSize: '13px',
                                        color: colors.textSecondary,
                                        marginTop: '4px'
                                    }}>Completed</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                        fontSize: '24px',
                                        fontWeight: '600',
                                        color: colors.warning
                                    }}>{pendingTasks}</div>
                                    <div style={{
                                        fontSize: '13px',
                                        color: colors.textSecondary,
                                        marginTop: '4px'
                                    }}>Remaining</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Success Banner */}
                {completionRate >= 80 && (
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: `1px solid ${colors.success}`,
                        borderRadius: '12px',
                        padding: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: colors.success,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            flexShrink: 0
                        }}>
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <h4 style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: colors.text,
                                marginBottom: '4px'
                            }}>Excellent Progress!</h4>
                            <p style={{
                                fontSize: '14px',
                                color: colors.textSecondary,
                                margin: 0
                            }}>You're maintaining a {completionRate}% completion rate. Keep up the great work!</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;
