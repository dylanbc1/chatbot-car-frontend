// app/history/page.tsx
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
        setError('Error al cargar el historial');
      }
    };

    fetchSessions();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Diagnosis History
          </h2>
          <Link
            href="/diagnostic"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            New Diagnosis
          </Link>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No previous diagnosis</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedSession(
                    selectedSession?.id === session.id ? null : session
                  )}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Diagnosis #{session.id}
                    </h3>
                    <span className="text-indigo-600">
                      {selectedSession?.id === session.id ? '▼' : '▶'}
                    </span>
                  </div>
                  
                  <div className="text-gray-700 mb-4">
                    <p className="font-medium">Problema Diagnosticado:</p>
                    <p>{session.diagnostic_result.most_probable_problem}</p>
                  </div>

                  {selectedSession?.id === session.id && (
                    <div className="mt-4 space-y-6">
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-900 mb-3">
                          Conversation
                        </h4>
                        <div className="space-y-3">
                          {session.conversation.map((item: any, index: any) => (
                            <div
                              key={index}
                              className="grid grid-cols-[auto,1fr] gap-4 text-sm"
                            >
                              <span className="font-medium text-gray-700">P:</span>
                              <span className="text-gray-700">{item.question}</span>
                              <span className="font-medium text-gray-700">R:</span>
                              <span className="capitalize text-gray-700">{item.answer}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-900 mb-3">
                          Detailed Result
                        </h4>
                        <p className="text-gray-700 mb-3">
                          {session.diagnostic_result.diagnostic_message}
                        </p>
                        <div className="space-y-2">
                          {Object.entries(session.diagnostic_result.probabilities).map(([problem, probability]) => (
                            <div key={problem} className="flex justify-between text-sm">
                              <span className="text-gray-700">{problem}</span>
                              <span className="font-medium">
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
    </div>
  );
}