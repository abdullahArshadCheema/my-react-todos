import './App.css';
import React, { useCallback, useEffect, useState } from 'react';
import TodoList from './TodoList';
import Intro from './Intro';

function App() {
  // Decide initial intro visibility once (avoid flicker)
  const initialShowIntro = () => {
    try {
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        // Reset intro immediately on initial load if requested
        if (url.hash === '#reset-intro') {
          try {
            localStorage.removeItem('seenIntro');
          } catch {}
          return true;
        }
        const forceIntro = url.hash === '#intro' || url.searchParams.get('intro') === '1';
        if (forceIntro) return true;
        const forceApp = url.hash === '#app' || url.searchParams.get('intro') === '0';
        if (forceApp) return false;
      }
      // Default to Intro when no explicit override is present
      return true;
    } catch {
      return true;
    }
  };

  const [showIntro, setShowIntro] = useState(initialShowIntro);

  const computeShowIntro = useCallback(() => {
    try {
      if (typeof window === 'undefined') {
        setShowIntro(true);
        return;
      }
      const url = new URL(window.location.href);

      // One-click reset via URL
      if (url.hash === '#reset-intro') {
        localStorage.removeItem('seenIntro');
        setShowIntro(true);
        return;
      }

      const forceIntro = url.hash === '#intro' || url.searchParams.get('intro') === '1';
      if (forceIntro) {
        setShowIntro(true);
        return;
      }

      const forceApp = url.hash === '#app' || url.searchParams.get('intro') === '0';
      if (forceApp) {
        setShowIntro(false);
        return;
      }

      // Default: show Intro
      setShowIntro(true);
    } catch {
      setShowIntro(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.addEventListener('hashchange', computeShowIntro);
    window.addEventListener('popstate', computeShowIntro);
    return () => {
      window.removeEventListener('hashchange', computeShowIntro);
      window.removeEventListener('popstate', computeShowIntro);
    };
  }, [computeShowIntro]);

  const handleStart = () => {
    try {
      localStorage.setItem('seenIntro', 'true');
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        // Navigate to app explicitly and clean intro params
        url.hash = '#app';
        url.searchParams.delete('intro');
        window.history.replaceState({}, '', url);
      }
    } catch {}
    setShowIntro(false);
  };
  return (
    <div className="App">
      <main className="App-main">{showIntro ? <Intro onStart={handleStart} /> : <TodoList />}</main>
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
