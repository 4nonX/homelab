'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function PortfolioPage() {
  const params = useParams();
  const username = params.username as string;
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/api/portfolio/${username}`)
      .then(res => setPortfolio(res.data))
      .catch(() => setPortfolio(null))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return <div className="min-h-screen bg-[#0F1419] text-white flex items-center justify-center">Loading...</div>;
  if (!portfolio) return <div className="min-h-screen bg-[#0F1419] text-white flex items-center justify-center">Portfolio not found</div>;

  return (
    <div className="min-h-screen bg-[#0F1419] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        
        {/* Header */}
        <div className="text-center mb-16">
          {portfolio.profile_photo && (
            <div className="flex justify-center mb-6">
              <img 
                src={portfolio.profile_photo} 
                alt={portfolio.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-700 shadow-xl"
              />
            </div>
          )}
          <h1 className="text-5xl font-bold mb-4">{portfolio.name}</h1>
          {portfolio.title && <p className="text-xl text-gray-300">{portfolio.title}</p>}
          {portfolio.location && <p className="mt-2 text-gray-400">📍 {portfolio.location}</p>}
        </div>

        {/* Summary */}
        {portfolio.summary && (
          <div className="mb-16 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Über mich</h2>
            <p className="text-gray-300 leading-relaxed">{portfolio.summary}</p>
          </div>
        )}

        {/* Projects - Responsive Grid */}
        {portfolio.projects && portfolio.projects.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Projekte</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
              {portfolio.projects.map((proj: any, i: number) => (
                <div 
                  key={i} 
                  className="w-full max-w-sm bg-[#1C2128] border border-gray-700 rounded-xl overflow-hidden hover:border-gray-600 transition-colors"
                >
                  {proj.image && (
                    <div className="relative w-full h-48 bg-gray-800">
                      <img 
                        src={proj.image} 
                        alt={proj.name}
                        className="w-full h-full object-cover"
                      />
                      {proj.status && (
                        <div className="absolute top-3 right-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            proj.status === 'Live' ? 'bg-green-600 text-white' :
                            proj.status === 'In Progress' ? 'bg-yellow-600 text-white' :
                            'bg-gray-600 text-white'
                          }`}>
                            {proj.status}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{proj.name}</h3>
                        {proj.category && (
                          <p className="text-sm text-gray-400">{proj.category}</p>
                        )}
                      </div>
                      {proj.date && (
                        <p className="text-xs text-gray-500">{proj.date}</p>
                      )}
                    </div>

                    {proj.description && (
                      <p className="text-gray-300 text-sm mb-4 line-clamp-3">{proj.description}</p>
                    )}

                    {proj.technologies && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {proj.technologies.split(',').map((tech: string, idx: number) => (
                          <span 
                            key={idx}
                            className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs border border-gray-700"
                          >
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {proj.url && (
                      <a 
                        href={proj.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm font-medium"
                      >
                        View Project →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {portfolio.experience && portfolio.experience.length > 0 && (
          <div className="mb-16 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Berufserfahrung</h2>
            <div className="space-y-8">
              {portfolio.experience.map((exp: any, i: number) => (
                <div key={i} className="border-l-2 border-blue-500 pl-6">
                  <h3 className="text-xl font-bold text-white">{exp.position}</h3>
                  <p className="text-blue-400 font-medium">{exp.company}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {exp.start_date} - {exp.end_date} • {exp.location}
                  </p>
                  {exp.description && (
                    <p className="text-gray-300 mt-3 leading-relaxed">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {portfolio.education && portfolio.education.length > 0 && (
          <div className="mb-16 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Ausbildung</h2>
            <div className="space-y-8">
              {portfolio.education.map((edu: any, i: number) => (
                <div key={i} className="border-l-2 border-purple-500 pl-6">
                  <h3 className="text-xl font-bold text-white">{edu.degree}</h3>
                  <p className="text-purple-400 font-medium">{edu.institution}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {edu.start_date} - {edu.end_date} {edu.location && `• ${edu.location}`}
                  </p>
                  {edu.description && (
                    <p className="text-gray-300 mt-3 leading-relaxed">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {portfolio.skills && portfolio.skills.length > 0 && (
          <div className="mb-16 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Fähigkeiten</h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {portfolio.skills.map((skill: string, i: number) => (
                <span key={i} className="px-4 py-2 bg-blue-600/20 text-blue-300 rounded-full border border-blue-500/30">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {portfolio.languages_spoken && portfolio.languages_spoken.length > 0 && (
          <div className="mb-16 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Sprachen</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {portfolio.languages_spoken.map((lang: any, i: number) => (
                <div key={i} className="p-4 bg-[#1C2128] border border-gray-700 rounded-lg text-center">
                  <p className="font-bold text-white">{lang.language}</p>
                  <p className="text-sm text-gray-400 mt-1">{lang.proficiency}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {portfolio.certifications && portfolio.certifications.length > 0 && (
          <div className="mb-16 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Zertifizierungen</h2>
            <div className="space-y-4">
              {portfolio.certifications.map((cert: any, i: number) => (
                <div key={i} className="p-4 bg-[#1C2128] border border-gray-700 rounded-lg">
                  <h3 className="font-bold text-white">{cert.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {cert.issuer && `${cert.issuer}`}
                    {cert.issuer && cert.date && ' • '}
                    {cert.date && cert.date}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        {portfolio.email && (
          <div className="text-center mt-16">
            <a 
              href={`mailto:${portfolio.email}`}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg inline-block font-semibold"
            >
              Kontakt
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
