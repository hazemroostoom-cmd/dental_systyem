'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDentalStore } from '@/store/useDentalStore';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<'dentist' | 'technician' | 'admin'>('dentist');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { login, signup, isAuthenticated, isLoading, authError } = useDentalStore();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        await signup(email, password, name, role);
      } else {
        await login(email, password);
      }
      // Redirect will happen via useEffect when isAuthenticated becomes true
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message || 'Authentication failed');
      setLoading(false);
    }
  };

  // Demo credentials
  const DEMO_USERS = [
    { email: 'doctor@dental.com', password: 'password123', role: 'dentist', name: 'Dr. Sarah Wilson' },
    { email: 'technician@dental.com', password: 'password123', role: 'technician', name: 'Alex Smith' },
    { email: 'admin@dental.com', password: 'password123', role: 'admin', name: 'Admin User' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dental Lab</h1>
          <p className="text-gray-600 mt-2">Platform</p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {isSignup && (
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as 'dentist' | 'technician' | 'admin')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="dentist">Dentist</option>
                <option value="technician">Technician</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          {(error || authError) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error || authError}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
          >
            {loading ? (isSignup ? 'Creating Account...' : 'Signing in...') : (isSignup ? 'Create Account' : 'Sign In')}
          </Button>
        </form>

        {/* Toggle between login and signup */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setError('');
            }}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>

        {/* Demo Credentials */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-4 font-medium">Demo Credentials:</p>
          <div className="space-y-3 text-sm">
            <div className="bg-blue-50 p-3 rounded">
              <p className="font-medium text-gray-800">Dentist</p>
              <p className="text-gray-600">doctor@dental.com</p>
              <p className="text-gray-600">password123</p>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <p className="font-medium text-gray-800">Technician</p>
              <p className="text-gray-600">technician@dental.com</p>
              <p className="text-gray-600">password123</p>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <p className="font-medium text-gray-800">Admin</p>
              <p className="text-gray-600">admin@dental.com</p>
              <p className="text-gray-600">password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
