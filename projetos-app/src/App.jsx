import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import { UniversalEntityPage } from './pages/entity/UniversalEntityPage';

import { ToastProvider } from './components/ui/Toast';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              {/* Rota universal unificada para qualquer página (projeto, cena, task) */}
              <Route path="/project/:pageId" element={<UniversalEntityPage />} />
              <Route path="/page/:pageId" element={<UniversalEntityPage />} />
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
