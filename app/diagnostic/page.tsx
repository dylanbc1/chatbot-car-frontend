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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Car Diagnostic System</h2>
          <button
            onClick={() => router.push('/history')}
            className="py-2 px-4 bg-indigo-600 text-white rounded-md shadow-md hover:bg-indigo-700"
          >
            See History of Conversations
          </button>
        </div>
      </div>

      {/* Diagnostic Type Selection */}
      {!sessionId && (
        <div className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col items-center justify-center space-y-6">
          <h3 className="text-xl text-black font-semibold">Select the type of problem:</h3>
          <select
            value={diagnosticType || ''}
            onChange={(e) => setDiagnosticType(e.target.value)}
            className="border rounded-md p-2 w-1/2 text-gray-900"
          >
            <option value="" disabled>Select diagnostic type</option>
            <option value="brake">Brakes</option>
            <option value="start">Starting</option>
            <option value="sound">Strange Sounds</option>
          </select>
          <button
            onClick={startDiagnostic}
            className="py-3 px-6 bg-indigo-600 text-white rounded-md shadow-md hover:bg-indigo-700"
            disabled={!diagnosticType}
          >
            Start Diagnostic
          </button>
        </div>
      )}

      {/* Chat Container */}
      {sessionId && (
        <div className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col">
          <div className="flex-1 bg-white rounded-lg shadow-lg p-4 mb-4 overflow-y-auto">
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
                        : 'bg-gray-100 text-gray-900'
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
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex space-x-4">
                <button
                  onClick={() => submitAnswer('yes')}
                  className="flex-1 py-3 px-4 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700"
                >
                  Yes
                </button>
                <button
                  onClick={() => submitAnswer('no')}
                  className="flex-1 py-3 px-4 bg-red-600 text-white rounded-md shadow-md hover:bg-red-700"
                >
                  No
                </button>
              </div>
            </div>
          )}

          {diagnostic && (
            <div className="bg-white rounded-lg shadow-lg p-4">
              <button
                onClick={() => {
                  setDiagnosticType(null);
                  setSessionId(null);
                }}
                className="w-full py-3 px-4 bg-indigo-600 text-white rounded-md shadow-md hover:bg-indigo-700"
              >
                Start New Diagnostic
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
