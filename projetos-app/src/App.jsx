import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { AccentColorManager } from './components/layout/AccentColorManager';

import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import { UniversalEntityPage } from './pages/entity/UniversalEntityPage';
import ProfilePage from './pages/profile/ProfilePage';

import { ToastProvider } from './components/ui/Toast';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AccentColorManager />
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                {/* Rota universal unificada para qualquer página (projeto, cena, task) */}
                <Route path="/project/:pageId" element={<UniversalEntityPage />} />
                <Route path="/page/:pageId" element={<UniversalEntityPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
