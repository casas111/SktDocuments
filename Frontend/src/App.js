import React from 'react';
import './App.css';
import ClaudeChat from './components/ClaudeChat';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Claude AI Integration Demo</h1>
        <p>This is a demonstration of the Claude 3 API integration</p>
      </header>
      <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <ClaudeChat />
      </main>
      <footer style={{ padding: '20px', textAlign: 'center', marginTop: '40px', borderTop: '1px solid #eee' }}>
        <p>Claude 3 API Integration - {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;
