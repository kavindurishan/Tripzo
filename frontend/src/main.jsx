import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import IntroSplash from './components/IntroSplash.jsx';
import App from './App.jsx';
import './index.css';

function Root() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <IntroSplash onComplete={() => setShowSplash(false)} />}
      <div style={{ display: showSplash ? 'none' : 'block' }} className="w-full min-h-screen">
        <App />
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Root />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
