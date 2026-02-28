'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { Upload, Zap, Globe, Sparkles } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(authAPI.isAuthenticated());
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                Portfolio
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/portfolios" className="text-gray-700 hover:text-blue-600">
                Showcase
              </Link>
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-gray-700 hover:text-blue-600">
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Build Your Professional
            <br />
            <span className="text-blue-600">Portfolio in Minutes</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your resume into a polished, professional portfolio.
            No coding required—just upload and publish.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href={isAuthenticated ? '/upload' : '/register'}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
            >
              Upload Resume
            </Link>
            <Link
              href="/portfolios"
              className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg text-lg font-semibold hover:bg-blue-50 transition"
            >
              View Portfolios
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Free</h3>
              <p className="text-gray-600">
                Forever free hosting available. Transparent pricing.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rapid Setup</h3>
              <p className="text-gray-600">
                Launch in Under 2 Minutes. Just upload your resume.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multi-Language</h3>
              <p className="text-gray-600">
                Automatically detects and preserves your resume's language.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="space-y-16">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">
                  Effortless Creation
                </h3>
                <p className="text-gray-600 text-lg mb-4">
                  AI-powered resume to portfolio in minutes
                </p>
                <p className="text-gray-600">
                  Stop wrestling with complex code or tedious design. This tool instantly
                  transforms your resume into a stunning, professional portfolio website.
                  Just upload your PDF, and watch your experience come to life.
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl p-12 text-center">
                <Sparkles className="w-24 h-24 text-blue-600 mx-auto" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl p-12 text-center">
                <Globe className="w-24 h-24 text-purple-600 mx-auto" />
              </div>
              <div className="order-1 md:order-2">
                <h3 className="text-2xl font-bold mb-4">
                  Showcase Your Unique Aptitude
                </h3>
                <p className="text-gray-600 text-lg mb-4">
                  Your story, perfectly told
                </p>
                <p className="text-gray-600">
                  The tool offers intuitive customization options that allow you to
                  fine-tune every detail, ensuring your personality and professional
                  aptitude shine through.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Claim Your Portfolio Domain
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Secure your unique subdomain today. It's free, professional, and takes
            seconds to set up.
          </p>
          <div className="flex justify-center items-center gap-2 mb-8">
            <input
              type="text"
              placeholder="your-name"
              className="px-4 py-3 rounded-l-lg text-gray-900 w-64"
              disabled
            />
            <span className="px-4 py-3 bg-blue-700 rounded-r-lg">
              .portfolio.local
            </span>
          </div>
          <Link
            href={isAuthenticated ? '/upload' : '/register'}
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg text-lg font-semibold hover:bg-gray-100 transition"
          >
            Create Portfolio
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Portfolio Builder</h3>
              <p className="text-gray-400">
                Create. Customize. Share.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/portfolios" className="hover:text-white">Showcase</Link></li>
                <li><Link href="/register" className="hover:text-white">Get Started</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2026 Portfolio Builder - Private Use</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
