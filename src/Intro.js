import React from 'react';
import './Intro.css';

function Intro({ onStart }) {
  return (
    <div className="intro-shell">
      <div className="intro-content">
        <div className="intro-art" aria-hidden="true">
          {/* Simple inline SVG illustration */}
          <svg
            width="220"
            height="160"
            viewBox="0 0 220 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="10"
              y="20"
              width="200"
              height="120"
              rx="16"
              fill="url(#g)"
              stroke="rgba(255,255,255,0.5)"
            />
            <rect x="30" y="48" width="160" height="12" rx="6" fill="#94a3b8" />
            <rect x="30" y="74" width="100" height="12" rx="6" fill="#60a5fa" />
            <rect x="30" y="100" width="130" height="12" rx="6" fill="#f59e0b" />
            <defs>
              <linearGradient
                id="g"
                x1="10"
                y1="20"
                x2="210"
                y2="140"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#1f2937" />
                <stop offset="1" stopColor="#0b1220" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1 className="intro-title">Focus on what matters</h1>
        <p className="intro-sub">
          A clean, fast, and delightful to‑do manager with smart sorting, priorities, and more.
        </p>
        <button className="intro-start" onClick={onStart}>
          <span className="emoji" aria-hidden="true">
            🚀
          </span>{' '}
          Get started
        </button>
      </div>
    </div>
  );
}

export default Intro;
