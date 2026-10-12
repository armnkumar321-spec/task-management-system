import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import taskService from '../services/taskService';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../components/Badge';
import ConfirmModal from '../components/ConfirmModal';
import { ArrowLeft, Edit3, Trash2, Calendar, UserCheck, UserPlus, Clock } from 'lucide-react';

export const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await taskService.getTaskById(id);
        setTask(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load task details');
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      const updated = await taskService.updateStatus(id, newStatus);
      setTask(updated);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await taskService.deleteTask(id);
      navigate('/tasks');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not specified';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="page-container">
        <p style={{ color: 'var(--text-muted)' }}>Loading task details...</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="page-container">
        <button onClick={() => navigate('/tasks')} className="btn btn-secondary btn-sm" style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Tasks</span>
        </button>
        <div style={{ padding: '1.5rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', borderRadius: '8px' }}>
          <h3>Unable to load task</h3>
          <p>{error || 'Task not found or access restricted.'}</p>
        </div>
      </div>
    );
  }

  const canUpdateStatus = isAdmin || (task.assignedTo && task.assignedTo._id === user?.id);

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <button onClick={() => navigate('/tasks')} className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} />
          <span>Back to Tasks</span>
        </button>

        {isAdmin && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to={`/tasks/edit/${task._id}`} className="btn btn-secondary btn-sm">
              <Edit3 size={15} />
              <span>Edit</span>
            </Link>
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="btn btn-danger btn-sm"
              disabled={isDeleting}
            >
              <Trash2 size={15} />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      <div className="form-card" style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>

        <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
          {task.title}
        </h1>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
            Description
          </h3>
          <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: task.description ? 'var(--text-main)' : 'var(--text-muted)' }}>
            {task.description || 'No description provided for this task.'}
          </p>
        </div>

        {/* Quick status change section */}
        {canUpdateStatus && (
          <div style={{ backgroundColor: 'var(--bg-app)', padding: '1rem 1.25rem', borderRadius: '8px', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Update Status</span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Change task workflow phase</p>
            </div>
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="filter-select"
              style={{ minWidth: '150px' }}
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '1.5rem 0' }} />

        {/* Metadata Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
              <UserCheck size={14} />
              <span>Assigned To</span>
            </div>
            <strong style={{ fontSize: '0.9375rem' }}>
              {task.assignedTo?.name
                ? `${task.assignedTo.name}${task.assignedTo.email ? ` (${task.assignedTo.email})` : ''}`
                : 'Unassigned'}
            </strong>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
              <Calendar size={14} />
              <span>Due Date</span>
            </div>
            <strong style={{ fontSize: '0.9375rem' }}>{formatDate(task.dueDate)}</strong>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
              <UserPlus size={14} />
              <span>Created By</span>
            </div>
            <strong style={{ fontSize: '0.9375rem' }}>{task.createdBy?.name || 'Administrator'}</strong>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
              <Clock size={14} />
              <span>Created At</span>
            </div>
            <strong style={{ fontSize: '0.9375rem' }}>{formatDate(task.createdAt)}</strong>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};

export default TaskDetailPage;
