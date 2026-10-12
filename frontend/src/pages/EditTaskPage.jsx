import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TaskForm from '../components/TaskForm';
import taskService from '../services/taskService';
import { ArrowLeft } from 'lucide-react';

export const EditTaskPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const data = await taskService.getTaskById(id);
        setTask(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load task for editing');
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  const handleUpdateTask = async (payload) => {
    setIsSubmitting(true);
    try {
      await taskService.updateTask(id, payload);
      navigate('/tasks');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <p style={{ color: 'var(--text-muted)' }}>Loading task for editing...</p>
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
          <h3>Unable to edit task</h3>
          <p>{error || 'Task not found or access restricted.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div style={{ maxWidth: '680px', margin: '0 auto 1.25rem' }}>
        <button
          onClick={() => navigate('/tasks')}
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: '1rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Tasks</span>
        </button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Edit Task</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Update task details, assignment, status, or deadlines.
        </p>
      </div>

      <TaskForm
        initialData={task}
        onSubmit={handleUpdateTask}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default EditTaskPage;
