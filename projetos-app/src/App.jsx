import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import PageView from './pages/page/PageView';
import ProjectPage from './pages/project/ProjectPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            {/* Rota dedicada para projeto (com tabs) */}
            <Route path="/project/:pageId" element={<ProjectPage />} />
            {/* Rota universal para qualquer página */}
            <Route path="/page/:pageId" element={<PageView />} />
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
