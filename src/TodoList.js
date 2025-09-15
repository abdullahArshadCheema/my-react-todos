import React, { useEffect, useRef, useState } from 'react';
import './TodoList.css';

function TodoList() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState('all'); // all | active | completed
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const idRef = useRef(0);

  // Load tasks from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tasks');
      let initial = [];
      if (saved) {
        initial = JSON.parse(saved);
        // Migration: ensure IDs exist
        let nextId = 0;
        initial = initial.map((t, i) => {
          const id = typeof t.id === 'number' ? t.id : i;
          nextId = Math.max(nextId, id + 1);
          return { id, text: t.text, completed: !!t.completed };
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
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('filter', filter);
  }, [filter]);

  const handleAddTask = () => {
    if (input.trim() === "") return;
    const newTask = { id: idRef.current++, text: input.trim(), completed: false };
    setTasks([...tasks, newTask]);
    setInput("");
  };

  const handleInputChange = (e) => setInput(e.target.value);

  const handleToggleComplete = (id) => {
    setTasks(tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditingText("");
    }
  };

  // Filters
  const filteredTasks = tasks.filter(t =>
    filter === 'all' ? true : filter === 'active' ? !t.completed : t.completed
  );

  const remaining = tasks.filter(t => !t.completed).length;
  const hasCompleted = tasks.some(t => t.completed);

  // Editing
  const startEditing = (id) => {
    setEditingId(id);
    const t = tasks.find(x => x.id === id);
    setEditingText(t ? t.text : "");
  };
  const cancelEditing = () => {
    setEditingId(null);
    setEditingText("");
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

  return (
    <div className="todo-app">
      <h2 className="todo-title">To-Do List</h2>
      <div className="todo-input-row">
        <input
          type="text"
          placeholder="Add a new task..."
          className="todo-input"
          value={input}
          onChange={handleInputChange}
          onKeyDown={e => {
            if (e.key === 'Enter') handleAddTask();
          }}
        />
        <button className="todo-add-btn" onClick={handleAddTask}>Add</button>
      </div>
      <div className="todo-toolbar">
        <div className="todo-filters" role="tablist" aria-label="Filters">
        <button
          className={`todo-filter ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >All</button>
        <button
          className={`todo-filter ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >Active</button>
        <button
          className={`todo-filter ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >Completed</button>
        </div>
        <div className="todo-count" aria-live="polite">{remaining} item{remaining !== 1 ? 's' : ''} left</div>
        <button
          className="todo-clear-btn"
          onClick={() => setTasks(tasks.filter(t => !t.completed))}
          disabled={!hasCompleted}
        >Clear Completed</button>
      </div>
      <ul className="todo-list">
        {filteredTasks.length === 0 ? (
          <li className="todo-empty">No tasks yet.</li>
        ) : (
          filteredTasks.map((task) => (
            <li key={task.id} className="todo-item">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggleComplete(task.id)}
                aria-label={`Mark ${task.text} as ${task.completed ? 'incomplete' : 'complete'}`}
              />
              {editingId === task.id ? (
                <input
                  className="todo-input"
                  value={editingText}
                  autoFocus
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
              <button className="todo-delete-btn" onClick={() => handleDeleteTask(task.id)}>
                Delete
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default TodoList;
