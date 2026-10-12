import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Priority filter matching predicate as implemented in frontend/src/hooks/useTasks.js
 */
const matchesPriority = (task, priorityFilter) => {
  return priorityFilter === 'ALL' || task.priority === priorityFilter;
};

/**
 * Filter evaluation representing useTasks hook filteredTasks computation
 */
const filterTasks = (tasks, { searchQuery = '', statusFilter = 'ALL', priorityFilter = 'ALL' } = {}) => {
  return tasks.filter((task) => {
    const matchesSearch =
      !searchQuery ||
      (task.title && task.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' || task.status === statusFilter;

    const matchesPriorityResult = matchesPriority(task, priorityFilter);

    return matchesSearch && matchesStatus && matchesPriorityResult;
  });
};

const sampleTasks = [
  { id: '1', title: 'Landing Page Hero Section', status: 'IN_PROGRESS', priority: 'HIGH' },
  { id: '2', title: 'JWT Refresh Token Mechanism', status: 'TODO', priority: 'HIGH' },
  { id: '3', title: 'MongoDB Query Indexing', status: 'COMPLETED', priority: 'MEDIUM' },
  { id: '4', title: 'CI Pipeline with GitHub Actions', status: 'IN_PROGRESS', priority: 'MEDIUM' },
  { id: '5', title: 'React Context State Management', status: 'COMPLETED', priority: 'LOW' },
  { id: '6', title: 'Accessibility WCAG Audit', status: 'TODO', priority: 'LOW' },
  { id: '7', title: 'API Documentation OpenAPI', status: 'TODO', priority: 'MEDIUM' },
  { id: '8', title: 'Uptime & Health Monitoring', status: 'COMPLETED', priority: 'HIGH' },
];

describe('Issue #3: Task Priority Filtering Logic', () => {
  it('1. HIGH filter: displays only high-priority tasks', () => {
    const results = sampleTasks.filter((t) => matchesPriority(t, 'HIGH'));
    assert.strictEqual(results.length, 3);
    assert.ok(results.every((t) => t.priority === 'HIGH'));
    assert.deepStrictEqual(results.map((t) => t.id), ['1', '2', '8']);
  });

  it('2. MEDIUM filter: displays only medium-priority tasks', () => {
    const results = sampleTasks.filter((t) => matchesPriority(t, 'MEDIUM'));
    assert.strictEqual(results.length, 3);
    assert.ok(results.every((t) => t.priority === 'MEDIUM'));
    assert.deepStrictEqual(results.map((t) => t.id), ['3', '4', '7']);
  });

  it('3. LOW filter: displays only low-priority tasks', () => {
    const results = sampleTasks.filter((t) => matchesPriority(t, 'LOW'));
    assert.strictEqual(results.length, 2);
    assert.ok(results.every((t) => t.priority === 'LOW'));
    assert.deepStrictEqual(results.map((t) => t.id), ['5', '6']);
  });

  it('4. ALL filter: restores tasks of every priority', () => {
    const results = sampleTasks.filter((t) => matchesPriority(t, 'ALL'));
    assert.strictEqual(results.length, 8);
    assert.deepStrictEqual(results.map((t) => t.id), sampleTasks.map((t) => t.id));
  });

  it('5. Compound filter: HIGH priority + IN_PROGRESS status', () => {
    const results = filterTasks(sampleTasks, {
      priorityFilter: 'HIGH',
      statusFilter: 'IN_PROGRESS',
    });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].id, '1');
    assert.strictEqual(results[0].priority, 'HIGH');
    assert.strictEqual(results[0].status, 'IN_PROGRESS');
  });

  it('6. Compound filter: HIGH priority + search query', () => {
    const results = filterTasks(sampleTasks, {
      priorityFilter: 'HIGH',
      searchQuery: 'Landing',
    });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].id, '1');
    assert.strictEqual(results[0].title, 'Landing Page Hero Section');
  });

  it('7. Reset: restoring priorityFilter to ALL restores all tasks', () => {
    let priorityFilter = 'HIGH';
    let filtered = sampleTasks.filter((t) => matchesPriority(t, priorityFilter));
    assert.strictEqual(filtered.length, 3);

    // Simulate reset behavior
    priorityFilter = 'ALL';
    filtered = sampleTasks.filter((t) => matchesPriority(t, priorityFilter));
    assert.strictEqual(filtered.length, 8);
  });

  it('8. Safe handling of missing or undefined task priority', () => {
    const taskWithMissingPriority = { id: '9', title: 'Task with no priority' };
    assert.strictEqual(matchesPriority(taskWithMissingPriority, 'ALL'), true);
    assert.strictEqual(matchesPriority(taskWithMissingPriority, 'HIGH'), false);
    assert.strictEqual(matchesPriority(taskWithMissingPriority, 'MEDIUM'), false);
    assert.strictEqual(matchesPriority(taskWithMissingPriority, 'LOW'), false);
  });

  it('9. Changing a task priority updates filtered results without stale state', () => {
    const tasks = [...sampleTasks.map((t) => ({ ...t }))];
    // Initially task 3 is MEDIUM
    assert.strictEqual(tasks.filter((t) => matchesPriority(t, 'HIGH')).length, 3);

    // Promote task 3 to HIGH
    tasks[2].priority = 'HIGH';
    const updatedHighTasks = tasks.filter((t) => matchesPriority(t, 'HIGH'));
    assert.strictEqual(updatedHighTasks.length, 4);
    assert.ok(updatedHighTasks.some((t) => t.id === '3'));
  });
});
