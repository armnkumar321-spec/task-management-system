import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import taskService from '../services/taskService';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';

const validateField = (name, value, badInput = false) => {
  if (name === 'title') {
    if (!value.trim()) return 'Task title is required';
    if (value.trim().length > 120) return 'Task title must be 120 characters or fewer';
  }

  if (name === 'description' && value.trim().length > 2000) {
    return 'Description must be 2,000 characters or fewer';
  }

  if (name === 'dueDate') {
    if (badInput) return 'Enter a valid due date';
    if (value) {
      const date = new Date(`${value}T00:00:00Z`);
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
        value.startsWith('0000-') ||
        Number.isNaN(date.getTime()) ||
        date.toISOString().slice(0, 10) !== value
      ) {
        return 'Enter a valid due date';
      }
    }
  }

  return '';
};

export const TaskForm = ({ initialData = null, onSubmit, isSubmitting = false }) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    status: initialData?.status || 'TODO',
    priority: initialData?.priority || 'MEDIUM',
    dueDate: initialData?.dueDate ? initialData.dueDate.slice(0, 10) : '',
    assignedTo: initialData?.assignedTo?._id || initialData?.assignedTo || '',
  });

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // If admin, load eligible users for assignment
    if (isAdmin) {
      const loadUsers = async () => {
        try {
          setUsersLoading(true);
          const userList = await taskService.getUsers();
          setUsers(userList);
        } catch (err) {
          console.error('Failed to load eligible assignees:', err);
        } finally {
          setUsersLoading(false);
        }
      };
      loadUsers();
    }
  }, [isAdmin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    const error = validateField(name, value, e.target.validity?.badInput);
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      if (error) next[name] = error;
      else delete next[name];
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setServerError('');

    const validationErrors = {};
    for (const name of ['title', 'description', 'dueDate']) {
      const input = e.currentTarget.elements.namedItem(name);
      const error = validateField(name, formData[name], input.validity?.badInput);
      if (error) validationErrors[name] = error;
    }
    setErrors(validationErrors);
    const firstInvalidField = Object.keys(validationErrors)[0];
    if (firstInvalidField) {
      e.currentTarget.elements.namedItem(firstInvalidField).focus();
      return;
    }

    // ISSUE 5: Complete Admin task assignment functionality
    // Include assignedTo in submission payload if admin
    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      status: formData.status,
      priority: formData.priority,
      dueDate: formData.dueDate || null,
    };

    if (isAdmin) {
      payload.assignedTo = formData.assignedTo || null;
    }

    try {
      await onSubmit(payload);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to save task');
    }
  };

  return (
    <div className="form-card">
      {serverError && (
        <div role="alert" className="form-error-text" style={{ marginBottom: '1.25rem', padding: '0.75rem', backgroundColor: 'var(--danger-bg)', borderRadius: '6px' }}>
          <AlertCircle size={16} />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Title Input */}
        <div className="form-group">
          <label className="form-label" htmlFor="title">
            Task Title <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className={`form-input${errors.title ? ' error' : ''}`}
            required
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? 'title-error' : undefined}
            placeholder="e.g. Implement user authentication flow"
            value={formData.title}
            onChange={handleChange}
          />
          {errors.title && <p id="title-error" role="alert" className="form-error-text">{errors.title}</p>}
        </div>

        {/* Description Textarea */}
        <div className="form-group">
          <label className="form-label" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className={`form-textarea${errors.description ? ' error' : ''}`}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? 'description-error' : undefined}
            placeholder="Provide context, acceptance criteria, or requirements..."
            value={formData.description}
            onChange={handleChange}
          />
          {errors.description && <p id="description-error" role="alert" className="form-error-text">{errors.description}</p>}
        </div>

        {/* Status and Priority Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              className="form-select"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="priority">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              className="form-select"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </div>

        {/* Due Date & Assignee (Admin only) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="dueDate">
              Due Date
            </label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              className={`form-input${errors.dueDate ? ' error' : ''}`}
              aria-invalid={Boolean(errors.dueDate)}
              aria-describedby={errors.dueDate ? 'dueDate-error' : undefined}
              value={formData.dueDate}
              onChange={handleChange}
            />
            {errors.dueDate && <p id="dueDate-error" role="alert" className="form-error-text">{errors.dueDate}</p>}
          </div>

          {isAdmin && (
            <div className="form-group">
              <label className="form-label" htmlFor="assignedTo">
                Assignee (Admin Only)
              </label>
              <select
                id="assignedTo"
                name="assignedTo"
                className="form-select"
                value={formData.assignedTo}
                onChange={handleChange}
                disabled={usersLoading}
              >
                <option value="">-- Unassigned --</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/tasks')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : initialData ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
