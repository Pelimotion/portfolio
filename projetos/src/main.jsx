import React from 'react';
import ReactDOM from 'react-scale-dom';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/projetos">
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
