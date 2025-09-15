import React, { useEffect, useState } from 'react';
import './TodoList.css';

function TodoList() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState('all'); // all | active | completed
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState("");

  // Load tasks from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tasks');
      if (saved) setTasks(JSON.parse(saved));
    } catch (e) {
      // ignore malformed JSON
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = () => {
    if (input.trim() === "") return;
    setTasks([...tasks, { text: input, completed: false }]);
    setInput("");
  };

  const handleInputChange = (e) => setInput(e.target.value);

  const handleToggleComplete = (idx) => {
    setTasks(tasks.map((task, i) =>
      i === idx ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleDeleteTask = (idx) => {
    setTasks(tasks.filter((_, i) => i !== idx));
  };

  // Filters
  const filteredTasks = tasks.filter(t =>
    filter === 'all' ? true : filter === 'active' ? !t.completed : t.completed
  );

  // Editing
  const startEditing = (idx) => {
    setEditingIndex(idx);
    setEditingText(tasks[idx].text);
  };
  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingText("");
  };
  const saveEditing = () => {
    if (editingIndex === null) return;
    const text = editingText.trim();
    if (!text) {
      cancelEditing();
      return;
    }
    setTasks(tasks.map((t, i) => (i === editingIndex ? { ...t, text } : t)));
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
      <ul className="todo-list">
        {filteredTasks.length === 0 ? (
          <li className="todo-empty">No tasks yet.</li>
        ) : (
          filteredTasks.map((task, idx) => (
            <li key={idx} className="todo-item">
              {editingIndex === idx ? (
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
                  onDoubleClick={() => startEditing(idx)}
                  onClick={() => handleToggleComplete(idx)}
                  className={`todo-text ${task.completed ? 'completed' : ''}`}
                  title="Double-click to edit; click to toggle"
                >
                  {task.text}
                </span>
              )}
              <button className="todo-delete-btn" onClick={() => handleDeleteTask(idx)}>
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
