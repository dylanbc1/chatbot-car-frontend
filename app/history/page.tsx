'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

export default function HistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<DiagnosticSession[]>([]);
  const [error, setError] = useState('');
  const [selectedSession, setSelectedSession] = useState<DiagnosticSession | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.post<DiagnosticSession[]>(
          `${process.env.NEXT_PUBLIC_API_URL}/api/diagnostic/sessions`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        setSessions(response.data);
      } catch (err: any) {
        if (err.response?.status === 401) {
          router.push('/login');
        }
        setError('Error loading diagnostic history');
      }
    };

    fetchSessions();
  }, []);

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
          <Link
            href="/diagnostic"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
            <span>New Diagnostic</span>
          </Link>
        </nav>
      </header>

      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-extrabold text-blue-900 mb-8">
            Diagnosis History
          </h2>

          {sessions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
              <p className="text-blue-800 text-xl">No previous diagnostics found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                  <div
                    className="p-6 cursor-pointer hover:bg-blue-50 transition"
                    onClick={() => setSelectedSession(
                      selectedSession?.id === session.id ? null : session
                    )}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-blue-900">
                        Diagnosis #{session.id}
                      </h3>
                      <span className="text-blue-600">
                        {selectedSession?.id === session.id ? '▼' : '▶'}
                      </span>
                    </div>
                    
                    <div className="text-blue-800 mb-4">
                      <p className="font-medium">Diagnosed Problem:</p>
                      <p>{session.diagnostic_result.most_probable_problem}</p>
                    </div>

                    {selectedSession?.id === session.id && (
                      <div className="mt-4 space-y-6">
                        <div className="border-t pt-4">
                          <h4 className="font-medium text-blue-900 mb-3">
                            Conversation
                          </h4>
                          <div className="space-y-3">
                            {session.conversation.map((item: any, index: any) => (
                              <div
                                key={index}
                                className="grid grid-cols-[auto,1fr] gap-4 text-sm"
                              >
                                <span className="font-medium text-blue-700">Q:</span>
                                <span className="text-blue-800">{item.question}</span>
                                <span className="font-medium text-blue-700">A:</span>
                                <span className="capitalize text-blue-800">{item.answer}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <h4 className="font-medium text-blue-900 mb-3">
                            Detailed Result
                          </h4>
                          <p className="text-blue-800 mb-3">
                            {session.diagnostic_result.diagnostic_message}
                          </p>
                          <div className="space-y-2">
                            {Object.entries(session.diagnostic_result.probabilities).map(([problem, probability]) => (
                              <div key={problem} className="flex justify-between text-sm">
                                <span className="text-blue-800">{problem}</span>
                                <span className="font-medium text-blue-900">
                                  {(Number(probability) * 100).toFixed(1)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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