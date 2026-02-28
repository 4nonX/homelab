'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { portfolioAPI } from '@/lib/api';
import { Eye, User } from 'lucide-react';

export default function PortfoliosPage() {
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = async () => {
    try {
      const data = await portfolioAPI.listPortfolios(50, 0);
      setPortfolios(data);
    } catch (error) {
      console.error('Failed to load portfolios');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Portfolio
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your Portfolio
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Portfolio Showcase
          </h1>
          <p className="text-xl text-gray-600">
            Discover amazing portfolios created with Portfolio
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-600">Loading portfolios...</div>
          </div>
        ) : portfolios.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-6">
              No portfolios yet. Be the first!
            </p>
            <Link
              href="/register"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your Portfolio
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolios.map((portfolio) => (
              <Link
                key={portfolio.username}
                href={`/${portfolio.username}`}
                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition p-6 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition">
                      {portfolio.name}
                    </h3>
                    <p className="text-gray-600 mt-1">{portfolio.title}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      @{portfolio.username}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{portfolio.views} views</span>
                  </div>
                  <span>
                    {new Date(portfolio.created_at).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
