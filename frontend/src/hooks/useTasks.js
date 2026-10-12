import { useState, useEffect, useMemo, useCallback } from 'react';
import taskService from '../services/taskService';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  /**
   * Filtered tasks computation
   * 
   * NOTE TO CONTRIBUTORS:
   * Several filter features are intentionally left incomplete for Assignment 4 issues.
   */
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // -------------------------------------------------------------
      // ISSUE 1 (TODO for Contributor): Task Search by Title and Description
      // BUG: Currently searchQuery is accepted by the UI, but this filter
      // always evaluates to true, ignoring user input.
      // -------------------------------------------------------------
      const matchesSearch = true; // FIXME: Check if task.title or task.description includes searchQuery (case-insensitive)

      const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;

      // -------------------------------------------------------------
      // ISSUE 3 (TODO for Contributor): Priority Filter
      // BUG: The priority filter dropdown changes state, but this check
      // always evaluates to true instead of matching task.priority === priorityFilter.
      // -------------------------------------------------------------
      const matchesPriority = true; // FIXME: When priorityFilter !== 'ALL', match task.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  return {
    tasks,
    filteredTasks,
    loading,
    error,
    refreshTasks: fetchTasks,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
  };
};

export default useTasks;
