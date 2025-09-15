import './App.css';
import TodoList from './TodoList';

function App() {
  return (
    <div className="App">
      <main className="App-main">
        <TodoList />
      </main>
      <footer
        style={{
          textAlign: 'center',
          margin: '2rem 0',
          fontSize: '0.85rem',
          color: '#6b7280',
        }}
      >
        Built with React. Generation assistance by GPT-5.
      </footer>
    </div>
  );
}

export default App;
