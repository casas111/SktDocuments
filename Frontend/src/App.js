import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import DocumentsDrive from './components/documents/DocumentsDrive';
import FileViewer from './components/documents/FileViewer';
import DriveNavigationHandler from './components/documents/DriveNavigationHandler';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Simetrik Documents Drive</h1>
          <p>Secure document management with local file system storage</p>
        </header>
        <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          <Routes>
            <Route path="/" element={<DriveNavigationHandler />} />
            <Route path="/drive/*" element={<DriveNavigationHandler />} />
            <Route path="/file/:fileId" element={<FileViewer />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer style={{ padding: '20px', textAlign: 'center', marginTop: '40px', borderTop: '1px solid #eee' }}>
          <p>Simetrik Documents Drive - {new Date().getFullYear()}</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
