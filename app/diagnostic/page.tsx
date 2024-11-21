'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import local from 'next/font/local';
import { cookies } from 'next/headers';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    startDiagnostic();
  }, []);

  const startDiagnostic = async () => {
    try {
      setMessages([]);
      setDiagnostic(null);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/diagnostic/start`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      
      setSessionId(response.data.session_id);
      setCurrentQuestion(response.data.question);
      setMessages(prev => [...prev, { type: 'bot', content: response.data.question }]);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login');
      }
      setError('Error al iniciar el diagnóstico');
    }
  };

  const submitAnswer = async (answer: 'yes' | 'no') => {
    try {
      setMessages(prev => [...prev, { 
        type: 'user', 
        content: answer === 'yes' ? 'Sí' : 'No' 
      }]);

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
        
        // Add diagnostic result to chat
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
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Brake Diagnosis
          </h2>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col">
        {/* Messages Area */}
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

        {/* Actions Area */}
        {!diagnostic && currentQuestion && (
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex space-x-4">
              <button
                onClick={() => submitAnswer('yes')}
                className="flex-1 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Yes
              </button>
              <button
                onClick={() => submitAnswer('no')}
                className="flex-1 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                No
              </button>
            </div>
          </div>
        )}

        {/* New Diagnostic Button */}
        {diagnostic && (
          <div className="bg-white rounded-lg shadow-lg p-4">
            <button
              onClick={startDiagnostic}
              className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Start New Diagnosis
            </button>
          </div>
        )}
      </div>
    </div>
  );
}