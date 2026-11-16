'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authAPI, portfolioAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Upload, FileText, ArrowLeft, Loader2 } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (!authAPI.isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        setFile(file);
      } else {
        toast.error('Please upload a PDF file');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setFile(file);
      } else {
        toast.error('Please upload a PDF file');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);

    try {
      await portfolioAPI.uploadResume(file);
      toast.success('Resume uploaded and parsed successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Upload error:', error);
      let errorMsg = 'Failed to upload resume';
      
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMsg = error.response.data.detail;
        } else {
          errorMsg = JSON.stringify(error.response.data.detail);
        }
      } else if (Array.isArray(error.response?.data)) {
        // FastAPI validation errors - extract 'msg' field from each object
        const messages = error.response.data
          .map((e: any) => e.msg || JSON.stringify(e))
          .filter((msg: string) => msg && msg !== '[object Object]');
        errorMsg = messages.length > 0 ? messages.join(', ') : 'Validation error';
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      toast.error(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Portfolio
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upload Your Resume
          </h1>
          <p className="text-xl text-gray-600">
            We will transform it into a beautiful portfolio in seconds
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition cursor-pointer ${
                dragActive
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleChange}
                className="hidden"
              />

              {file ? (
                <div className="space-y-4">
                  <FileText className="w-16 h-16 text-blue-600 mx-auto" />
                  <div>
                    <p className="font-semibold text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-16 h-16 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      Drop your resume here, or click to browse
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Only PDF files are supported
                    </p>
                  </div>
                </div>
              )}
            </div>

            {file && (
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>Upload and Generate Portfolio</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>

          <div className="mt-8 pt-8 border-t">
            <h3 className="font-semibold mb-3">What happens next?</h3>
            <ol className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">1.</span>
                <span>We will extract and analyze your resume content</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">2.</span>
                <span>AI will structure your information into a professional portfolio</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">3.</span>
                <span>Your portfolio will be automatically generated and ready to customize</span>
              </li>
            </ol>
          </div>

          <div className="mt-8 text-center text-gray-600">
            <p className="text-sm">
              Your resume will be processed securely. We detect the language automatically and preserve it in your portfolio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
