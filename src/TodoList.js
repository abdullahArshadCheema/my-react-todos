import React, { useEffect, useState } from 'react';
import './TodoList.css';

function TodoList() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");

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
          onKeyDown={e => { if (e.key === 'Enter') handleAddTask(); }}
        />
        <button className="todo-add-btn" onClick={handleAddTask}>Add</button>
      </div>
      <ul className="todo-list">
        {tasks.length === 0 ? (
          <li className="todo-empty">No tasks yet.</li>
        ) : (
          tasks.map((task, idx) => (
            <li key={idx} className="todo-item">
              <span
                onClick={() => handleToggleComplete(idx)}
                className={`todo-text ${task.completed ? 'completed' : ''}`}
                title="Click to mark as complete/incomplete"
              >
                {task.text}
              </span>
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
