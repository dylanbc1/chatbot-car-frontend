'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface DiagnosticSession {
  id: number;
  conversation: Array<{
    question: string;
    answer: string;
  }>;
  diagnostic_result: {
    most_probable_problem: string;
    probabilities: Record<string, number>;
    diagnostic_message: string;
  };
}

interface Message {
  type: 'bot' | 'user';
  content: string;
}

export default function DiagnosticPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [diagnostic, setDiagnostic] = useState<DiagnosticSession['diagnostic_result'] | null>(null);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [diagnosticType, setDiagnosticType] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startDiagnostic = async () => {
    if (!diagnosticType) {
      setError('Please select a diagnostic type');
      return;
    }

    try {
      setMessages([]);
      setDiagnostic(null);
      setError('');

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/diagnostic/start`,
        { diagnostic_type: diagnosticType },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setSessionId(response.data.session_id);
      setCurrentQuestion(response.data.question);
      setMessages(prev => [...prev, { type: 'bot', content: response.data.question }]);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login');
      } else if (err.response?.status === 422) {
        setError('Unprocessable Entity: Please verify the request body.');
      } else {
        setError('Error starting the diagnostic');
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear
    router.push("/login")
  }

  const submitAnswer = async (answer: 'yes' | 'no') => {
    try {
      setMessages(prev => [...prev, { type: 'user', content: answer === 'yes' ? 'Yes' : 'No' }]);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/diagnostic/${sessionId}/answer`,
        { answer },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.diagnostic_result) {
        setDiagnostic(response.data.diagnostic_result);
        setCurrentQuestion(null);

        const resultMessage = `
          Diagnosis Result:
          
          Most probable problem: ${response.data.diagnostic_result.most_probable_problem}
          
          ${response.data.diagnostic_result.diagnostic_message}
          
          Probabilities:
          ${Object.entries(response.data.diagnostic_result.probabilities)
            .map(([problem, probability]) =>
              `${problem}: ${(Number(probability) * 100).toFixed(1)}%`
            )
            .join('\n')}
        `;
        setMessages(prev => [...prev, { type: 'bot', content: resultMessage }]);
      } else {
        setCurrentQuestion(response.data.question);
        setMessages(prev => [...prev, { type: 'bot', content: response.data.question }]);
      }
    } catch (err) {
      setError('Error processing the answer');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <img 
            src="https://res.cloudinary.com/dxhi8xsyb/image/upload/v1732209286/pngwing.com_1_fvashd.png" 
            alt="Car Expert System Logo" 
            className="w-12 h-12 rounded-full"
          />
          <h1 className="text-2xl font-bold text-blue-900">Car Expert System</h1>
        </div>
        <nav>
          <button 
            onClick={() => router.push('/history')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
            <span>View History</span>
          </button>
        </nav>
        <nav>
        <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center space-x-2"
          >
            <span>Log Out</span>
          </button>
        </nav>
        
      </header>

      {/* Diagnostic Type Selection */}
      {!sessionId && (
        <main className="flex-1 container mx-auto px-6 py-12 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-extrabold text-blue-900">
              Select Your Diagnostic Type
            </h2>
            <p className="text-xl text-blue-800 leading-relaxed">
              Choose the type of problem you're experiencing with your vehicle. 
              Our intelligent system will guide you through a precise diagnostic process.
            </p>
            
            <div className="space-y-4">
              <select
                value={diagnosticType || ''}
                onChange={(e) => setDiagnosticType(e.target.value)}
                className="w-full border-2 border-blue-600 rounded-lg p-3 text-blue-900"
              >
                <option value="" disabled>Select diagnostic type</option>
                <option value="brake">Brakes</option>
                <option value="start">Starting</option>
                <option value="sound">Strange Sounds</option>
              </select>
              
              <button
                onClick={startDiagnostic}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center space-x-2 shadow-md"
                disabled={!diagnosticType}
              >
                <span>Start Diagnostic</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="hidden md:flex justify-center">
            <img 
              src="/api/placeholder/500/400" 
              alt="Car Diagnostic Illustration" 
              className="rounded-xl shadow-2xl"
            />
          </div>
        </main>
      )}

      {/* Chat Container */}
      {sessionId && (
        <main className="flex-1 container mx-auto px-6 py-12 flex flex-col">
          <div className="flex-1 bg-white rounded-xl shadow-lg p-6 mb-6 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg px-4 py-2 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-50 text-blue-900'
                    }`}
                  >
                    <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {!diagnostic && currentQuestion && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex space-x-4">
                <button
                  onClick={() => submitAnswer('yes')}
                  className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition"
                >
                  Yes
                </button>
                <button
                  onClick={() => submitAnswer('no')}
                  className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition"
                >
                  No
                </button>
              </div>
            </div>
          )}

          {diagnostic && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <button
                onClick={() => {
                  setDiagnosticType(null);
                  setSessionId(null);
                }}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition flex items-center justify-center space-x-2"
              >
                <span>Start New Diagnostic</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </div>
          )}
        </main>
      )}

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