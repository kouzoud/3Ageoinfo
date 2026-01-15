import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Activer Eruda (console mobile) en mode développement
if (import.meta.env.DEV) {
  import('eruda').then(eruda => eruda.default.init());
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
