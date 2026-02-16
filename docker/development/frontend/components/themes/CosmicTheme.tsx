import { Mail, MapPin, ExternalLink } from 'lucide-react';

export default function CosmicTheme({ portfolio, labels, onContactClick }: any) {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Stars Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Stars */}
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animation: `twinkle ${Math.random() * 5 + 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.7 + 0.3
            }}
          />
        ))}
        
        {/* Nebula Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
          <div className="absolute top-40 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }}></div>
        </div>
      </div>

      <div className="relative z-10">
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg" style={{ textShadow: '0 0 30px rgba(147, 51, 234, 0.5)' }}>
              {portfolio.name}
            </h1>
            <p className="text-2xl text-blue-300 font-semibold mb-6" style={{ textShadow: '0 0 20px rgba(59, 130, 246, 0.5)' }}>
              {portfolio.title}
            </p>

            {portfolio.location && (
              <div className="flex items-center justify-center gap-2 text-blue-200 mb-6">
                <MapPin className="w-4 h-4" />
                <span>{portfolio.location}</span>
              </div>
            )}

            {portfolio.show_contact && (
              <div className="flex flex-wrap justify-center gap-4">
                {portfolio.email && (
                  <a
                    href={`mailto:${portfolio.email}`}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600/20 backdrop-blur-md border border-blue-500/40 text-white rounded-lg hover:bg-blue-600/30 transform hover:scale-105 transition-all shadow-lg shadow-blue-500/30"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </a>
                )}
                <button
                  onClick={onContactClick}
                  className="px-6 py-3 bg-purple-600/20 backdrop-blur-md border border-purple-500/40 text-white rounded-lg hover:bg-purple-600/30 transform hover:scale-105 transition-all shadow-lg shadow-purple-500/30"
                >
                  {labels.contact}
                </button>
              </div>
            )}
          </div>
        </section>

        {portfolio.summary && (
          <section className="py-12 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-950/60 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-blue-500/20">
                <h2 className="text-3xl font-bold text-white mb-6">{labels.about}</h2>
                <p className="text-gray-200 text-lg leading-relaxed whitespace-pre-wrap">{portfolio.summary}</p>
              </div>
            </div>
          </section>
        )}

        {portfolio.skills && portfolio.skills.length > 0 && (
          <section className="py-12 px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">{labels.skills}</h2>
              <div className="flex flex-wrap gap-3 justify-center">
                {portfolio.skills.map((skill: string, index: number) => (
                  <span 
                    key={index} 
                    className="px-5 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md border border-blue-500/30 text-blue-200 rounded-full font-medium shadow-lg hover:from-blue-600/30 hover:to-purple-600/30 transform hover:scale-110 transition-all"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {portfolio.experience && portfolio.experience.length > 0 && (
          <section className="py-12 px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-8">{labels.experience}</h2>
              <div className="space-y-6">
                {portfolio.experience.map((job: any, index: number) => (
                  <div key={index} className="bg-gray-950/60 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-purple-500/20">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">{job.position}</h3>
                        <p className="text-blue-300 font-semibold">{job.company}</p>
                        {job.location && <p className="text-gray-400 text-sm">{job.location}</p>}
                      </div>
                      <div className="text-right text-sm text-gray-400">
                        <p>{job.start_date}</p>
                        <p>{job.end_date}</p>
                      </div>
                    </div>
                    {job.description && <p className="text-gray-200 whitespace-pre-wrap">{job.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {portfolio.education && portfolio.education.length > 0 && (
          <section className="py-12 px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-8">{labels.education}</h2>
              <div className="space-y-6">
                {portfolio.education.map((edu: any, index: number) => (
                  <div key={index} className="bg-gray-950/60 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-pink-500/20">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-white">{edu.degree}</h3>
                        <p className="text-blue-300 font-semibold">{edu.institution}</p>
                        {edu.location && <p className="text-gray-400 text-sm">{edu.location}</p>}
                      </div>
                      <div className="text-right text-sm text-gray-400">
                        <p>{edu.start_date}</p>
                        <p>{edu.end_date}</p>
                      </div>
                    </div>
                    {edu.description && <p className="mt-4 text-gray-200">{edu.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {portfolio.projects && portfolio.projects.length > 0 && (
          <section className="py-12 px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-8">{labels.projects}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {portfolio.projects.map((project: any, index: number) => (
                  <div key={index} className="bg-gray-950/60 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-blue-500/20 transform hover:scale-105 transition-all">
                    <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
                    {project.description && <p className="text-gray-200 mb-4">{project.description}</p>}
                    {project.technologies && <p className="text-sm text-purple-300 font-medium mb-2">{project.technologies}</p>}
                    {project.url && (
                      <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline flex items-center gap-1">
                        View Project <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {portfolio.languages_spoken && portfolio.languages_spoken.length > 0 && (
          <section className="py-12 px-4 mb-20">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">{labels.languages}</h2>
              <div className="flex flex-wrap gap-4 justify-center">
                {portfolio.languages_spoken.map((lang: any, index: number) => (
                  <div key={index} className="bg-gray-950/60 backdrop-blur-md rounded-xl shadow-xl p-4 min-w-[150px] text-center border border-purple-500/20">
                    <p className="font-semibold text-white">{lang.language}</p>
                    <p className="text-sm text-gray-400">{lang.proficiency}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
