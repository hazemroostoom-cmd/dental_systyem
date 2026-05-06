'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDentalStore } from '@/store/useDentalStore';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { login } = useDentalStore();

  // Demo credentials
  const DEMO_USERS = [
    { email: 'doctor@dental.com', password: 'password123', role: 'dentist', name: 'Dr. Sarah Wilson' },
    { email: 'technician@dental.com', password: 'password123', role: 'technician', name: 'Alex Smith' },
    { email: 'admin@dental.com', password: 'password123', role: 'admin', name: 'Admin User' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const user = DEMO_USERS.find(u => u.email === email && u.password === password);
      
      if (user) {
        login({
          id: Math.random().toString(36).substr(2, 9),
          email: user.email,
          name: user.name,
          role: user.role as 'dentist' | 'technician' | 'admin',
        });
        router.push('/dashboard');
      } else {
        setError('Invalid email or password');
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dental Lab</h1>
          <p className="text-gray-600 mt-2">Platform</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

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
