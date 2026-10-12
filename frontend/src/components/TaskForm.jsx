import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import taskService from '../services/taskService';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';

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

  // -------------------------------------------------------------
  // ISSUE 4 (TODO for Contributor): Add client-side validation state
  // Currently, validation error messages state is omitted.
  // -------------------------------------------------------------
  // const [errors, setErrors] = useState({});

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // -------------------------------------------------------------
    // ISSUE 4 (TODO for Contributor): Add client-side task form validation
    // BUG / LIMITATION:
    // Missing validation before submission:
    // 1. Title is required and cannot be only whitespace.
    // 2. Description length must be checked (< 2000 characters).
    // 3. Due date should be a valid date if provided.
    // 4. Form should show clear inline error messages and stop submission.
    // -------------------------------------------------------------

    // ISSUE 5: Complete Admin task assignment functionality
    // Include assignedTo in submission payload if admin
    const payload = {
      title: formData.title,
      description: formData.description,
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
        <div className="form-error-text" style={{ marginBottom: '1.25rem', padding: '0.75rem', backgroundColor: 'var(--danger-bg)', borderRadius: '6px' }}>
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
            className="form-input"
            placeholder="e.g. Implement user authentication flow"
            value={formData.title}
            onChange={handleChange}
          />
          {/* FIXME (Issue 4): Render inline validation error for title here */}
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
            className="form-textarea"
            placeholder="Provide context, acceptance criteria, or requirements..."
            value={formData.description}
            onChange={handleChange}
          />
          {/* FIXME (Issue 4): Render inline validation error for description here */}
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
              className="form-input"
              value={formData.dueDate}
              onChange={handleChange}
            />
            {/* FIXME (Issue 4): Render inline validation error for dueDate here */}
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
