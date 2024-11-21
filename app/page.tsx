'use client';

import { useRouter } from 'next/navigation';
import { ArrowRightIcon, UserPlusIcon, MessageCircleIcon, HistoryIcon } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <img 
            src="/api/placeholder/50/50" 
            alt="Car Expert System Logo" 
            className="w-12 h-12 rounded-full"
          />
          <h1 className="text-2xl font-bold text-blue-900">Car Expert System</h1>
        </div>
        <nav>
          <button 
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center space-x-2"
          >
            <UserPlusIcon className="w-5 h-5" />
            <span>Login / Sign Up</span>
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-12 grid md:grid-cols-2 gap-12 items-center">
        {/* Left Side - Description */}
        <div className="space-y-6">
          <h2 className="text-4xl font-extrabold text-blue-900">
            Diagnose Your Car's Problems <br />with Expert Precision
          </h2>
          <p className="text-xl text-blue-800 leading-relaxed">
            Welcome to the Car Expert System, your intelligent companion for automotive troubleshooting. 
            Our advanced diagnostic tool helps you identify and understand your vehicle's potential issues 
            through an intuitive, step-by-step conversation.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <UserPlusIcon className="w-6 h-6 text-blue-600" />
              <p className="text-blue-800">Create your free account</p>
            </div>
            <div className="flex items-center space-x-3">
              <MessageCircleIcon className="w-6 h-6 text-blue-600" />
              <p className="text-blue-800">Engage in diagnostic conversations</p>
            </div>
            <div className="flex items-center space-x-3">
              <HistoryIcon className="w-6 h-6 text-blue-600" />
              <p className="text-blue-800">Track and review your diagnostic history</p>
            </div>
          </div>

          <div className="flex space-x-4">
            <button 
              onClick={() => router.push('/login')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2 shadow-md"
            >
              <span>Get Started</span>
              <ArrowRightIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={() => router.push('/history')}
              className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-100 transition flex items-center space-x-2"
            >
              View History
            </button>
          </div>
        </div>

        {/* Right Side - Illustration */}
        <div className="hidden md:flex justify-center">
          <img 
            src="/api/placeholder/500/400" 
            alt="Car Diagnostic Illustration" 
            className="rounded-xl shadow-2xl"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-6">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <p>&copy; 2024 Car Expert System. All rights reserved.</p>
          <div className="space-x-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}