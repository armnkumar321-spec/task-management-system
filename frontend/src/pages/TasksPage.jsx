import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../hooks/useTasks';
import TaskFilters from '../components/TaskFilters';
import TaskTable from '../components/TaskTable';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import taskService from '../services/taskService';
import { Plus } from 'lucide-react';

export const TasksPage = () => {
  const { isAdmin } = useAuth();
  const {
    filteredTasks,
    loading,
    error,
    refreshTasks,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
  } = useTasks();

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, taskId: null });
  // Current page state for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [prevFilterState, setPrevFilterState] = useState({
    searchQuery,
    statusFilter,
    priorityFilter,
  });

  // Reset to page 1 whenever search query or filters change
  if (
    prevFilterState.searchQuery !== searchQuery ||
    prevFilterState.statusFilter !== statusFilter ||
    prevFilterState.priorityFilter !== priorityFilter
  ) {
    setPrevFilterState({ searchQuery, statusFilter, priorityFilter });
    setCurrentPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / pageSize));
  // Adjust currentPage if task count decreases and currentPage exceeds totalPages
  if (currentPage > totalPages) {
    setCurrentPage(totalPages);
  }

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.updateStatus(taskId, newStatus);
      refreshTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task status');
    }
  };

  const handleDeletePrompt = (taskId) => {
    setDeleteModal({ isOpen: true, taskId });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.taskId) return;
    try {
      await taskService.deleteTask(deleteModal.taskId);
      setDeleteModal({ isOpen: false, taskId: null });
      refreshTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  /**
   * ISSUE 6: Add pagination to the task list
   * Compute slice boundaries for the current page.
   */
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const displayedTasks = filteredTasks.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page) => {
    const targetPage = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(targetPage);
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Task Directory</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Search, filter, inspect, and update project tasks.
          </p>
        </div>
        {isAdmin && (
          <Link to="/tasks/create" className="btn btn-primary btn-sm">
            <Plus size={16} />
            <span>Create Task</span>
          </Link>
        )}
      </div>

      {/* Search and Filters Bar (Issues 1, 2, 3) */}
      <TaskFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
      />

      {loading ? (
        <p style={{ color: 'var(--text-muted)', padding: '2rem 0' }}>Loading tasks...</p>
      ) : error ? (
        <div style={{ color: 'var(--danger-text)', padding: '1rem', backgroundColor: 'var(--danger-bg)', borderRadius: '8px' }}>
          {error}
        </div>
      ) : displayedTasks.length === 0 ? (
        <div className="table-container empty-state">
          <h3>No matching tasks found</h3>
          <p>Try adjusting your search criteria or filter selections.</p>
        </div>
      ) : (
        <>
          <TaskTable
            tasks={displayedTasks}
            onStatusChange={handleStatusChange}
            onDeleteTask={handleDeletePrompt}
          />

          {/* Pagination Bar (Issue 6) */}
          <Pagination
            currentPage={safeCurrentPage}
            totalItems={filteredTasks.length}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, taskId: null })}
      />
    </div>
  );
};

export default TasksPage;

