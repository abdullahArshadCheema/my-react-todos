import React, { useEffect, useRef, useState } from 'react';
import './TodoList.css';

function TodoList() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [priority, setPriority] = useState('medium'); // low | medium | high
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created-desc'); // created-desc|created-asc|alpha-asc|alpha-desc|priority|incomplete-first
  const [filter, setFilter] = useState('all'); // all | active | completed
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const idRef = useRef(0);
  const undoTimerRef = useRef(null);
  const [lastDeleted, setLastDeleted] = useState(null); // { task, index }
  const [draggingId, setDraggingId] = useState(null);
  const [theme, setTheme] = useState('dark'); // light | dark
  const inputRef = useRef(null);
  // Toasts
  const [toasts, setToasts] = useState([]); // { id, type: 'success'|'warning'|'info', message }
  const toastIdRef = useRef(0);
  const addToast = (message, type = 'success', timeout = 3000) => {
    const id = toastIdRef.current++;
    setToasts((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, timeout);
  };
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // Load tasks from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tasks');
      let initial = [];
      if (saved) {
        initial = JSON.parse(saved);
        // Migration: ensure IDs, createdAt, and priority exist
        let nextId = 0;
        initial = initial.map((t, i) => {
          const id = typeof t.id === 'number' ? t.id : i;
          nextId = Math.max(nextId, id + 1);
          return {
            id,
            text: t.text,
            completed: !!t.completed,
            createdAt: typeof t.createdAt === 'number' ? t.createdAt : Date.now() + i,
            priority:
              t.priority === 'high' || t.priority === 'low' || t.priority === 'medium'
                ? t.priority
                : 'medium',
          };
        });
        idRef.current = nextId;
      }
      setTasks(initial);
    } catch (e) {
      setTasks([]);
    }

    // Load filter
    try {
      const savedFilter = localStorage.getItem('filter');
      if (savedFilter === 'all' || savedFilter === 'active' || savedFilter === 'completed') {
        setFilter(savedFilter);
      }
    } catch {}

    // Load theme: prefer saved; otherwise use OS preference; fallback 'dark'
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setTheme(savedTheme);
      } else if (typeof window !== 'undefined' && window.matchMedia) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        setTheme(prefersDark.matches ? 'dark' : 'light');
      } else {
        setTheme('dark');
      }
    } catch {}
  }, []);

  // Optional: respond to OS theme changes until user explicitly toggles and saves
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') return; // user choice takes precedence
    const onChange = (e) => setTheme(e.matches ? 'dark' : 'light');
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange);
      else if (mq.removeListener) mq.removeListener(onChange);
    };
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('filter', filter);
  }, [filter]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleAddTask = () => {
    if (input.trim() === '') return;
    const newTask = {
      id: idRef.current++,
      text: input.trim(),
      completed: false,
      createdAt: Date.now(),
      priority,
    };
    setTasks([...tasks, newTask]);
    setInput('');
    setPriority('medium');
    addToast(`Added "${newTask.text}"`, 'success');
  };

  const handleInputChange = (e) => setInput(e.target.value);

  const handleToggleComplete = (id) => {
    const t = tasks.find((x) => x.id === id);
    const willComplete = t ? !t.completed : false;
    setTasks(
      tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
    );
    if (t) {
      addToast(`Marked "${t.text}" as ${willComplete ? 'completed' : 'incomplete'}`, 'success');
    }
  };

  const handleDeleteTask = (id) => {
    const index = tasks.findIndex((t) => t.id === id);
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    setTasks(tasks.filter((t) => t.id !== id));
    setLastDeleted({ task, index });
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => setLastDeleted(null), 5000);
    if (editingId === id) {
      setEditingId(null);
      setEditingText('');
    }
    addToast(`Deleted "${task.text}"`, 'warning');
  };

  // Search, Filter, Sort
  const filteredTasks = tasks
    .filter((t) => (filter === 'all' ? true : filter === 'active' ? !t.completed : t.completed))
    .filter((t) => t.text.toLowerCase().includes(search.toLowerCase()));

  const sorters = {
    'created-desc': (a, b) => b.createdAt - a.createdAt,
    'created-asc': (a, b) => a.createdAt - b.createdAt,
    'alpha-asc': (a, b) => a.text.localeCompare(b.text),
    'alpha-desc': (a, b) => b.text.localeCompare(a.text),
    priority: (a, b) =>
      ({ high: 0, medium: 1, low: 2 })[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority],
    'incomplete-first': (a, b) => Number(a.completed) - Number(b.completed),
  };
  const visibleTasks = [...filteredTasks].sort(sorters[sortBy] || sorters['created-desc']);

  const remaining = tasks.filter((t) => !t.completed).length;
  const hasCompleted = tasks.some((t) => t.completed);

  // Editing
  const startEditing = (id) => {
    setEditingId(id);
    const t = tasks.find((x) => x.id === id);
    setEditingText(t ? t.text : '');
  };
  const cancelEditing = () => {
    setEditingId(null);
    setEditingText('');
  };
  const saveEditing = () => {
    if (editingId === null) return;
    const text = editingText.trim();
    if (!text) {
      cancelEditing();
      return;
    }
    setTasks(tasks.map((t) => (t.id === editingId ? { ...t, text } : t)));
    cancelEditing();
  };

  // Undo delete
  const undoDelete = () => {
    if (!lastDeleted) return;
    const { task, index } = lastDeleted;
    const arr = [...tasks];
    arr.splice(Math.min(index, arr.length), 0, task);
    setTasks(arr);
    setLastDeleted(null);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    addToast(`Restored "${task.text}"`, 'info');
  };

  // Drag & drop reorder (only in 'all' filter)
  const handleDragStart = (id) => {
    setDraggingId(id);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  const handleDrop = (targetId) => {
    if (filter !== 'all') return; // only allow reorder in All
    const srcIdx = tasks.findIndex((t) => t.id === draggingId);
    const dstIdx = tasks.findIndex((t) => t.id === targetId);
    if (srcIdx === -1 || dstIdx === -1 || srcIdx === dstIdx) return;
    const arr = [...tasks];
    const [moved] = arr.splice(srcIdx, 1);
    arr.splice(dstIdx, 0, moved);
    setTasks(arr);
    setDraggingId(null);
  };
  const handleDragEnd = () => setDraggingId(null);

  return (
    <div className={`todo-app ${theme === 'dark' ? 'theme-dark' : ''}`}>
      <h2 className="todo-title">To-Do List</h2>
      <div className="todo-input-row">
        <input
          type="text"
          placeholder="Add a new task..."
          className="todo-input"
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddTask();
          }}
        />
        <select
          aria-label="Priority"
          className="todo-select"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="high">🔥 High</option>
          <option value="medium">⚖️ Medium</option>
          <option value="low">🧊 Low</option>
        </select>
        <button className="todo-add-btn" onClick={handleAddTask} aria-label="Add task">
          <span className="emoji" aria-hidden="true">
            ➕
          </span>{' '}
          Add
        </button>
      </div>
      <div className="todo-toolbar">
        <div className="todo-filters" role="tablist" aria-label="Filters">
          <button
            className={`todo-filter ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <span className="emoji" aria-hidden="true">
              ⭐
            </span>{' '}
            All
          </button>
          <button
            className={`todo-filter ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            <span className="emoji" aria-hidden="true">
              ⏳
            </span>{' '}
            Active
          </button>
          <button
            className={`todo-filter ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            <span className="emoji" aria-hidden="true">
              ✅
            </span>{' '}
            Completed
          </button>
        </div>
        {/* Mobile filter select (visible on small screens via CSS) */}
        <select
          className="todo-filter-select"
          aria-label="Filter tasks"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
        <div className="todo-count" aria-live="polite">
          {remaining} item{remaining !== 1 ? 's' : ''} left
        </div>
        <button
          className="todo-clear-btn"
          onClick={() => setTasks(tasks.filter((t) => !t.completed))}
          disabled={!hasCompleted}
        >
          <span className="emoji" aria-hidden="true">
            🧹
          </span>{' '}
          Clear Completed
        </button>
        <button
          className="todo-theme-btn"
          aria-pressed={theme === 'dark'}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? (
            <>
              <span className="emoji" aria-hidden="true">
                ☀️
              </span>{' '}
              Light Mode
            </>
          ) : (
            <>
              <span className="emoji" aria-hidden="true">
                🌙
              </span>{' '}
              Dark Mode
            </>
          )}
        </button>
      </div>
      <div className="todo-toolbar">
        <input
          className="todo-search"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label="Sort by"
          className="todo-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="created-desc">Newest first</option>
          <option value="created-asc">Oldest first</option>
          <option value="alpha-asc">A → Z</option>
          <option value="alpha-desc">Z → A</option>
          <option value="priority">Priority</option>
          <option value="incomplete-first">Incomplete first</option>
        </select>
        <button
          className="todo-secondary-btn"
          onClick={() => {
            const allCompleted = tasks.every((t) => t.completed);
            setTasks(tasks.map((t) => ({ ...t, completed: !allCompleted })));
          }}
        >
          <span className="emoji" aria-hidden="true">
            🔁
          </span>{' '}
          Toggle All
        </button>
        <button
          className="todo-secondary-btn"
          onClick={() => {
            const data = JSON.stringify(tasks, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'tasks.json';
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          <span className="emoji" aria-hidden="true">
            ⬇️
          </span>{' '}
          Export
        </button>
        <input
          id="todo-import"
          type="file"
          accept="application/json"
          style={{ display: 'none' }}
          onChange={async (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            try {
              const text = await file.text();
              const parsed = JSON.parse(text);
              if (!Array.isArray(parsed)) return;
              let nextId = idRef.current;
              const cleaned = parsed.map((t, i) => {
                const id = typeof t.id === 'number' ? t.id : nextId++;
                return {
                  id,
                  text: String(t.text || '').slice(0, 500),
                  completed: !!t.completed,
                  createdAt: typeof t.createdAt === 'number' ? t.createdAt : Date.now() + i,
                  priority:
                    t.priority === 'high' || t.priority === 'low' || t.priority === 'medium'
                      ? t.priority
                      : 'medium',
                };
              });
              idRef.current = nextId;
              setTasks(cleaned);
            } catch {}
            e.target.value = '';
          }}
        />
        <button
          className="todo-secondary-btn"
          onClick={() => document.getElementById('todo-import')?.click()}
        >
          <span className="emoji" aria-hidden="true">
            ⬆️
          </span>{' '}
          Import
        </button>
      </div>
      <ul className="todo-list">
        {visibleTasks.length === 0 ? (
          <li className="todo-empty">No tasks yet.</li>
        ) : (
          visibleTasks.map((task) => (
            <li
              key={task.id}
              className={`todo-item ${draggingId === task.id ? 'dragging' : ''} ${
                task.completed ? 'is-completed' : ''
              }`}
              draggable={filter === 'all'}
              onDragStart={() => handleDragStart(task.id)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(task.id)}
              onDragEnd={handleDragEnd}
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggleComplete(task.id)}
                aria-label={`Mark ${task.text} as ${task.completed ? 'incomplete' : 'complete'}`}
              />
              <span
                className={`todo-priority pill-${task.priority}`}
                title={`Priority: ${task.priority}`}
              >
                {task.priority}
              </span>
              {editingId === task.id ? (
                <input
                  className="todo-input"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEditing();
                    if (e.key === 'Escape') cancelEditing();
                  }}
                  onBlur={saveEditing}
                />
              ) : (
                <span
                  onDoubleClick={() => startEditing(task.id)}
                  className={`todo-text ${task.completed ? 'completed' : ''}`}
                  title="Double-click to edit"
                >
                  {task.text}
                </span>
              )}
              <button
                className="todo-delete-btn"
                onClick={() => handleDeleteTask(task.id)}
                aria-label={`Delete ${task.text}`}
              >
                <span className="emoji" aria-hidden="true">
                  🗑️
                </span>{' '}
                Delete
              </button>
            </li>
          ))
        )}
      </ul>
      {/* Mobile sticky action bar */}
      <div className="mobile-sticky" aria-label="Quick actions">
        <button
          className="todo-secondary-btn"
          onClick={() => {
            inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            inputRef.current?.focus();
          }}
          aria-label="New task"
        >
          <span className="emoji" aria-hidden="true">
            ➕
          </span>{' '}
          New
        </button>
        <button
          className="todo-secondary-btn"
          onClick={() => {
            const allCompleted = tasks.every((t) => t.completed);
            setTasks(tasks.map((t) => ({ ...t, completed: !allCompleted })));
          }}
        >
          <span className="emoji" aria-hidden="true">
            🔁
          </span>{' '}
          Toggle
        </button>
        <button
          className="todo-clear-btn"
          onClick={() => setTasks(tasks.filter((t) => !t.completed))}
          disabled={!hasCompleted}
        >
          <span className="emoji" aria-hidden="true">
            🧹
          </span>{' '}
          Clear
        </button>
        <button
          className="todo-theme-btn"
          aria-pressed={theme === 'dark'}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <span className="emoji" aria-hidden="true">
              ☀️
            </span>
          ) : (
            <span className="emoji" aria-hidden="true">
              🌙
            </span>
          )}
        </button>
      </div>
      {lastDeleted && (
        <div className="todo-undo" role="alert" aria-live="assertive">
          Task deleted.
          <button className="todo-undo-btn" onClick={undoDelete}>
            Undo
          </button>
        </div>
      )}
      {/* Toast notifications */}
      <div className="toasts" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} role="status">
            <span className="toast-msg">{t.message}</span>
            <button
              className="toast-close"
              aria-label="Dismiss notification"
              onClick={() => removeToast(t.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TodoList;
