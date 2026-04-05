import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { getTasks, createTask, updateTask, deleteTask, checkRecurringTasks, checkReminders, addComment, deleteComment } from '../api/tasks';
import { getTemplates, createTemplate, deleteTemplate } from '../api/templates';
import Toast from '../components/Toast';
import AnimatedCounter from '../components/AnimatedCounter';
import TaskSkeleton from '../components/TaskSkeleton';
import { Sun, Moon, User, BarChart3, Download, FileText, History, Plus, Search, LogOut, AlertCircle, Circle, Calendar, Bell, Repeat, Save, X, Bookmark, CheckCircle2, List, LayoutGrid, Clock, MessageCircle, Send, Trash2 } from 'lucide-react';

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [allTasks, setAllTasks] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [dueDate, setDueDate] = useState('');
    const [tags, setTags] = useState([]);
    const [filter, setFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [tagFilter, setTagFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('date-desc');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editPriority, setEditPriority] = useState('medium');
    const [editStatus, setEditStatus] = useState('pending');
    const [editDueDate, setEditDueDate] = useState('');
    const [editTags, setEditTags] = useState([]);
    const [editSubtasks, setEditSubtasks] = useState([]);
    const [newSubtask, setNewSubtask] = useState('');
    const [editNotes, setEditNotes] = useState('');
    const [toast, setToast] = useState(null);
    const [draggedTask, setDraggedTask] = useState(null);
    const [selectedTasks, setSelectedTasks] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [showTemplates, setShowTemplates] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringPattern, setRecurringPattern] = useState('');
    const [editIsRecurring, setEditIsRecurring] = useState(false);
    const [editRecurringPattern, setEditRecurringPattern] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderDate, setReminderDate] = useState('');
    const [editReminderEnabled, setEditReminderEnabled] = useState(false);
    const [editReminderDate, setEditReminderDate] = useState('');
    const [savedViews, setSavedViews] = useState([]);
    const [showSaveView, setShowSaveView] = useState(false);
    const [viewName, setViewName] = useState('');
    const [quickFilter, setQuickFilter] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'board'
    const [newComment, setNewComment] = useState('');
    const [showComments, setShowComments] = useState(null); // taskId to show comments for

    const { user, logout } = useContext(AuthContext);
    const { colors, isDark, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();

    const availableTags = ['Work', 'Personal', 'Shopping', 'Urgent', 'Health'];

    // Load saved views from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('tasq-saved-views');
        if (saved) {
            setSavedViews(JSON.parse(saved));
        }
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const fetchTasks = async () => {
        try {
            // Fetch filtered tasks for display
            const filters = {};
            if (filter) filters.status = filter;
            if (priorityFilter) filters.priority = priorityFilter;
            const data = await getTasks(filters);
            setTasks(data.tasks);

            // Fetch all tasks for stats (no filters)
            const allData = await getTasks({});
            setAllTasks(allData.tasks);
        } catch (err) {
            console.error('Error fetching tasks:', err);
        } finally {
            setInitialLoading(false);
        }
    };

    const fetchTemplates = async () => {
        try {
            const data = await getTemplates();
            setTemplates(data.templates);
        } catch (err) {
            console.error('Error fetching templates:', err);
        }
    };

    useEffect(() => {
        fetchTasks();
        fetchTemplates();
        checkAndCreateRecurringTasks();
        checkAndSendReminders();
    }, [filter, priorityFilter]);

    const checkAndCreateRecurringTasks = async () => {
        try {
            const result = await checkRecurringTasks();
            if (result.tasks && result.tasks.length > 0) {
                fetchTasks();
                showToast(`${result.tasks.length} recurring task(s) created!`, 'success');
            }
        } catch (err) {
            console.error('Error checking recurring tasks:', err);
        }
    };

    const checkAndSendReminders = async () => {
        try {
            const result = await checkReminders();
            if (result.reminders && result.reminders.length > 0) {
                fetchTasks();
                showToast(`${result.reminders.length} reminder(s) triggered!`, 'success');
            }
        } catch (err) {
            console.error('Error checking reminders:', err);
        }
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e) => {
            // Ignore if user is typing in an input/textarea
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                // Allow Esc to work even in inputs
                if (e.key === 'Escape') {
                    if (showForm) {
                        setShowForm(false);
                        setTitle('');
                        setDescription('');
                        setPriority('medium');
                        setDueDate('');
                    }
                    if (editingTask) {
                        handleCancelEdit();
                    }
                    e.target.blur(); // Unfocus input
                }
                return;
            }

            // N - New task
            if (e.key === 'n' || e.key === 'N') {
                e.preventDefault();
                setShowForm(true);
            }

            // / - Focus search
            if (e.key === '/') {
                e.preventDefault();
                const searchInput = document.querySelector('input[placeholder*="Search"]');
                if (searchInput) searchInput.focus();
            }

            // Esc - Close forms
            if (e.key === 'Escape') {
                if (showForm) {
                    setShowForm(false);
                    setTitle('');
                    setDescription('');
                    setPriority('medium');
                    setDueDate('');
                    setTags([]);
                }
                if (editingTask) {
                    handleCancelEdit();
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [showForm, editingTask]);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!title) return;

        setLoading(true);
        try {
            await createTask({ 
                title, 
                description, 
                priority, 
                dueDate: dueDate || null, 
                tags,
                isRecurring,
                recurringPattern: isRecurring ? recurringPattern : '',
                reminderEnabled,
                reminderDate: reminderEnabled ? reminderDate : null
            });
            setTitle('');
            setDescription('');
            setPriority('medium');
            setDueDate('');
            setTags([]);
            setIsRecurring(false);
            setRecurringPattern('');
            setReminderEnabled(false);
            setReminderDate('');
            setShowForm(false);
            fetchTasks();
            showToast('Task created successfully!', 'success');
        } catch (err) {
            console.error('Error creating task:', err);
            showToast('Failed to create task', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (task) => {
        try {
            await updateTask(task._id, {
                status: task.status === 'pending' ? 'completed' : 'pending'
            });
            fetchTasks();
            showToast(
                task.status === 'pending' ? 'Task completed!' : 'Task marked as pending',
                'success'
            );
        } catch (err) {
            console.error('Error updating task:', err);
            showToast('Failed to update task', 'error');
        }
    };

    const handleEdit = (task) => {
        setEditingTask(task._id);
        setEditTitle(task.title);
        setEditDescription(task.description || '');
        setEditPriority(task.priority);
        setEditStatus(task.status);
        setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
        setEditTags(task.tags || []);
        setEditSubtasks(task.subtasks || []);
        setEditNotes(task.notes || '');
        setEditIsRecurring(task.isRecurring || false);
        setEditRecurringPattern(task.recurringPattern || '');
        setEditReminderEnabled(task.reminderEnabled || false);
        setEditReminderDate(task.reminderDate ? new Date(task.reminderDate).toISOString().slice(0, 16) : '');
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editTitle) return;

        setLoading(true);
        try {
            await updateTask(editingTask, {
                title: editTitle,
                description: editDescription,
                priority: editPriority,
                status: editStatus,
                dueDate: editDueDate || null,
                tags: editTags,
                subtasks: editSubtasks,
                notes: editNotes,
                isRecurring: editIsRecurring,
                recurringPattern: editIsRecurring ? editRecurringPattern : '',
                reminderEnabled: editReminderEnabled,
                reminderDate: editReminderEnabled ? editReminderDate : null
            });
            setEditingTask(null);
            fetchTasks();
            showToast('Task updated successfully!', 'success');
        } catch (err) {
            console.error('Error updating task:', err);
            showToast('Failed to update task', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingTask(null);
        setEditTitle('');
        setEditDescription('');
        setEditPriority('medium');
        setEditStatus('pending');
        setEditDueDate('');
        setEditTags([]);
        setEditSubtasks([]);
        setNewSubtask('');
        setEditNotes('');
        setEditIsRecurring(false);
        setEditRecurringPattern('');
        setEditReminderEnabled(false);
        setEditReminderDate('');
    };

    const addSubtask = () => {
        if (!newSubtask.trim()) return;
        setEditSubtasks([...editSubtasks, { text: newSubtask, completed: false }]);
        setNewSubtask('');
    };

    const toggleSubtask = (index) => {
        const updated = [...editSubtasks];
        updated[index].completed = !updated[index].completed;
        setEditSubtasks(updated);
    };

    const removeSubtask = (index) => {
        setEditSubtasks(editSubtasks.filter((_, i) => i !== index));
    };

    const isOverdue = (dueDate) => {
        if (!dueDate) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);
        return due < today;
    };

    const formatDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dateString);
        due.setHours(0, 0, 0, 0);
        
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays === -1) return 'Yesterday';
        if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
        if (diffDays < 7) return `In ${diffDays} days`;
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getTagColor = (tag) => {
        const tagColors = {
            'Work': '#3b82f6',
            'Personal': '#8b5cf6',
            'Shopping': '#ec4899',
            'Urgent': '#ef4444',
            'Health': '#10b981'
        };
        return tagColors[tag] || '#6b7280';
    };

    const toggleTag = (tag, isEdit = false) => {
        if (isEdit) {
            setEditTags(prev =>
                prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
            );
        } else {
            setTags(prev =>
                prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
            );
        }
    };

    // Saved Views Functions
    const saveCurrentView = () => {
        if (!viewName.trim()) {
            showToast('Please enter a view name', 'error');
            return;
        }

        const newView = {
            id: Date.now(),
            name: viewName,
            filters: {
                status: filter,
                priority: priorityFilter,
                tag: tagFilter,
                sortBy: sortBy
            }
        };

        const updated = [...savedViews, newView];
        setSavedViews(updated);
        localStorage.setItem('tasq-saved-views', JSON.stringify(updated));
        setViewName('');
        setShowSaveView(false);
        showToast(`View "${viewName}" saved!`, 'success');
    };

    const loadSavedView = (view) => {
        setFilter(view.filters.status);
        setPriorityFilter(view.filters.priority);
        setTagFilter(view.filters.tag);
        setSortBy(view.filters.sortBy);
        setQuickFilter('');
        showToast(`Loaded "${view.name}"`, 'success');
    };

    const deleteSavedView = (id, name) => {
        if (!confirm(`Delete view "${name}"?`)) return;
        
        const updated = savedViews.filter(v => v.id !== id);
        setSavedViews(updated);
        localStorage.setItem('tasq-saved-views', JSON.stringify(updated));
        showToast('View deleted', 'success');
    };

    // Quick Filter Functions
    const applyQuickFilter = (filterType) => {
        setQuickFilter(filterType);
        setFilter('');
        setPriorityFilter('');
        setTagFilter('');
    };

    const getQuickFilteredTasks = () => {
        if (!quickFilter) return tasks;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (quickFilter) {
            case 'today':
                return tasks.filter(task => {
                    if (!task.dueDate) return false;
                    const due = new Date(task.dueDate);
                    due.setHours(0, 0, 0, 0);
                    return due.getTime() === today.getTime();
                });
            
            case 'week':
                const weekEnd = new Date(today);
                weekEnd.setDate(today.getDate() + 7);
                return tasks.filter(task => {
                    if (!task.dueDate) return false;
                    const due = new Date(task.dueDate);
                    return due >= today && due <= weekEnd;
                });
            
            case 'overdue':
                return tasks.filter(task => {
                    if (!task.dueDate || task.status === 'completed') return false;
                    const due = new Date(task.dueDate);
                    due.setHours(0, 0, 0, 0);
                    return due < today;
                });
            
            case 'urgent':
                const urgentEnd = new Date(today);
                urgentEnd.setDate(today.getDate() + 3);
                return tasks.filter(task => {
                    if (task.status === 'completed') return false;
                    if (task.priority !== 'high') return false;
                    if (!task.dueDate) return task.priority === 'high';
                    const due = new Date(task.dueDate);
                    return due <= urgentEnd;
                });
            
            case 'completed-today':
                return tasks.filter(task => {
                    if (task.status !== 'completed') return false;
                    const updated = new Date(task.updatedAt);
                    updated.setHours(0, 0, 0, 0);
                    return updated.getTime() === today.getTime();
                });
            
            default:
                return tasks;
        }
    };

    // Filter tasks based on search query
    const baseFilteredTasks = quickFilter ? getQuickFilteredTasks() : tasks;
    
    const filteredTasks = searchQuery
        ? baseFilteredTasks.filter(task =>
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        : baseFilteredTasks;

    // Filter by tag
    const tagFilteredTasks = tagFilter
        ? filteredTasks.filter(task => task.tags && task.tags.includes(tagFilter))
        : filteredTasks;

    // Sort tasks
    const sortedTasks = [...tagFilteredTasks].sort((a, b) => {
        switch (sortBy) {
            case 'date-desc':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'date-asc':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'priority':
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            case 'status':
                return a.status === 'pending' ? -1 : 1;
            case 'dueDate':
                if (!a.dueDate && !b.dueDate) return 0;
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            case 'custom':
                return (a.order || 0) - (b.order || 0);
            default:
                return 0;
        }
    });

    const handleDragStart = (e, task) => {
        setDraggedTask(task);
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.style.opacity = '0.5';
    };

    const handleDragEnd = (e) => {
        e.currentTarget.style.opacity = '1';
        setDraggedTask(null);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e, targetTask) => {
        e.preventDefault();
        
        if (!draggedTask || draggedTask._id === targetTask._id) return;

        // Reorder tasks
        const reorderedTasks = [...sortedTasks];
        const draggedIndex = reorderedTasks.findIndex(t => t._id === draggedTask._id);
        const targetIndex = reorderedTasks.findIndex(t => t._id === targetTask._id);

        // Remove dragged task and insert at target position
        reorderedTasks.splice(draggedIndex, 1);
        reorderedTasks.splice(targetIndex, 0, draggedTask);

        // Update order for all tasks
        try {
            const updatePromises = reorderedTasks.map((task, index) => 
                updateTask(task._id, { order: index })
            );
            await Promise.all(updatePromises);
            
            // Switch to custom sort to show the new order
            setSortBy('custom');
            fetchTasks();
            showToast('Tasks reordered!', 'success');
        } catch (err) {
            console.error('Error reordering tasks:', err);
            showToast('Failed to reorder tasks', 'error');
        }
    };

    const toggleTaskSelection = (taskId) => {
        setSelectedTasks(prev =>
            prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedTasks.length === sortedTasks.length) {
            setSelectedTasks([]);
        } else {
            setSelectedTasks(sortedTasks.map(t => t._id));
        }
    };

    const handleBulkComplete = async () => {
        if (selectedTasks.length === 0) return;
        
        try {
            const updatePromises = selectedTasks.map(taskId =>
                updateTask(taskId, { status: 'completed' })
            );
            await Promise.all(updatePromises);
            setSelectedTasks([]);
            fetchTasks();
            showToast(`${selectedTasks.length} tasks completed!`, 'success');
        } catch (err) {
            console.error('Error completing tasks:', err);
            showToast('Failed to complete tasks', 'error');
        }
    };

    const handleBulkPending = async () => {
        if (selectedTasks.length === 0) return;
        
        try {
            const updatePromises = selectedTasks.map(taskId =>
                updateTask(taskId, { status: 'pending' })
            );
            await Promise.all(updatePromises);
            setSelectedTasks([]);
            fetchTasks();
            showToast(`${selectedTasks.length} tasks marked as pending!`, 'success');
        } catch (err) {
            console.error('Error updating tasks:', err);
            showToast('Failed to update tasks', 'error');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedTasks.length === 0) return;
        
        if (!confirm(`Delete ${selectedTasks.length} selected tasks?`)) return;
        
        try {
            const deletePromises = selectedTasks.map(taskId => deleteTask(taskId));
            await Promise.all(deletePromises);
            setSelectedTasks([]);
            fetchTasks();
            showToast(`${selectedTasks.length} tasks deleted!`, 'success');
        } catch (err) {
            console.error('Error deleting tasks:', err);
            showToast('Failed to delete tasks', 'error');
        }
    };

    const exportToCSV = () => {
        if (sortedTasks.length === 0) {
            showToast('No tasks to export', 'error');
            return;
        }

        // CSV headers
        const headers = ['Title', 'Description', 'Status', 'Priority', 'Due Date', 'Tags', 'Notes', 'Subtasks', 'Created At'];
        
        // Convert tasks to CSV rows
        const rows = sortedTasks.map(task => {
            const subtasksText = task.subtasks && task.subtasks.length > 0
                ? task.subtasks.map(s => `${s.completed ? '✓' : '○'} ${s.text}`).join('; ')
                : '';
            
            return [
                task.title,
                task.description || '',
                task.status,
                task.priority,
                task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '',
                task.tags ? task.tags.join(', ') : '',
                task.notes || '',
                subtasksText,
                new Date(task.createdAt).toLocaleDateString()
            ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
        });

        // Combine headers and rows
        const csv = [headers.join(','), ...rows].join('\n');

        // Create blob and download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `tasks_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('Tasks exported to CSV!', 'success');
    };

    const exportToPDF = () => {
        if (sortedTasks.length === 0) {
            showToast('No tasks to export', 'error');
            return;
        }

        // Create a new window with printable content
        const printWindow = window.open('', '', 'width=800,height=600');
        
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Tasks Export - ${new Date().toLocaleDateString()}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    h1 {
                        color: #333;
                        border-bottom: 2px solid #6366f1;
                        padding-bottom: 10px;
                    }
                    .task {
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        padding: 15px;
                        margin-bottom: 15px;
                        page-break-inside: avoid;
                    }
                    .task-title {
                        font-size: 18px;
                        font-weight: bold;
                        margin-bottom: 8px;
                        color: #333;
                    }
                    .task-description {
                        color: #666;
                        margin-bottom: 10px;
                        line-height: 1.5;
                    }
                    .task-meta {
                        display: flex;
                        gap: 10px;
                        flex-wrap: wrap;
                        margin-bottom: 10px;
                    }
                    .badge {
                        display: inline-block;
                        padding: 4px 10px;
                        border-radius: 6px;
                        font-size: 12px;
                        font-weight: 600;
                    }
                    .status-completed { background: #d1fae5; color: #065f46; }
                    .status-pending { background: #fef3c7; color: #92400e; }
                    .priority-high { background: #fee2e2; color: #991b1b; }
                    .priority-medium { background: #fef3c7; color: #92400e; }
                    .priority-low { background: #d1fae5; color: #065f46; }
                    .tag { background: #e0e7ff; color: #3730a3; }
                    .subtasks {
                        margin-top: 10px;
                        padding: 10px;
                        background: #f9fafb;
                        border-radius: 6px;
                    }
                    .subtask-item {
                        margin: 4px 0;
                        font-size: 14px;
                    }
                    .notes {
                        margin-top: 10px;
                        padding: 10px;
                        background: #fffbeb;
                        border-left: 3px solid #f59e0b;
                        font-size: 14px;
                        white-space: pre-wrap;
                    }
                    @media print {
                        body { padding: 10px; }
                        .task { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <h1>📋 Tasks Export</h1>
                <p><strong>Exported on:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Total Tasks:</strong> ${sortedTasks.length}</p>
                <hr style="margin: 20px 0;">
                ${sortedTasks.map(task => `
                    <div class="task">
                        <div class="task-title">${task.title}</div>
                        ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                        <div class="task-meta">
                            <span class="badge status-${task.status}">${task.status === 'completed' ? '✓ Completed' : '○ Pending'}</span>
                            <span class="badge priority-${task.priority}">${task.priority === 'high' ? '🔴 High' : task.priority === 'medium' ? '🟡 Medium' : '🟢 Low'}</span>
                            ${task.dueDate ? `<span class="badge">📅 ${new Date(task.dueDate).toLocaleDateString()}</span>` : ''}
                            ${task.tags && task.tags.length > 0 ? task.tags.map(tag => `<span class="badge tag">${tag}</span>`).join('') : ''}
                        </div>
                        ${task.subtasks && task.subtasks.length > 0 ? `
                            <div class="subtasks">
                                <strong>Subtasks (${task.subtasks.filter(s => s.completed).length}/${task.subtasks.length}):</strong>
                                ${task.subtasks.map(s => `<div class="subtask-item">${s.completed ? '✓' : '○'} ${s.text}</div>`).join('')}
                            </div>
                        ` : ''}
                        ${task.notes ? `<div class="notes"><strong>📝 Notes:</strong><br>${task.notes}</div>` : ''}
                        <div style="margin-top: 10px; font-size: 12px; color: #999;">
                            Created: ${new Date(task.createdAt).toLocaleString()}
                        </div>
                    </div>
                `).join('')}
            </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Wait for content to load, then print
        printWindow.onload = () => {
            printWindow.print();
            // Close window after printing (or if user cancels)
            setTimeout(() => {
                printWindow.close();
            }, 100);
        };

        showToast('Opening print dialog...', 'success');
    };

    const saveAsTemplate = async () => {
        if (!templateName.trim()) {
            showToast('Please enter a template name', 'error');
            return;
        }

        try {
            await createTemplate({
                name: templateName,
                title,
                description,
                priority,
                tags,
                subtasks: [],
                notes: ''
            });
            setTemplateName('');
            fetchTemplates();
            showToast('Template saved!', 'success');
        } catch (err) {
            console.error('Error saving template:', err);
            showToast('Failed to save template', 'error');
        }
    };

    const loadTemplate = (template) => {
        setTitle(template.title);
        setDescription(template.description);
        setPriority(template.priority);
        setTags(template.tags);
        setShowTemplates(false);
        setShowForm(true);
        showToast(`Template "${template.name}" loaded!`, 'success');
    };

    const handleDeleteTemplate = async (id, name) => {
        if (!confirm(`Delete template "${name}"?`)) return;

        try {
            await deleteTemplate(id);
            fetchTemplates();
            showToast('Template deleted!', 'success');
        } catch (err) {
            console.error('Error deleting template:', err);
            showToast('Failed to delete template', 'error');
        }
    };

    // Comment functions
    const handleAddComment = async (taskId) => {
        if (!newComment.trim()) return;

        try {
            await addComment(taskId, newComment);
            setNewComment('');
            fetchTasks();
            showToast('Comment added!', 'success');
        } catch (err) {
            console.error('Error adding comment:', err);
            showToast('Failed to add comment', 'error');
        }
    };

    const handleDeleteComment = async (taskId, commentId) => {
        if (!confirm('Delete this comment?')) return;

        try {
            await deleteComment(taskId, commentId);
            fetchTasks();
            showToast('Comment deleted!', 'success');
        } catch (err) {
            console.error('Error deleting comment:', err);
            showToast('Failed to delete comment', 'error');
        }
    };

    const groupTasksByDate = (tasks) => {
        const grouped = {};
        const completedTasks = tasks.filter(t => t.status === 'completed');
        
        completedTasks.forEach(task => {
            const date = new Date(task.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(task);
        });
        
        return grouped;
    };

    const getHistoryStats = () => {
        const completedTasks = allTasks.filter(t => t.status === 'completed');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const thisWeek = new Date(today);
        thisWeek.setDate(today.getDate() - 7);
        
        const thisMonth = new Date(today);
        thisMonth.setDate(1);
        
        return {
            total: completedTasks.length,
            today: completedTasks.filter(t => {
                const taskDate = new Date(t.updatedAt);
                taskDate.setHours(0, 0, 0, 0);
                return taskDate.getTime() === today.getTime();
            }).length,
            thisWeek: completedTasks.filter(t => new Date(t.updatedAt) >= thisWeek).length,
            thisMonth: completedTasks.filter(t => new Date(t.updatedAt) >= thisMonth).length
        };
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this task?')) return;
        
        try {
            await deleteTask(id);
            fetchTasks();
            showToast('Task deleted successfully', 'success');
        } catch (err) {
            console.error('Error deleting task:', err);
            showToast('Failed to delete task', 'error');
        }
    };

    const stats = {
        total: allTasks.length,
        pending: allTasks.filter(t => t.status === 'pending').length,
        completed: allTasks.filter(t => t.status === 'completed').length
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: colors.bg,
            transition: 'background 0.3s ease'
        }}>
            {/* Toast Notification */}
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
                        }}>TasQ</h1>
                        <p style={{
                            color: colors.textSecondary,
                            fontSize: '14px'
                        }}>Hello, {user?.name}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{
                            display: 'flex',
                            gap: '8px',
                            padding: '6px 12px',
                            background: colors.bg,
                            border: `1px solid ${colors.border}`,
                            borderRadius: '8px',
                            fontSize: '12px',
                            color: colors.textSecondary
                        }}>
                            <span><kbd style={{
                                padding: '2px 6px',
                                background: colors.card,
                                border: `1px solid ${colors.border}`,
                                borderRadius: '4px',
                                fontFamily: 'monospace',
                                fontSize: '11px'
                            }}>N</kbd> New</span>
                            <span><kbd style={{
                                padding: '2px 6px',
                                background: colors.card,
                                border: `1px solid ${colors.border}`,
                                borderRadius: '4px',
                                fontFamily: 'monospace',
                                fontSize: '11px'
                            }}>/</kbd> Search</span>
                            <span><kbd style={{
                                padding: '2px 6px',
                                background: colors.card,
                                border: `1px solid ${colors.border}`,
                                borderRadius: '4px',
                                fontFamily: 'monospace',
                                fontSize: '11px'
                            }}>Esc</kbd> Close</span>
                        </div>
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
                                gap: '0.5rem',
                                color: colors.text
                            }}
                        >
                            {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <button
                            onClick={() => navigate('/profile')}
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
                            <User size={16} /> Profile
                        </button>
                        <button
                            onClick={() => navigate('/analytics')}
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
                            <BarChart3 size={16} /> Analytics
                        </button>
                        <button 
                            onClick={logout}
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
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '32px 20px'
            }}>
                {/* Stats */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    marginBottom: '32px'
                }}>
                    <div style={{
                        background: colors.card,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '12px',
                        padding: '20px',
                        transition: 'all 0.3s ease'
                    }}>
                        <div style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '8px', fontWeight: '500' }}>Total</div>
                        <div style={{ fontSize: '32px', fontWeight: '600', color: colors.text }}>
                            <AnimatedCounter value={stats.total} />
                        </div>
                    </div>
                    <div style={{
                        background: colors.card,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '12px',
                        padding: '20px',
                        transition: 'all 0.3s ease'
                    }}>
                        <div style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '8px', fontWeight: '500' }}>Pending</div>
                        <div style={{ fontSize: '32px', fontWeight: '600', color: colors.warning }}>
                            <AnimatedCounter value={stats.pending} />
                        </div>
                    </div>
                    <div style={{
                        background: colors.card,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '12px',
                        padding: '20px',
                        transition: 'all 0.3s ease'
                    }}>
                        <div style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '8px', fontWeight: '500' }}>Completed</div>
                        <div style={{ fontSize: '32px', fontWeight: '600', color: colors.success }}>
                            <AnimatedCounter value={stats.completed} />
                        </div>
                    </div>
                </div>

                {/* Add Task Button */}
                {!showForm && (
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => setShowForm(true)}
                            style={{
                                flex: 1,
                                minWidth: '200px',
                                padding: '16px',
                                background: colors.primary,
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '15px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.background = colors.primaryHover}
                            onMouseOut={(e) => e.target.style.background = colors.primary}
                        >
                            + New Task
                        </button>
                        <button
                            onClick={exportToCSV}
                            disabled={sortedTasks.length === 0}
                            className="dashboard-icon-button"
                            style={{
                                padding: '16px 24px',
                                background: sortedTasks.length === 0 ? colors.border : colors.bg,
                                color: sortedTasks.length === 0 ? colors.textSecondary : colors.text,
                                border: `1px solid ${colors.border}`,
                                borderRadius: '12px',
                                fontSize: '15px',
                                fontWeight: '600',
                                cursor: sortedTasks.length === 0 ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Download size={16} /> Export CSV
                        </button>
                        <button
                            onClick={exportToPDF}
                            disabled={sortedTasks.length === 0}
                            className="dashboard-icon-button"
                            style={{
                                padding: '16px 24px',
                                background: sortedTasks.length === 0 ? colors.border : colors.bg,
                                color: sortedTasks.length === 0 ? colors.textSecondary : colors.text,
                                border: `1px solid ${colors.border}`,
                                borderRadius: '12px',
                                fontSize: '15px',
                                fontWeight: '600',
                                cursor: sortedTasks.length === 0 ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <FileText size={16} /> Export PDF
                        </button>
                        <button
                            onClick={() => setShowTemplates(!showTemplates)}
                            className="dashboard-icon-button"
                            style={{
                                padding: '16px 24px',
                                background: showTemplates ? colors.primary : colors.bg,
                                color: showTemplates ? 'white' : colors.text,
                                border: `1px solid ${showTemplates ? colors.primary : colors.border}`,
                                borderRadius: '12px',
                                fontSize: '15px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            📋 Templates ({templates.length})
                        </button>
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="dashboard-icon-button"
                            style={{
                                padding: '16px 24px',
                                background: showHistory ? colors.primary : colors.bg,
                                color: showHistory ? 'white' : colors.text,
                                border: `1px solid ${showHistory ? colors.primary : colors.border}`,
                                borderRadius: '12px',
                                fontSize: '15px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <History size={16} /> History
                        </button>
                    </div>
                )}

                {/* Templates Section */}
                {showTemplates && (
                    <div style={{
                        background: colors.card,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '12px',
                        padding: '24px',
                        marginBottom: '24px',
                        transition: 'all 0.3s ease'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px'
                        }}>
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: colors.text
                            }}>📋 Task Templates</h3>
                            <button
                                onClick={() => setShowTemplates(false)}
                                style={{
                                    padding: '6px 12px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: colors.textSecondary,
                                    cursor: 'pointer',
                                    fontSize: '20px'
                                }}
                            >×</button>
                        </div>
                        {templates.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '32px',
                                color: colors.textSecondary
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
                                <p>No templates yet. Create a task and save it as a template!</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {templates.map(template => (
                                    <div key={template._id} style={{
                                        background: colors.bg,
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: '8px',
                                        padding: '16px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                fontSize: '15px',
                                                fontWeight: '600',
                                                color: colors.text,
                                                marginBottom: '4px'
                                            }}>{template.name}</div>
                                            <div style={{
                                                fontSize: '13px',
                                                color: colors.textSecondary,
                                                marginBottom: '8px'
                                            }}>{template.title}</div>
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                <span style={{
                                                    fontSize: '11px',
                                                    padding: '3px 8px',
                                                    background: template.priority === 'high' ? 'rgba(239, 68, 68, 0.1)' : 
                                                               template.priority === 'medium' ? 'rgba(245, 158, 11, 0.1)' : 
                                                               'rgba(16, 185, 129, 0.1)',
                                                    color: template.priority === 'high' ? colors.danger : 
                                                           template.priority === 'medium' ? colors.warning : 
                                                           colors.success,
                                                    borderRadius: '4px',
                                                    fontWeight: '600'
                                                }}>
                                                    {template.priority}
                                                </span>
                                                {template.tags && template.tags.map(tag => (
                                                    <span key={tag} style={{
                                                        fontSize: '11px',
                                                        padding: '3px 8px',
                                                        background: getTagColor(tag),
                                                        color: 'white',
                                                        borderRadius: '4px',
                                                        fontWeight: '600'
                                                    }}>{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => loadTemplate(template)}
                                                style={{
                                                    padding: '8px 16px',
                                                    background: colors.primary,
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => e.target.style.opacity = '0.8'}
                                                onMouseOut={(e) => e.target.style.opacity = '1'}
                                            >Use</button>
                                            <button
                                                onClick={() => handleDeleteTemplate(template._id, template.name)}
                                                style={{
                                                    padding: '8px 12px',
                                                    background: 'transparent',
                                                    border: `1px solid ${colors.border}`,
                                                    color: colors.danger,
                                                    borderRadius: '6px',
                                                    fontSize: '13px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.target.style.background = colors.danger;
                                                    e.target.style.color = 'white';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.target.style.background = 'transparent';
                                                    e.target.style.color = colors.danger;
                                                }}
                                            >🗑</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* History Section */}
                {showHistory && (
                    <div style={{
                        background: colors.card,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '12px',
                        padding: '24px',
                        marginBottom: '24px',
                        transition: 'all 0.3s ease'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px'
                        }}>
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: colors.text
                            }}>📜 Task History</h3>
                            <button
                                onClick={() => setShowHistory(false)}
                                style={{
                                    padding: '6px 12px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: colors.textSecondary,
                                    cursor: 'pointer',
                                    fontSize: '20px'
                                }}
                            >×</button>
                        </div>

                        {/* History Stats */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: '12px',
                            marginBottom: '24px'
                        }}>
                            {[
                                { label: 'Total', value: getHistoryStats().total, color: colors.primary },
                                { label: 'Today', value: getHistoryStats().today, color: colors.success },
                                { label: 'This Week', value: getHistoryStats().thisWeek, color: colors.warning },
                                { label: 'This Month', value: getHistoryStats().thisMonth, color: '#8b5cf6' }
                            ].map(stat => (
                                <div key={stat.label} style={{
                                    background: colors.bg,
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: '8px',
                                    padding: '16px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{
                                        fontSize: '24px',
                                        fontWeight: '700',
                                        color: stat.color,
                                        marginBottom: '4px'
                                    }}>{stat.value}</div>
                                    <div style={{
                                        fontSize: '12px',
                                        color: colors.textSecondary,
                                        fontWeight: '500'
                                    }}>{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Timeline */}
                        {Object.keys(groupTasksByDate(allTasks)).length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '48px 20px',
                                color: colors.textSecondary
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📜</div>
                                <p>No completed tasks yet. Complete some tasks to see your history!</p>
                            </div>
                        ) : (
                            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                {Object.entries(groupTasksByDate(allTasks))
                                    .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
                                    .map(([date, tasks]) => (
                                        <div key={date} style={{ marginBottom: '24px' }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                marginBottom: '12px'
                                            }}>
                                                <div style={{
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    color: colors.text,
                                                    background: colors.bg,
                                                    padding: '6px 12px',
                                                    borderRadius: '6px',
                                                    border: `1px solid ${colors.border}`
                                                }}>{date}</div>
                                                <div style={{
                                                    fontSize: '12px',
                                                    color: colors.textSecondary,
                                                    fontWeight: '500'
                                                }}>{tasks.length} task{tasks.length !== 1 ? 's' : ''}</div>
                                            </div>
                                            <div style={{ display: 'grid', gap: '8px', paddingLeft: '12px' }}>
                                                {tasks.map(task => (
                                                    <div key={task._id} style={{
                                                        background: colors.bg,
                                                        border: `1px solid ${colors.border}`,
                                                        borderRadius: '8px',
                                                        padding: '12px',
                                                        borderLeft: `3px solid ${colors.success}`
                                                    }}>
                                                        <div style={{
                                                            fontSize: '14px',
                                                            fontWeight: '500',
                                                            color: colors.text,
                                                            marginBottom: '4px'
                                                        }}>✓ {task.title}</div>
                                                        {task.description && (
                                                            <div style={{
                                                                fontSize: '12px',
                                                                color: colors.textSecondary,
                                                                marginBottom: '8px'
                                                            }}>{task.description}</div>
                                                        )}
                                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                            <span style={{
                                                                fontSize: '11px',
                                                                padding: '3px 8px',
                                                                background: task.priority === 'high' ? 'rgba(239, 68, 68, 0.1)' : 
                                                                           task.priority === 'medium' ? 'rgba(245, 158, 11, 0.1)' : 
                                                                           'rgba(16, 185, 129, 0.1)',
                                                                color: task.priority === 'high' ? colors.danger : 
                                                                       task.priority === 'medium' ? colors.warning : 
                                                                       colors.success,
                                                                borderRadius: '4px',
                                                                fontWeight: '600'
                                                            }}>
                                                                {task.priority}
                                                            </span>
                                                            {task.tags && task.tags.map(tag => (
                                                                <span key={tag} style={{
                                                                    fontSize: '11px',
                                                                    padding: '3px 8px',
                                                                    background: getTagColor(tag),
                                                                    color: 'white',
                                                                    borderRadius: '4px',
                                                                    fontWeight: '600'
                                                                }}>{tag}</span>
                                                            ))}
                                                            <span style={{
                                                                fontSize: '11px',
                                                                padding: '3px 8px',
                                                                color: colors.textSecondary,
                                                                fontStyle: 'italic'
                                                            }}>
                                                                {new Date(task.updatedAt).toLocaleTimeString('en-US', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Search Bar */}
                <div style={{
                    background: colors.card,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '24px',
                    transition: 'all 0.3s ease'
                }}>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ 
                            position: 'relative', 
                            flex: 1, 
                            minWidth: '200px',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <Search 
                                size={18} 
                                style={{ 
                                    position: 'absolute', 
                                    left: '12px', 
                                    color: colors.textSecondary,
                                    pointerEvents: 'none'
                                }} 
                            />
                            <input
                                type="text"
                                placeholder="Search tasks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px 12px 40px',
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
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{
                                padding: '12px 16px',
                                border: `1px solid ${colors.border}`,
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                background: colors.bg,
                                color: colors.text,
                                cursor: 'pointer',
                                fontWeight: '500',
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = colors.primary}
                            onBlur={(e) => e.target.style.borderColor = colors.border}
                        >
                            <option value="date-desc">Newest First</option>
                            <option value="date-asc">Oldest First</option>
                            <option value="priority">Priority (High to Low)</option>
                            <option value="status">Status (Pending First)</option>
                            <option value="dueDate">Due Date (Soonest First)</option>
                            <option value="custom">Custom Order (Drag & Drop)</option>
                        </select>
                        {/* View Mode Toggle */}
                        <div style={{
                            display: 'flex',
                            gap: '4px',
                            background: colors.bg,
                            border: `1px solid ${colors.border}`,
                            borderRadius: '8px',
                            padding: '4px'
                        }}>
                            <button
                                onClick={() => setViewMode('list')}
                                style={{
                                    padding: '8px 12px',
                                    background: viewMode === 'list' ? colors.primary : 'transparent',
                                    color: viewMode === 'list' ? 'white' : colors.text,
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <List size={16} />
                                List
                            </button>
                            <button
                                onClick={() => setViewMode('board')}
                                style={{
                                    padding: '8px 12px',
                                    background: viewMode === 'board' ? colors.primary : 'transparent',
                                    color: viewMode === 'board' ? 'white' : colors.text,
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <LayoutGrid size={16} />
                                Board
                            </button>
                        </div>
                        {sortBy === 'custom' && (
                            <div style={{
                                padding: '8px 12px',
                                background: colors.primary + '20',
                                border: `1px solid ${colors.primary}`,
                                borderRadius: '8px',
                                fontSize: '12px',
                                color: colors.primary,
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                ✋ Drag to reorder
                            </div>
                        )}
                    </div>
                </div>

                {/* Create Task Form */}
                {showForm && (
                    <div style={{
                        background: colors.card,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '12px',
                        padding: '24px',
                        marginBottom: '24px',
                        transition: 'all 0.3s ease'
                    }}>
                        <form onSubmit={handleCreate}>
                            <input
                                type="text"
                                placeholder="Task title..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                autoFocus
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: '8px',
                                    fontSize: '15px',
                                    marginBottom: '12px',
                                    outline: 'none',
                                    background: colors.bg,
                                    color: colors.text,
                                    transition: 'all 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = colors.primary}
                                onBlur={(e) => e.target.style.borderColor = colors.border}
                            />
                            <textarea
                                placeholder="Description (optional)..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="3"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: '8px',
                                    fontSize: '15px',
                                    marginBottom: '12px',
                                    outline: 'none',
                                    resize: 'vertical',
                                    fontFamily: 'inherit',
                                    background: colors.bg,
                                    color: colors.text,
                                    transition: 'all 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = colors.primary}
                                onBlur={(e) => e.target.style.borderColor = colors.border}
                            />
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: colors.text
                                }}>Priority</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {[
                                        { value: 'low', label: 'Low', color: colors.success },
                                        { value: 'medium', label: 'Medium', color: colors.warning },
                                        { value: 'high', label: 'High', color: colors.danger }
                                    ].map(({ value, label, color }) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setPriority(value)}
                                            style={{
                                                flex: 1,
                                                padding: '10px',
                                                background: priority === value ? color : colors.bg,
                                                color: priority === value ? 'white' : colors.text,
                                                border: `1px solid ${priority === value ? color : colors.border}`,
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: colors.text
                                }}>Due Date (optional)</label>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
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
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: colors.text
                                }}>Tags (optional)</label>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {availableTags.map(tag => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => toggleTag(tag)}
                                            style={{
                                                padding: '8px 16px',
                                                background: tags.includes(tag) ? getTagColor(tag) : colors.bg,
                                                color: tags.includes(tag) ? 'white' : colors.text,
                                                border: `1px solid ${tags.includes(tag) ? getTagColor(tag) : colors.border}`,
                                                borderRadius: '20px',
                                                fontSize: '13px',
                                                fontWeight: '500',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: colors.text,
                                    cursor: 'pointer',
                                    marginBottom: '8px'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={isRecurring}
                                        onChange={(e) => setIsRecurring(e.target.checked)}
                                        style={{
                                            width: '18px',
                                            height: '18px',
                                            cursor: 'pointer'
                                        }}
                                    />
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Repeat size={16} />
                                        Recurring Task
                                    </span>
                                </label>
                                {isRecurring && (
                                    <select
                                        value={recurringPattern}
                                        onChange={(e) => setRecurringPattern(e.target.value)}
                                        required={isRecurring}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: '8px',
                                            fontSize: '15px',
                                            outline: 'none',
                                            background: colors.bg,
                                            color: colors.text,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = colors.primary}
                                        onBlur={(e) => e.target.style.borderColor = colors.border}
                                    >
                                        <option value="">Select frequency...</option>
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                    </select>
                                )}
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: colors.text,
                                    cursor: 'pointer',
                                    marginBottom: '8px'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={reminderEnabled}
                                        onChange={(e) => setReminderEnabled(e.target.checked)}
                                        style={{
                                            width: '18px',
                                            height: '18px',
                                            cursor: 'pointer'
                                        }}
                                    />
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Bell size={16} />
                                        Set Reminder
                                    </span>
                                </label>
                                {reminderEnabled && (
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontSize: '13px',
                                            color: colors.textSecondary
                                        }}>Remind me at:</label>
                                        <input
                                            type="datetime-local"
                                            value={reminderDate}
                                            onChange={(e) => setReminderDate(e.target.value)}
                                            required={reminderEnabled}
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
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: loading ? colors.border : colors.primary,
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => !loading && (e.target.style.background = colors.primaryHover)}
                                    onMouseOut={(e) => !loading && (e.target.style.background = colors.primary)}
                                >
                                    {loading ? 'Adding...' : 'Add Task'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setTitle('');
                                        setDescription('');
                                        setPriority('medium');
                                    }}
                                    style={{
                                        padding: '12px 24px',
                                        background: colors.bg,
                                        border: `1px solid ${colors.border}`,
                                        color: colors.text,
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => e.target.style.background = colors.cardHover}
                                    onMouseOut={(e) => e.target.style.background = colors.bg}
                                >
                                    Cancel
                                </button>
                            </div>
                            {title && (
                                <div style={{
                                    marginTop: '12px',
                                    padding: '12px',
                                    background: colors.bg,
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: '8px'
                                }}>
                                    <div style={{
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        color: colors.text,
                                        marginBottom: '8px'
                                    }}>💾 Save as Template</div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="text"
                                            placeholder="Template name..."
                                            value={templateName}
                                            onChange={(e) => setTemplateName(e.target.value)}
                                            style={{
                                                flex: 1,
                                                padding: '8px 12px',
                                                border: `1px solid ${colors.border}`,
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                outline: 'none',
                                                background: colors.card,
                                                color: colors.text
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={saveAsTemplate}
                                            disabled={!templateName.trim()}
                                            style={{
                                                padding: '8px 16px',
                                                background: templateName.trim() ? colors.success : colors.border,
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                cursor: templateName.trim() ? 'pointer' : 'not-allowed',
                                                transition: 'all 0.2s'
                                            }}
                                        >Save</button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                )}

                {/* Quick Filters & Saved Views */}
                <div style={{ marginBottom: '20px' }}>
                    <div style={{
                        fontSize: '13px',
                        fontWeight: '500',
                        color: colors.textSecondary,
                        marginBottom: '8px'
                    }}>Quick Filters</div>
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        marginBottom: '16px',
                        flexWrap: 'wrap'
                    }}>
                        {[
                            { label: 'Today', value: 'today', icon: <Calendar size={14} /> },
                            { label: 'This Week', value: 'week', icon: <Calendar size={14} /> },
                            { label: 'Overdue', value: 'overdue', icon: <AlertCircle size={14} /> },
                            { label: 'Urgent', value: 'urgent', icon: <AlertCircle size={14} /> },
                            { label: 'Completed Today', value: 'completed-today', icon: <CheckCircle2 size={14} /> }
                        ].map(({ label, value, icon }) => (
                            <button
                                key={value}
                                onClick={() => applyQuickFilter(value)}
                                style={{
                                    padding: '8px 16px',
                                    background: quickFilter === value ? colors.primary : colors.bg,
                                    color: quickFilter === value ? 'white' : colors.text,
                                    border: `1px solid ${quickFilter === value ? colors.primary : colors.border}`,
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                {icon}
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Saved Views */}
                    {savedViews.length > 0 && (
                        <>
                            <div style={{
                                fontSize: '13px',
                                fontWeight: '500',
                                color: colors.textSecondary,
                                marginBottom: '8px',
                                marginTop: '16px'
                            }}>Saved Views</div>
                            <div style={{
                                display: 'flex',
                                gap: '8px',
                                marginBottom: '16px',
                                flexWrap: 'wrap'
                            }}>
                                {savedViews.map(view => (
                                    <div key={view.id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '8px 12px',
                                        background: colors.bg,
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: '8px'
                                    }}>
                                        <button
                                            onClick={() => loadSavedView(view)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: colors.text,
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                cursor: 'pointer',
                                                padding: '0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <Bookmark size={14} />
                                            {view.name}
                                        </button>
                                        <button
                                            onClick={() => deleteSavedView(view.id, view.name)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: colors.textSecondary,
                                                cursor: 'pointer',
                                                padding: '4px',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Save Current View Button */}
                    {(filter || priorityFilter || tagFilter) && !showSaveView && (
                        <button
                            onClick={() => setShowSaveView(true)}
                            style={{
                                padding: '8px 16px',
                                background: colors.success,
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                marginBottom: '16px'
                            }}
                        >
                            <Save size={14} />
                            Save Current View
                        </button>
                    )}

                    {/* Save View Form */}
                    {showSaveView && (
                        <div style={{
                            background: colors.card,
                            border: `1px solid ${colors.border}`,
                            borderRadius: '8px',
                            padding: '16px',
                            marginBottom: '16px'
                        }}>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: colors.text,
                                marginBottom: '12px'
                            }}>Save View</div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    placeholder="View name..."
                                    value={viewName}
                                    onChange={(e) => setViewName(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && saveCurrentView()}
                                    style={{
                                        flex: 1,
                                        padding: '8px 12px',
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        background: colors.bg,
                                        color: colors.text
                                    }}
                                    autoFocus
                                />
                                <button
                                    onClick={saveCurrentView}
                                    style={{
                                        padding: '8px 16px',
                                        background: colors.success,
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => {
                                        setShowSaveView(false);
                                        setViewName('');
                                    }}
                                    style={{
                                        padding: '8px 16px',
                                        background: colors.bg,
                                        border: `1px solid ${colors.border}`,
                                        color: colors.text,
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Filter */}
                <div style={{ marginBottom: '20px' }}>
                    <div style={{
                        fontSize: '13px',
                        fontWeight: '500',
                        color: colors.textSecondary,
                        marginBottom: '8px'
                    }}>Status</div>
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        marginBottom: '16px',
                        flexWrap: 'wrap'
                    }}>
                        {[
                            { label: 'All', value: '' },
                            { label: 'To Do', value: 'pending' },
                            { label: 'In Progress', value: 'in-progress' },
                            { label: 'Completed', value: 'completed' }
                        ].map(({ label, value }) => (
                            <button
                                key={value}
                                onClick={() => setFilter(value)}
                                style={{
                                    padding: '8px 16px',
                                    background: filter === value ? colors.primary : colors.bg,
                                    color: filter === value ? 'white' : colors.text,
                                    border: `1px solid ${filter === value ? colors.primary : colors.border}`,
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <div style={{
                        fontSize: '13px',
                        fontWeight: '500',
                        color: colors.textSecondary,
                        marginBottom: '8px'
                    }}>Priority</div>
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap'
                    }}>
                        {[
                            { label: 'All', value: '', icon: null, color: null },
                            { label: 'High', value: 'high', icon: <AlertCircle size={14} />, color: colors.danger },
                            { label: 'Medium', value: 'medium', icon: <AlertCircle size={14} />, color: colors.warning },
                            { label: 'Low', value: 'low', icon: <AlertCircle size={14} />, color: colors.success }
                        ].map(({ label, value, icon, color }) => (
                            <button
                                key={value}
                                onClick={() => setPriorityFilter(value)}
                                style={{
                                    padding: '8px 16px',
                                    background: priorityFilter === value ? (color || colors.primary) : colors.bg,
                                    color: priorityFilter === value ? 'white' : colors.text,
                                    border: `1px solid ${priorityFilter === value ? (color || colors.primary) : colors.border}`,
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                {icon && <span style={{ color: priorityFilter === value ? 'white' : color }}>{icon}</span>}
                                {label}
                            </button>
                        ))}
                    </div>
                    <div style={{
                        fontSize: '13px',
                        fontWeight: '500',
                        color: colors.textSecondary,
                        marginBottom: '8px',
                        marginTop: '16px'
                    }}>Tags</div>
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap'
                    }}>
                        <button
                            onClick={() => setTagFilter('')}
                            style={{
                                padding: '8px 16px',
                                background: tagFilter === '' ? colors.primary : colors.bg,
                                color: tagFilter === '' ? 'white' : colors.text,
                                border: `1px solid ${tagFilter === '' ? colors.primary : colors.border}`,
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            All
                        </button>
                        {availableTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setTagFilter(tag)}
                                style={{
                                    padding: '8px 16px',
                                    background: tagFilter === tag ? getTagColor(tag) : colors.bg,
                                    color: tagFilter === tag ? 'white' : colors.text,
                                    border: `1px solid ${tagFilter === tag ? getTagColor(tag) : colors.border}`,
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bulk Actions */}
                {sortedTasks.length > 0 && (
                    <div style={{
                        background: colors.card,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '20px',
                        transition: 'all 0.3s ease'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            flexWrap: 'wrap'
                        }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: colors.text
                            }}>
                                <input
                                    type="checkbox"
                                    checked={selectedTasks.length === sortedTasks.length && sortedTasks.length > 0}
                                    onChange={toggleSelectAll}
                                    style={{
                                        width: '18px',
                                        height: '18px',
                                        cursor: 'pointer'
                                    }}
                                />
                                Select All ({selectedTasks.length} selected)
                            </label>
                            {selectedTasks.length > 0 && (
                                <>
                                    <div style={{
                                        width: '1px',
                                        height: '24px',
                                        background: colors.border
                                    }} />
                                    <button
                                        onClick={handleBulkComplete}
                                        style={{
                                            padding: '8px 16px',
                                            background: colors.success,
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => e.target.style.opacity = '0.8'}
                                        onMouseOut={(e) => e.target.style.opacity = '1'}
                                    >
                                        ✓ Complete All
                                    </button>
                                    <button
                                        onClick={handleBulkPending}
                                        style={{
                                            padding: '8px 16px',
                                            background: colors.warning,
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => e.target.style.opacity = '0.8'}
                                        onMouseOut={(e) => e.target.style.opacity = '1'}
                                    >
                                        ↻ Mark Pending
                                    </button>
                                    <button
                                        onClick={handleBulkDelete}
                                        style={{
                                            padding: '8px 16px',
                                            background: colors.danger,
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => e.target.style.opacity = '0.8'}
                                        onMouseOut={(e) => e.target.style.opacity = '1'}
                                    >
                                        🗑 Delete All
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Task List */}
                <div style={{ display: 'grid', gap: '12px' }}>
                    {initialLoading ? (
                        // Show skeletons while loading
                        <>
                            <TaskSkeleton />
                            <TaskSkeleton />
                            <TaskSkeleton />
                        </>
                    ) : sortedTasks.length === 0 ? (
                        <div style={{
                            background: colors.card,
                            border: `1px solid ${colors.border}`,
                            borderRadius: '12px',
                            padding: '48px 20px',
                            textAlign: 'center',
                            transition: 'all 0.3s ease'
                        }}>
                            <div style={{ 
                                fontSize: '48px', 
                                marginBottom: '16px',
                                color: colors.textSecondary 
                            }}>
                                {searchQuery ? <Search size={48} /> : <Plus size={48} />}
                            </div>
                            <p style={{ color: colors.textSecondary, fontSize: '15px' }}>
                                {searchQuery ? 'No tasks found matching your search' : 'No tasks yet. Create your first one!'}
                            </p>
                        </div>
                    ) : viewMode === 'board' ? (
                        /* Kanban Board View */
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '20px',
                            marginBottom: '24px'
                        }}>
                            {['pending', 'in-progress', 'completed'].map(status => {
                                const columnTasks = sortedTasks.filter(t => t.status === status);
                                const columnConfig = {
                                    'pending': { title: 'To Do', icon: <Circle size={18} />, color: colors.textSecondary },
                                    'in-progress': { title: 'In Progress', icon: <Clock size={18} />, color: colors.warning },
                                    'completed': { title: 'Done', icon: <CheckCircle2 size={18} />, color: colors.success }
                                };
                                const config = columnConfig[status];
                                
                                return (
                                    <div
                                        key={status}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={async (e) => {
                                            e.preventDefault();
                                            const taskId = e.dataTransfer.getData('taskId');
                                            if (taskId) {
                                                try {
                                                    await updateTask(taskId, { status });
                                                    fetchTasks();
                                                    showToast(`Task moved to ${config.title}`, 'success');
                                                } catch (err) {
                                                    showToast('Failed to move task', 'error');
                                                }
                                            }
                                        }}
                                        style={{
                                            background: colors.card,
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: '12px',
                                            padding: '16px',
                                            minHeight: '500px'
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            marginBottom: '16px',
                                            paddingBottom: '12px',
                                            borderBottom: `2px solid ${colors.border}`
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                color: config.color
                                            }}>
                                                {config.icon}
                                                {config.title}
                                            </div>
                                            <div style={{
                                                background: colors.bg,
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                color: colors.textSecondary
                                            }}>
                                                {columnTasks.length}
                                            </div>
                                        </div>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {columnTasks.map(task => (
                                                <div
                                                    key={task._id}
                                                    draggable
                                                    onDragStart={(e) => {
                                                        e.dataTransfer.setData('taskId', task._id);
                                                        e.currentTarget.style.opacity = '0.5';
                                                    }}
                                                    onDragEnd={(e) => {
                                                        e.currentTarget.style.opacity = '1';
                                                    }}
                                                    style={{
                                                        background: colors.bg,
                                                        border: `1px solid ${colors.border}`,
                                                        borderRadius: '8px',
                                                        padding: '12px',
                                                        cursor: 'grab',
                                                        transition: 'all 0.2s',
                                                        borderLeft: `3px solid ${
                                                            task.priority === 'high' ? colors.danger :
                                                            task.priority === 'medium' ? colors.warning :
                                                            colors.success
                                                        }`
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                                >
                                                    <div style={{
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        color: colors.text,
                                                        marginBottom: '8px',
                                                        wordBreak: 'break-word'
                                                    }}>
                                                        {task.title}
                                                    </div>
                                                    {task.description && (
                                                        <div style={{
                                                            fontSize: '12px',
                                                            color: colors.textSecondary,
                                                            marginBottom: '8px',
                                                            lineHeight: '1.4'
                                                        }}>
                                                            {task.description.length > 80 
                                                                ? task.description.substring(0, 80) + '...' 
                                                                : task.description}
                                                        </div>
                                                    )}
                                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                                        <span style={{
                                                            fontSize: '11px',
                                                            padding: '3px 8px',
                                                            background: task.priority === 'high' ? 'rgba(239, 68, 68, 0.1)' : 
                                                                       task.priority === 'medium' ? 'rgba(245, 158, 11, 0.1)' : 
                                                                       'rgba(16, 185, 129, 0.1)',
                                                            color: task.priority === 'high' ? colors.danger : 
                                                                   task.priority === 'medium' ? colors.warning : 
                                                                   colors.success,
                                                            borderRadius: '4px',
                                                            fontWeight: '600'
                                                        }}>
                                                            {task.priority}
                                                        </span>
                                                        {task.dueDate && (
                                                            <span style={{
                                                                fontSize: '11px',
                                                                padding: '3px 8px',
                                                                background: isOverdue(task.dueDate) && task.status !== 'completed' ? 
                                                                           'rgba(239, 68, 68, 0.1)' : 
                                                                           'rgba(99, 102, 241, 0.1)',
                                                                color: isOverdue(task.dueDate) && task.status !== 'completed' ? 
                                                                       colors.danger : 
                                                                       colors.primary,
                                                                borderRadius: '4px',
                                                                fontWeight: '600',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '4px'
                                                            }}>
                                                                <Calendar size={10} />
                                                                {formatDate(task.dueDate)}
                                                            </span>
                                                        )}
                                                        {task.tags && task.tags.slice(0, 2).map(tag => (
                                                            <span key={tag} style={{
                                                                fontSize: '11px',
                                                                padding: '3px 8px',
                                                                background: getTagColor(tag),
                                                                color: 'white',
                                                                borderRadius: '4px',
                                                                fontWeight: '600'
                                                            }}>
                                                                {tag}
                                                            </span>
                                                        ))}
                                                        {task.tags && task.tags.length > 2 && (
                                                            <span style={{
                                                                fontSize: '11px',
                                                                padding: '3px 8px',
                                                                color: colors.textSecondary,
                                                                fontWeight: '600'
                                                            }}>
                                                                +{task.tags.length - 2}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {task.subtasks && task.subtasks.length > 0 && (
                                                        <div style={{
                                                            fontSize: '11px',
                                                            color: colors.textSecondary,
                                                            marginBottom: '8px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                        }}>
                                                            <CheckCircle2 size={12} />
                                                            {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks
                                                        </div>
                                                    )}
                                                    <div style={{
                                                        display: 'flex',
                                                        gap: '8px',
                                                        marginTop: '8px',
                                                        paddingTop: '8px',
                                                        borderTop: `1px solid ${colors.border}`
                                                    }}>
                                                        <button
                                                            onClick={() => handleEdit(task)}
                                                            style={{
                                                                flex: 1,
                                                                padding: '6px',
                                                                background: colors.primary,
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                fontSize: '12px',
                                                                fontWeight: '500',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(task._id)}
                                                            style={{
                                                                flex: 1,
                                                                padding: '6px',
                                                                background: colors.danger,
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                fontSize: '12px',
                                                                fontWeight: '500',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        sortedTasks.map((task) => (
                            <div
                                key={task._id}
                                draggable={sortBy === 'custom'}
                                onDragStart={(e) => handleDragStart(e, task)}
                                onDragEnd={handleDragEnd}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, task)}
                                style={{
                                    background: colors.card,
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: '12px',
                                    padding: '20px',
                                    transition: 'all 0.2s',
                                    cursor: sortBy === 'custom' ? 'move' : 'default'
                                }}
                            >
                                {editingTask === task._id ? (
                                    // Edit Form
                                    <form onSubmit={handleUpdate}>
                                        <input
                                            type="text"
                                            placeholder="Task title..."
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            required
                                            autoFocus
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                border: `1px solid ${colors.border}`,
                                                borderRadius: '8px',
                                                fontSize: '15px',
                                                marginBottom: '12px',
                                                outline: 'none',
                                                background: colors.bg,
                                                color: colors.text,
                                                transition: 'all 0.2s'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = colors.primary}
                                            onBlur={(e) => e.target.style.borderColor = colors.border}
                                        />
                                        <textarea
                                            placeholder="Description (optional)..."
                                            value={editDescription}
                                            onChange={(e) => setEditDescription(e.target.value)}
                                            rows="3"
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                border: `1px solid ${colors.border}`,
                                                borderRadius: '8px',
                                                fontSize: '15px',
                                                marginBottom: '12px',
                                                outline: 'none',
                                                resize: 'vertical',
                                                fontFamily: 'inherit',
                                                background: colors.bg,
                                                color: colors.text,
                                                transition: 'all 0.2s'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = colors.primary}
                                            onBlur={(e) => e.target.style.borderColor = colors.border}
                                        />
                                        <div style={{ marginBottom: '12px' }}>
                                            <label style={{
                                                display: 'block',
                                                marginBottom: '8px',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: colors.text
                                            }}>Priority</label>
                                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                                {[
                                                    { value: 'low', label: 'Low', color: colors.success },
                                                    { value: 'medium', label: 'Medium', color: colors.warning },
                                                    { value: 'high', label: 'High', color: colors.danger }
                                                ].map(({ value, label, color }) => (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        onClick={() => setEditPriority(value)}
                                                        style={{
                                                            flex: 1,
                                                            padding: '10px',
                                                            background: editPriority === value ? color : colors.bg,
                                                            color: editPriority === value ? 'white' : colors.text,
                                                            border: `1px solid ${editPriority === value ? color : colors.border}`,
                                                            borderRadius: '8px',
                                                            fontSize: '14px',
                                                            fontWeight: '500',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                            <label style={{
                                                display: 'block',
                                                marginBottom: '8px',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: colors.text
                                            }}>Status</label>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {[
                                                    { value: 'pending', label: 'Pending' },
                                                    { value: 'completed', label: 'Completed' }
                                                ].map(({ value, label }) => (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        onClick={() => setEditStatus(value)}
                                                        style={{
                                                            flex: 1,
                                                            padding: '10px',
                                                            background: editStatus === value ? colors.primary : colors.bg,
                                                            color: editStatus === value ? 'white' : colors.text,
                                                            border: `1px solid ${editStatus === value ? colors.primary : colors.border}`,
                                                            borderRadius: '8px',
                                                            fontSize: '14px',
                                                            fontWeight: '500',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: '12px' }}>
                                            <label style={{
                                                display: 'block',
                                                marginBottom: '8px',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: colors.text
                                            }}>Due Date (optional)</label>
                                            <input
                                                type="date"
                                                value={editDueDate}
                                                onChange={(e) => setEditDueDate(e.target.value)}
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
                                        <div style={{ marginBottom: '12px' }}>
                                            <label style={{
                                                display: 'block',
                                                marginBottom: '8px',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: colors.text
                                            }}>Tags (optional)</label>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                {availableTags.map(tag => (
                                                    <button
                                                        key={tag}
                                                        type="button"
                                                        onClick={() => toggleTag(tag, true)}
                                                        style={{
                                                            padding: '8px 16px',
                                                            background: editTags.includes(tag) ? getTagColor(tag) : colors.bg,
                                                            color: editTags.includes(tag) ? 'white' : colors.text,
                                                            border: `1px solid ${editTags.includes(tag) ? getTagColor(tag) : colors.border}`,
                                                            borderRadius: '20px',
                                                            fontSize: '13px',
                                                            fontWeight: '500',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        {tag}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: '12px' }}>
                                            <label style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: colors.text,
                                                cursor: 'pointer',
                                                marginBottom: '8px'
                                            }}>
                                                <input
                                                    type="checkbox"
                                                    checked={editIsRecurring}
                                                    onChange={(e) => setEditIsRecurring(e.target.checked)}
                                                    style={{
                                                        width: '18px',
                                                        height: '18px',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Repeat size={16} />
                                                    Recurring Task
                                                </span>
                                            </label>
                                            {editIsRecurring && (
                                                <select
                                                    value={editRecurringPattern}
                                                    onChange={(e) => setEditRecurringPattern(e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px 16px',
                                                        border: `1px solid ${colors.border}`,
                                                        borderRadius: '8px',
                                                        fontSize: '15px',
                                                        outline: 'none',
                                                        background: colors.bg,
                                                        color: colors.text,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onFocus={(e) => e.target.style.borderColor = colors.primary}
                                                    onBlur={(e) => e.target.style.borderColor = colors.border}
                                                >
                                                    <option value="">Select frequency...</option>
                                                    <option value="daily">Daily</option>
                                                    <option value="weekly">Weekly</option>
                                                    <option value="monthly">Monthly</option>
                                                </select>
                                            )}
                                        </div>
                                        <div style={{ marginBottom: '12px' }}>
                                            <label style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: colors.text,
                                                cursor: 'pointer',
                                                marginBottom: '8px'
                                            }}>
                                                <input
                                                    type="checkbox"
                                                    checked={editReminderEnabled}
                                                    onChange={(e) => setEditReminderEnabled(e.target.checked)}
                                                    style={{
                                                        width: '18px',
                                                        height: '18px',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Bell size={16} />
                                                    Set Reminder
                                                </span>
                                            </label>
                                            {editReminderEnabled && (
                                                <div>
                                                    <label style={{
                                                        display: 'block',
                                                        marginBottom: '8px',
                                                        fontSize: '13px',
                                                        color: colors.textSecondary
                                                    }}>Remind me at:</label>
                                                    <input
                                                        type="datetime-local"
                                                        value={editReminderDate}
                                                        onChange={(e) => setEditReminderDate(e.target.value)}
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
                                            )}
                                        </div>
                                        <div style={{ marginBottom: '12px' }}>
                                            <label style={{
                                                display: 'block',
                                                marginBottom: '8px',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: colors.text
                                            }}>Subtasks</label>
                                            <div style={{ marginBottom: '8px' }}>
                                                {editSubtasks.map((subtask, index) => (
                                                    <div key={index} style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        padding: '8px',
                                                        background: colors.bg,
                                                        borderRadius: '6px',
                                                        marginBottom: '6px'
                                                    }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={subtask.completed}
                                                            onChange={() => toggleSubtask(index)}
                                                            style={{ cursor: 'pointer' }}
                                                        />
                                                        <span style={{
                                                            flex: 1,
                                                            textDecoration: subtask.completed ? 'line-through' : 'none',
                                                            color: subtask.completed ? colors.textSecondary : colors.text,
                                                            fontSize: '14px'
                                                        }}>{subtask.text}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSubtask(index)}
                                                            style={{
                                                                padding: '4px 8px',
                                                                background: 'transparent',
                                                                border: 'none',
                                                                color: colors.danger,
                                                                cursor: 'pointer',
                                                                fontSize: '16px'
                                                            }}
                                                        >×</button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <input
                                                    type="text"
                                                    placeholder="Add subtask..."
                                                    value={newSubtask}
                                                    onChange={(e) => setNewSubtask(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                                                    style={{
                                                        flex: 1,
                                                        padding: '8px 12px',
                                                        border: `1px solid ${colors.border}`,
                                                        borderRadius: '6px',
                                                        fontSize: '14px',
                                                        outline: 'none',
                                                        background: colors.bg,
                                                        color: colors.text
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={addSubtask}
                                                    style={{
                                                        padding: '8px 16px',
                                                        background: colors.primary,
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        fontSize: '14px',
                                                        fontWeight: '500',
                                                        cursor: 'pointer'
                                                    }}
                                                >+</button>
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: '12px' }}>
                                            <label style={{
                                                display: 'block',
                                                marginBottom: '8px',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: colors.text
                                            }}>Notes (optional)</label>
                                            <textarea
                                                placeholder="Add detailed notes, links, or additional information..."
                                                value={editNotes}
                                                onChange={(e) => setEditNotes(e.target.value)}
                                                rows="4"
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px',
                                                    border: `1px solid ${colors.border}`,
                                                    borderRadius: '8px',
                                                    fontSize: '14px',
                                                    outline: 'none',
                                                    resize: 'vertical',
                                                    fontFamily: 'inherit',
                                                    background: colors.bg,
                                                    color: colors.text,
                                                    transition: 'all 0.2s'
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = colors.primary}
                                                onBlur={(e) => e.target.style.borderColor = colors.border}
                                            />
                                        </div>

                                        {/* Comments Section */}
                                        <div style={{ marginBottom: '16px' }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                marginBottom: '12px'
                                            }}>
                                                <label style={{
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    color: colors.text,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}>
                                                    <MessageCircle size={16} />
                                                    Comments ({task.comments?.length || 0})
                                                </label>
                                            </div>

                                            {/* Comment List */}
                                            {task.comments && task.comments.length > 0 && (
                                                <div style={{
                                                    maxHeight: '200px',
                                                    overflowY: 'auto',
                                                    marginBottom: '12px',
                                                    padding: '8px',
                                                    background: colors.bg,
                                                    borderRadius: '8px',
                                                    border: `1px solid ${colors.border}`
                                                }}>
                                                    {task.comments.map((comment) => (
                                                        <div
                                                            key={comment._id}
                                                            style={{
                                                                padding: '12px',
                                                                marginBottom: '8px',
                                                                background: colors.card,
                                                                borderRadius: '6px',
                                                                border: `1px solid ${colors.border}`
                                                            }}
                                                        >
                                                            <div style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'flex-start',
                                                                marginBottom: '6px'
                                                            }}>
                                                                <div style={{
                                                                    fontSize: '12px',
                                                                    fontWeight: '600',
                                                                    color: colors.primary
                                                                }}>
                                                                    {comment.author}
                                                                </div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <div style={{
                                                                        fontSize: '11px',
                                                                        color: colors.textSecondary
                                                                    }}>
                                                                        {new Date(comment.createdAt).toLocaleString('en-US', {
                                                                            month: 'short',
                                                                            day: 'numeric',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })}
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDeleteComment(task._id, comment._id)}
                                                                        style={{
                                                                            background: 'none',
                                                                            border: 'none',
                                                                            color: colors.danger,
                                                                            cursor: 'pointer',
                                                                            padding: '2px',
                                                                            display: 'flex',
                                                                            alignItems: 'center'
                                                                        }}
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div style={{
                                                                fontSize: '13px',
                                                                color: colors.text,
                                                                lineHeight: '1.5',
                                                                wordBreak: 'break-word'
                                                            }}>
                                                                {comment.text}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Add Comment */}
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <input
                                                    type="text"
                                                    placeholder="Add a comment..."
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            handleAddComment(task._id);
                                                        }
                                                    }}
                                                    style={{
                                                        flex: 1,
                                                        padding: '10px 14px',
                                                        border: `1px solid ${colors.border}`,
                                                        borderRadius: '8px',
                                                        fontSize: '14px',
                                                        outline: 'none',
                                                        background: colors.bg,
                                                        color: colors.text,
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onFocus={(e) => e.target.style.borderColor = colors.primary}
                                                    onBlur={(e) => e.target.style.borderColor = colors.border}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddComment(task._id)}
                                                    disabled={!newComment.trim()}
                                                    style={{
                                                        padding: '10px 16px',
                                                        background: newComment.trim() ? colors.primary : colors.border,
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        fontSize: '14px',
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    <Send size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button 
                                                type="submit" 
                                                disabled={loading}
                                                style={{
                                                    flex: 1,
                                                    padding: '12px',
                                                    background: loading ? colors.border : colors.primary,
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    cursor: loading ? 'not-allowed' : 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => !loading && (e.target.style.background = colors.primaryHover)}
                                                onMouseOut={(e) => !loading && (e.target.style.background = colors.primary)}
                                            >
                                                {loading ? 'Saving...' : 'Save Changes'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCancelEdit}
                                                style={{
                                                    padding: '12px 24px',
                                                    background: colors.bg,
                                                    border: `1px solid ${colors.border}`,
                                                    color: colors.text,
                                                    borderRadius: '8px',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => e.target.style.background = colors.cardHover}
                                                onMouseOut={(e) => e.target.style.background = colors.bg}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    // Normal View
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        gap: '16px'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '12px',
                                            flex: 1,
                                            minWidth: 0
                                        }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedTasks.includes(task._id)}
                                                onChange={() => toggleTaskSelection(task._id)}
                                                onClick={(e) => e.stopPropagation()}
                                                style={{
                                                    width: '18px',
                                                    height: '18px',
                                                    cursor: 'pointer',
                                                    marginTop: '2px',
                                                    flexShrink: 0
                                                }}
                                            />
                                            <div 
                                                style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                                                onClick={() => handleEdit(task)}
                                            >
                                            <h4 style={{
                                                fontSize: '16px',
                                                fontWeight: '500',
                                                marginBottom: '6px',
                                                color: task.status === 'completed' ? colors.textSecondary : colors.text,
                                                textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                                                wordBreak: 'break-word'
                                            }}>
                                                {task.title}
                                            </h4>
                                            {task.description && (
                                                <p style={{
                                                    color: colors.textSecondary,
                                                    fontSize: '14px',
                                                    marginBottom: '12px',
                                                    lineHeight: '1.5',
                                                    wordBreak: 'break-word'
                                                }}>{task.description}</p>
                                            )}
                                            {task.subtasks && task.subtasks.length > 0 && (
                                                <div style={{ marginBottom: '12px' }}>
                                                    <div style={{
                                                        fontSize: '12px',
                                                        color: colors.textSecondary,
                                                        marginBottom: '6px',
                                                        fontWeight: '500'
                                                    }}>
                                                        Subtasks: {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                                                    </div>
                                                    {task.subtasks.slice(0, 3).map((subtask, idx) => (
                                                        <div key={idx} style={{
                                                            fontSize: '13px',
                                                            color: subtask.completed ? colors.textSecondary : colors.text,
                                                            textDecoration: subtask.completed ? 'line-through' : 'none',
                                                            marginBottom: '4px'
                                                        }}>
                                                            {subtask.completed ? '✓' : '○'} {subtask.text}
                                                        </div>
                                                    ))}
                                                    {task.subtasks.length > 3 && (
                                                        <div style={{
                                                            fontSize: '12px',
                                                            color: colors.textSecondary,
                                                            fontStyle: 'italic'
                                                        }}>
                                                            +{task.subtasks.length - 3} more...
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {task.notes && (
                                                <div style={{
                                                    marginBottom: '12px',
                                                    padding: '12px',
                                                    background: colors.bg,
                                                    borderRadius: '8px',
                                                    border: `1px solid ${colors.border}`
                                                }}>
                                                    <div style={{
                                                        fontSize: '12px',
                                                        color: colors.textSecondary,
                                                        marginBottom: '6px',
                                                        fontWeight: '500'
                                                    }}>
                                                        📝 Notes
                                                    </div>
                                                    <div style={{
                                                        fontSize: '13px',
                                                        color: colors.text,
                                                        lineHeight: '1.6',
                                                        whiteSpace: 'pre-wrap',
                                                        wordBreak: 'break-word'
                                                    }}>
                                                        {task.notes}
                                                    </div>
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '4px 10px',
                                                    background: task.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                    color: task.status === 'completed' ? colors.success : colors.warning,
                                                    borderRadius: '6px',
                                                    fontSize: '12px',
                                                    fontWeight: '600'
                                                }}>
                                                    {task.status === 'completed' ? '✓ Done' : '○ Pending'}
                                                </span>
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '4px 10px',
                                                    background: task.priority === 'high' ? 'rgba(239, 68, 68, 0.1)' : 
                                                               task.priority === 'medium' ? 'rgba(245, 158, 11, 0.1)' : 
                                                               'rgba(16, 185, 129, 0.1)',
                                                    color: task.priority === 'high' ? colors.danger : 
                                                           task.priority === 'medium' ? colors.warning : 
                                                           colors.success,
                                                    borderRadius: '6px',
                                                    fontSize: '12px',
                                                    fontWeight: '600'
                                                }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <AlertCircle size={14} />
                                                        {task.priority === 'high' ? 'High' : 
                                                         task.priority === 'medium' ? 'Medium' : 
                                                         'Low'}
                                                    </span>
                                                </span>
                                                {task.dueDate && (
                                                    <span style={{
                                                        display: 'inline-block',
                                                        padding: '4px 10px',
                                                        background: isOverdue(task.dueDate) && task.status === 'pending' ? 
                                                                   'rgba(239, 68, 68, 0.1)' : 
                                                                   'rgba(99, 102, 241, 0.1)',
                                                        color: isOverdue(task.dueDate) && task.status === 'pending' ? 
                                                               colors.danger : 
                                                               colors.primary,
                                                        borderRadius: '6px',
                                                        fontSize: '12px',
                                                        fontWeight: '600'
                                                    }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <Calendar size={14} />
                                                            {formatDate(task.dueDate)}
                                                        </span>
                                                    </span>
                                                )}
                                                {task.isRecurring && (
                                                    <span style={{
                                                        display: 'inline-block',
                                                        padding: '4px 10px',
                                                        background: 'rgba(139, 92, 246, 0.1)',
                                                        color: '#8b5cf6',
                                                        borderRadius: '6px',
                                                        fontSize: '12px',
                                                        fontWeight: '600'
                                                    }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <Repeat size={14} />
                                                            {task.recurringPattern.charAt(0).toUpperCase() + task.recurringPattern.slice(1)}
                                                        </span>
                                                    </span>
                                                )}
                                                {task.reminderEnabled && !task.reminderSent && (
                                                    <span style={{
                                                        display: 'inline-block',
                                                        padding: '4px 10px',
                                                        background: 'rgba(251, 191, 36, 0.1)',
                                                        color: '#f59e0b',
                                                        borderRadius: '6px',
                                                        fontSize: '12px',
                                                        fontWeight: '600'
                                                    }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <Bell size={14} />
                                                            {new Date(task.reminderDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </span>
                                                )}
                                                {task.tags && task.tags.map(tag => (
                                                    <span
                                                        key={tag}
                                                        style={{
                                                            display: 'inline-block',
                                                            padding: '4px 10px',
                                                            background: getTagColor(tag),
                                                            color: 'white',
                                                            borderRadius: '12px',
                                                            fontSize: '11px',
                                                            fontWeight: '600'
                                                        }}
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            gap: '8px',
                                            flexShrink: 0
                                        }}>
                                            <button
                                                onClick={() => handleToggle(task)}
                                                style={{
                                                    padding: '8px 12px',
                                                    background: colors.bg,
                                                    border: `1px solid ${colors.border}`,
                                                    color: colors.text,
                                                    borderRadius: '6px',
                                                    fontSize: '14px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => e.target.style.background = colors.cardHover}
                                                onMouseOut={(e) => e.target.style.background = colors.bg}
                                            >
                                                {task.status === 'pending' ? '✓' : '↻'}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(task._id)}
                                                style={{
                                                    padding: '8px 12px',
                                                    background: colors.bg,
                                                    border: `1px solid ${colors.border}`,
                                                    color: colors.danger,
                                                    borderRadius: '6px',
                                                    fontSize: '14px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.target.style.background = colors.danger;
                                                    e.target.style.color = 'white';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.target.style.background = colors.bg;
                                                    e.target.style.color = colors.danger;
                                                }}
                                            >
                                                🗑
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
