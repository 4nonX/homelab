'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authAPI, portfolioAPI, contactAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Eye, Mail, Upload, Edit, LogOut, Globe } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authAPI.isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = authAPI.getUser();
      setUser(userData);

      // Try to load portfolio
      try {
        const portfolioData = await portfolioAPI.getMyPortfolio();
        setPortfolio(portfolioData);
      } catch (error) {
        // No portfolio yet
      }

      // Load messages
      try {
        const messagesData = await contactAPI.getMessages();
        setMessages(messagesData);
      } catch (error) {
        // No messages
      }
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    router.push('/');
  };

  const togglePublished = async () => {
    try {
      await portfolioAPI.updatePortfolio({ published: !portfolio.published });
      setPortfolio({ ...portfolio, published: !portfolio.published });
      toast.success(portfolio.published ? 'Portfolio unpublished' : 'Portfolio published');
    } catch (error) {
      toast.error('Failed to update portfolio');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Portfolio
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">
                Welcome, <strong>{user?.username}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!portfolio ? (
          /* No Portfolio Yet */
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Upload className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Create Your Portfolio</h2>
            <p className="text-gray-600 mb-6">
              Upload your resume to get started. We'll transform it into a beautiful portfolio.
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Upload className="w-5 h-5" />
              Upload Resume
            </Link>
          </div>
        ) : (
          /* Portfolio Exists */
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Portfolio Views</p>
                    <p className="text-3xl font-bold text-gray-900">{portfolio.views}</p>
                  </div>
                  <Eye className="w-12 h-12 text-blue-600 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Messages</p>
                    <p className="text-3xl font-bold text-gray-900">{messages.length}</p>
                  </div>
                  <Mail className="w-12 h-12 text-purple-600 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Status</p>
                    <p className={`text-3xl font-bold ${portfolio.published ? 'text-green-600' : 'text-yellow-600'}`}>
                      {portfolio.published ? 'Live' : 'Draft'}
                    </p>
                  </div>
                  <Globe className="w-12 h-12 text-green-600 opacity-20" />
                </div>
              </div>
            </div>

            {/* Portfolio Preview */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{portfolio.name}</h2>
                  <p className="text-gray-600">{portfolio.title}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Language: {portfolio.language.toUpperCase()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href="/editor"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>
                  <Link
                    href={`/${user.username}`}
                    target="_blank"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Globe className="w-4 h-4" />
                    View Live
                  </Link>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Your portfolio URL:</p>
                    <p className="font-mono text-blue-600">
                      {window.location.origin}/{user.username}
                    </p>
                  </div>
                  <button
                    onClick={togglePublished}
                    className={`px-4 py-2 rounded-lg font-semibold ${
                      portfolio.published
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {portfolio.published ? 'Unpublish' : 'Publish'}
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <Link
                  href="/upload"
                  className="flex items-center gap-2 text-blue-600 hover:underline"
                >
                  <Upload className="w-4 h-4" />
                  Upload New Resume
                </Link>
              </div>
            </div>

            {/* Messages */}
            {messages.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-4">Recent Messages</h3>
                <div className="space-y-4">
                  {messages.slice(0, 5).map((msg) => (
                    <div key={msg.id} className="border-l-4 border-blue-600 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{msg.sender_name}</p>
                          <p className="text-sm text-gray-600">{msg.sender_email}</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(msg.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="mt-2 text-gray-700">{msg.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
