import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { session } = useAuth();

  // Se já estiver logado, manda direto pro Dashboard
  if (session) {
    navigate('/', { replace: true });
    return null;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // O AuthContext vai detectar a sessão via onAuthStateChange e a ProtectedRoute vai liberar o acesso
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Erro ao realizar login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg text-card-foreground">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.svg" alt="TOCA HUB" className="h-12 mb-6" />
          <h1 className="text-2xl font-bold tracking-tight">Área de Projetos</h1>
          <p className="text-sm text-muted-foreground mt-2">Acesso restrito à equipe TOCA HUB.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">E-mail</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full rounded-md border border-border bg-input px-4 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Senha</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-md border border-border bg-input px-4 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full mt-4 rounded-md bg-white text-black font-medium py-2 transition-colors hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>

          {error && (
            <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20 text-center">
              ⚠ {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
