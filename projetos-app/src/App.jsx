import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { AccentColorManager } from './components/layout/AccentColorManager';

import Login from './pages/auth/Login';
const BriefingPage = lazy(() => import('./pages/briefing/BriefingPage'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const UniversalEntityPage = lazy(() =>
  import('./pages/entity/UniversalEntityPage').then(m => ({ default: m.UniversalEntityPage }))
);
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const TokensPage = lazy(() => import('./pages/dev/TokensPage'));
const ClientsPage = lazy(() =>
  import('./components/financial/ClientsManager').then(m => ({ default: m.ClientsManager }))
);

import { ToastProvider } from './components/ui/Toast';

function RouteFallback() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[50vh] text-muted-foreground">
      <Loader2 className="w-6 h-6 animate-spin" />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AccentColorManager />
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Rota pública de briefing — sem autenticação */}
            <Route
              path="/briefing/:slug"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <BriefingPage />
                </Suspense>
              }
            />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route
                  path="/"
                  element={
                    <Suspense fallback={<RouteFallback />}>
                      <Dashboard />
                    </Suspense>
                  }
                />
                {/* Rota universal unificada para qualquer página (projeto, cena, task) */}
                <Route
                  path="/project/:pageId"
                  element={
                    <Suspense fallback={<RouteFallback />}>
                      <UniversalEntityPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/page/:pageId"
                  element={
                    <Suspense fallback={<RouteFallback />}>
                      <UniversalEntityPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <Suspense fallback={<RouteFallback />}>
                      <ProfilePage />
                    </Suspense>
                  }
                />
                <Route
                  path="/clients"
                  element={
                    <Suspense fallback={<RouteFallback />}>
                      <ClientsPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/dev/tokens"
                  element={
                    <Suspense fallback={<RouteFallback />}>
                      <TokensPage />
                    </Suspense>
                  }
                />
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
