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
    const query = searchQuery.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        !query ||
        (task.title || '').toLowerCase().includes(query) ||
        (task.description || '').toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;

      // -------------------------------------------------------------
      // ISSUE 3 — Priority Filter (FIXED)
      // When priorityFilter is 'ALL' every task passes; otherwise only tasks
      // whose priority exactly matches the selected value are shown.
      // Optional chaining guards against tasks with a missing/null priority.
      // -------------------------------------------------------------
      const matchesPriority =
        priorityFilter === 'ALL' || (task.priority ?? null) === priorityFilter;

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
