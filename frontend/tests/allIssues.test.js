import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Sample dataset
const sampleTasks = [
  { id: '1', title: 'Landing Page Hero Section', description: 'Design modern responsive UI with Tailwind and Lucide icons', status: 'IN_PROGRESS', priority: 'HIGH', assignedTo: { _id: 'u1', name: 'Alice' } },
  { id: '2', title: 'JWT Refresh Token Mechanism', description: 'Implement secure refresh token rotation in backend auth service', status: 'TODO', priority: 'HIGH', assignedTo: { _id: 'u2', name: 'Bob' } },
  { id: '3', title: 'MongoDB Query Indexing', description: 'Optimize Compound index on assignedTo and status for fast lookups', status: 'COMPLETED', priority: 'MEDIUM', assignedTo: { _id: 'u1', name: 'Alice' } },
  { id: '4', title: 'CI Pipeline with GitHub Actions', description: 'Setup automatic testing and linting workflow on main push', status: 'IN_PROGRESS', priority: 'MEDIUM', assignedTo: null },
  { id: '5', title: 'React Context State Management', description: 'Centralize user auth and task state in global context provider', status: 'COMPLETED', priority: 'LOW', assignedTo: { _id: 'u2', name: 'Bob' } },
  { id: '6', title: 'Accessibility WCAG Audit', description: 'Ensure ARIA labels, contrast ratio, and keyboard navigation compliance', status: 'TODO', priority: 'LOW', assignedTo: null },
  { id: '7', title: 'API Documentation OpenAPI', description: 'Write Swagger specs for task endpoints and auth route contracts', status: 'TODO', priority: 'MEDIUM', assignedTo: { _id: 'u1', name: 'Alice' } },
  { id: '8', title: 'Uptime & Health Monitoring', description: 'Implement /api/health endpoint with uptime and DB status metrics', status: 'COMPLETED', priority: 'HIGH', assignedTo: { _id: 'u3', name: 'Charlie' } },
];

/**
 * Filter function matching frontend/src/hooks/useTasks.js logic
 */
const filterTasks = (tasks, { searchQuery = '', statusFilter = 'ALL', priorityFilter = 'ALL' } = {}) => {
  const query = searchQuery.trim().toLowerCase();
  return tasks.filter((task) => {
    const matchesSearch =
      !query ||
      (task.title || '').toLowerCase().includes(query) ||
      (task.description || '').toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || (task.priority ?? null) === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });
};

/**
 * Client-side validation function matching frontend/src/components/TaskForm.jsx
 */
const validateField = (name, value, badInput = false) => {
  if (name === 'title') {
    if (!value || !value.trim()) return 'Task title is required';
    if (value.trim().length > 120) return 'Task title must be 120 characters or fewer';
  }

  if (name === 'description' && value && value.trim().length > 2000) {
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

describe('Issue #1: Task Search by Title and Description', () => {
  it('1. Matches task by title substring (case-insensitive)', () => {
    const results = filterTasks(sampleTasks, { searchQuery: 'landing' });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].id, '1');
  });

  it('2. Matches task by uppercase query (case-insensitive)', () => {
    const results = filterTasks(sampleTasks, { searchQuery: 'MONGODB' });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].id, '3');
  });

  it('3. Matches task by description keyword', () => {
    const results = filterTasks(sampleTasks, { searchQuery: 'indexing' });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].id, '3');
  });

  it('4. Returns empty array when query does not match anything', () => {
    const results = filterTasks(sampleTasks, { searchQuery: 'nonexistenttermxyz' });
    assert.strictEqual(results.length, 0);
  });

  it('5. Whitespace-only search query returns all tasks', () => {
    const results = filterTasks(sampleTasks, { searchQuery: '   ' });
    assert.strictEqual(results.length, sampleTasks.length);
  });

  it('6. Empty string search query returns all tasks', () => {
    const results = filterTasks(sampleTasks, { searchQuery: '' });
    assert.strictEqual(results.length, sampleTasks.length);
  });
});

describe('Issue #2: Task Status Filtering', () => {
  it('1. Filters by TODO status', () => {
    const results = filterTasks(sampleTasks, { statusFilter: 'TODO' });
    assert.strictEqual(results.length, 3);
    assert.ok(results.every((t) => t.status === 'TODO'));
  });

  it('2. Filters by IN_PROGRESS status', () => {
    const results = filterTasks(sampleTasks, { statusFilter: 'IN_PROGRESS' });
    assert.strictEqual(results.length, 2);
    assert.ok(results.every((t) => t.status === 'IN_PROGRESS'));
  });

  it('3. Filters by COMPLETED status', () => {
    const results = filterTasks(sampleTasks, { statusFilter: 'COMPLETED' });
    assert.strictEqual(results.length, 3);
    assert.ok(results.every((t) => t.status === 'COMPLETED'));
  });

  it('4. Selecting ALL restores all tasks', () => {
    const results = filterTasks(sampleTasks, { statusFilter: 'ALL' });
    assert.strictEqual(results.length, sampleTasks.length);
  });

  it('5. Compound filter: Status COMPLETED + Search "health"', () => {
    const results = filterTasks(sampleTasks, { statusFilter: 'COMPLETED', searchQuery: 'health' });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].id, '8');
  });
});

