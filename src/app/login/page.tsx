"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InteractiveButton } from '@/components/ascii/InteractiveButton';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Create basic auth header
      const credentials = btoa(`${username}:${password}`);
      
      // Test authentication
      const response = await fetch('/', {
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      });

      if (response.ok) {
        // Store credentials for subsequent requests
        localStorage.setItem('auth', credentials);
        
        // Set authorization header for future requests
        const originalFetch = window.fetch;
        window.fetch = function(input, init = {}) {
          const headers = new Headers(init.headers);
          if (!headers.has('Authorization')) {
            headers.set('Authorization', `Basic ${credentials}`);
          }
          return originalFetch(input, { ...init, headers });
        };
        
        router.push('/');
      } else {
        setError('Invalid username or password');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-mono" 
         style={{backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)'}}>
      
      <div className="w-full max-w-md p-8">
        
        {/* ASCII Logo */}
        <div className="text-center mb-8">
          <div className="text-lg font-bold font-mono mb-2" style={{color: 'var(--text-primary)'}}>
            ╔═══════════════════════════════╗<br/>
            ║                               ║<br/>
            ║           O K O A             ║<br/>
            ║                               ║<br/>
            ║      AUTOMATED PROCESSOR      ║<br/>
            ║                               ║<br/>
            ╚═══════════════════════════════╝
          </div>
          <div className="text-xs font-mono" style={{color: 'var(--text-secondary)'}}>
            Document Processing & AI Analysis Platform
          </div>
        </div>

        {/* Login Form */}
        <div className="border border-okoa-fg-primary bg-okoa-bg-secondary p-6">
          <div className="text-center mb-6">
            <div className="text-sm font-mono font-bold text-okoa-fg-primary">
              🔐 DEMO ACCESS LOGIN
            </div>
            <div className="text-xs font-mono text-okoa-fg-secondary mt-1">
              Enter your credentials to access the system
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-okoa-fg-primary mb-2">
                USERNAME:
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 border border-okoa-fg-primary bg-okoa-bg-primary text-okoa-fg-primary font-mono text-sm focus:outline-none focus:border-accent-primary"
                placeholder="demo"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-okoa-fg-primary mb-2">
                PASSWORD:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-okoa-fg-primary bg-okoa-bg-primary text-okoa-fg-primary font-mono text-sm focus:outline-none focus:border-accent-primary"
                placeholder="••••••••••••••"
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="text-xs font-mono text-red-500 bg-red-50 border border-red-200 p-2">
                ⚠ {error}
              </div>
            )}

            <InteractiveButton
              type="submit"
              variant="primary"
              disabled={isLoading || !username || !password}
              className="w-full"
            >
              {isLoading ? '⏳ AUTHENTICATING...' : '→ LOGIN TO SYSTEM'}
            </InteractiveButton>
          </form>

          {/* Demo Credentials Hint */}
          <div className="mt-6 pt-4 border-t border-okoa-fg-secondary">
            <div className="text-center">
              <div className="text-xs font-mono text-okoa-fg-secondary">
                Demo Credentials:<br/>
                Username: <span className="text-okoa-fg-primary">demo</span><br/>
                Password: <span className="text-okoa-fg-primary">OKOA2024Demo!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <div className="text-xs font-mono text-okoa-fg-secondary">
            OKOA Labs • Real Estate Document Processing Platform
          </div>
        </div>
      </div>
    </div>
  );
}