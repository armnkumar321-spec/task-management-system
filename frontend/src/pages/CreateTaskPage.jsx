import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskForm from '../components/TaskForm';
import taskService from '../services/taskService';
import { ArrowLeft } from 'lucide-react';

export const CreateTaskPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateTask = async (payload) => {
    setIsSubmitting(true);
    try {
      await taskService.createTask(payload);
      navigate('/tasks');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Create New Task</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Assign tasks to team members and set priorities and deadlines.
        </p>
      </div>

      <TaskForm onSubmit={handleCreateTask} isSubmitting={isSubmitting} />
    </div>
  );
};

export default CreateTaskPage;