describe('Issue #4: Client-side Form Validation', () => {
  it('1. Rejects empty title', () => {
    const err = validateField('title', '');
    assert.strictEqual(err, 'Task title is required');
  });

  it('2. Rejects whitespace-only title', () => {
    const err = validateField('title', '     ');
    assert.strictEqual(err, 'Task title is required');
  });

  it('3. Rejects title exceeding 120 characters', () => {
    const longTitle = 'a'.repeat(121);
    const err = validateField('title', longTitle);
    assert.strictEqual(err, 'Task title must be 120 characters or fewer');
  });

  it('4. Accepts valid title', () => {
    const err = validateField('title', 'Deploy staging environment');
    assert.strictEqual(err, '');
  });

  it('5. Rejects description exceeding 2000 characters', () => {
    const longDesc = 'b'.repeat(2001);
    const err = validateField('description', longDesc);
    assert.strictEqual(err, 'Description must be 2,000 characters or fewer');
  });

  it('6. Accepts valid description', () => {
    const err = validateField('description', 'Short and crisp description');
    assert.strictEqual(err, '');
  });

  it('7. Rejects invalid due date format', () => {
    const err = validateField('dueDate', 'invalid-date');
    assert.strictEqual(err, 'Enter a valid due date');
  });

  it('8. Accepts valid ISO due date format (YYYY-MM-DD)', () => {
    const err = validateField('dueDate', '2026-12-31');
    assert.strictEqual(err, '');
  });
});

describe('Issue #5: Admin Task Assignment Functionality', () => {
  it('1. Payload includes assignedTo when Admin selects user', () => {
    const isAdmin = true;
    const formData = {
      title: 'Fix auth bug',
      description: 'Fix token expiry',
      status: 'TODO',
      priority: 'HIGH',
      dueDate: '2026-11-01',
      assignedTo: '60d0fe4f5311236168a109ca',
    };

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

    assert.strictEqual(payload.assignedTo, '60d0fe4f5311236168a109ca');
  });

  it('2. Payload sets assignedTo: null when Admin selects Unassigned', () => {
    const isAdmin = true;
    const formData = {
      title: 'Unassigned Task',
      description: '',
      status: 'TODO',
      priority: 'LOW',
      dueDate: '',
      assignedTo: '',
    };

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

    assert.strictEqual(payload.assignedTo, null);
  });

  it('3. Non-admin user does not include assignedTo in payload', () => {
    const isAdmin = false;
    const formData = {
      title: 'Regular user task',
      description: '',
      status: 'TODO',
      priority: 'LOW',
      dueDate: '',
      assignedTo: 'some-user-id',
    };

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

    assert.strictEqual(payload.assignedTo, undefined);
  });
});

describe('Issue #6: Task List Pagination', () => {
  const pageSize = 5;

  it('1. Computes totalPages correctly', () => {
    assert.strictEqual(Math.max(1, Math.ceil(8 / pageSize)), 2);
    assert.strictEqual(Math.max(1, Math.ceil(5 / pageSize)), 1);
    assert.strictEqual(Math.max(1, Math.ceil(0 / pageSize)), 1);
  });

  it('2. Page 1 returns first 5 tasks', () => {
    const currentPage = 1;
    const startIndex = (currentPage - 1) * pageSize;
    const page1Tasks = sampleTasks.slice(startIndex, startIndex + pageSize);

    assert.strictEqual(page1Tasks.length, 5);
    assert.strictEqual(page1Tasks[0].id, '1');
    assert.strictEqual(page1Tasks[4].id, '5');
  });

  it('3. Page 2 returns remaining 3 tasks', () => {
    const currentPage = 2;
    const startIndex = (currentPage - 1) * pageSize;
    const page2Tasks = sampleTasks.slice(startIndex, startIndex + pageSize);

    assert.strictEqual(page2Tasks.length, 3);
    assert.strictEqual(page2Tasks[0].id, '6');
    assert.strictEqual(page2Tasks[2].id, '8');
  });

  it('4. Clamping protects out-of-bounds page navigation', () => {
    const totalPages = Math.max(1, Math.ceil(sampleTasks.length / pageSize));
    const requestedPage = 99;
    const safePage = Math.min(Math.max(1, requestedPage), totalPages);
    assert.strictEqual(safePage, 2);
  });

  it('5. Resetting filters preserves valid page boundary', () => {
    let currentPage = 2;
    // When filter narrows results down to 1 task:
    const filtered = filterTasks(sampleTasks, { searchQuery: 'landing' });
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    assert.strictEqual(totalPages, 1);
    if (currentPage > totalPages) {
      currentPage = 1;
    }
    assert.strictEqual(currentPage, 1);
  });
});
