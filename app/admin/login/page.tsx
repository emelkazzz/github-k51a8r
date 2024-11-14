"use client";

import { useState } from 'react';
import { Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { toast } from 'sonner';

export default function AdminLogin() {
  const [token, setToken] = useState('');
  const { login } = useAdminAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (login(token)) {
      toast.success('Successfully logged in');
    } else {
      toast.error('Invalid admin token');
      setToken('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Shield className="h-12 w-12 text-blue-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Admin Access</h1>
          <p className="text-gray-400 mt-2">Enter your admin token to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              placeholder="Admin Token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="bg-gray-800/50 border-gray-700 text-white"
              required
              autoFocus
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}