'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface RegisterData {
  email: string;
  name: string;
  phone: string;
  password: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    name: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/register`, formData);
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error en el registro');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-blue-900">Register</h2>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <input
                type="email"
                required
                className="appearance-none rounded-lg block w-full px-3 py-2 border border-blue-300 placeholder-gray-500 text-blue-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <input
                type="text"
                required
                className="appearance-none rounded-lg block w-full px-3 py-2 border border-blue-300 placeholder-gray-500 text-blue-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <input
                type="tel"
                required
                className="appearance-none rounded-lg block w-full px-3 py-2 border border-blue-300 placeholder-gray-500 text-blue-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Cellphone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-lg block w-full px-3 py-2 border border-blue-300 placeholder-gray-500 text-blue-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition focus:outline-none shadow-md"
            >
              Register
            </button>
          </div>
        </form>
        <div className="text-center">
          <Link href="/login" className="text-blue-600 hover:text-blue-700">
            Already have an account? Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
