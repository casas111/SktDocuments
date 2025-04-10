import React from 'react';
import './App.css';
import DocumentsDrive from './components/documents/DocumentsDrive';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Simetrik Documents Drive</h1>
        <p>Secure document management with local file system storage</p>
      </header>
      <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <DocumentsDrive />
      </main>
      <footer style={{ padding: '20px', textAlign: 'center', marginTop: '40px', borderTop: '1px solid #eee' }}>
        <p>Simetrik Documents Drive - {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;
