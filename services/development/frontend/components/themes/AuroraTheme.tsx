import { Mail, MapPin, ExternalLink } from 'lucide-react';

export default function AuroraTheme({ portfolio, labels, onContactClick }: any) {
  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Aurora Background Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="aurora-layer aurora-1"></div>
        <div className="aurora-layer aurora-2"></div>
        <div className="aurora-layer aurora-3"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              {portfolio.name}
            </h1>
            <p className="text-2xl text-cyan-300 font-semibold mb-6">
              {portfolio.title}
            </p>

            {portfolio.location && (
              <div className="flex items-center justify-center gap-2 text-cyan-200 mb-6">
                <MapPin className="w-4 h-4" />
                <span>{portfolio.location}</span>
              </div>
            )}

            {portfolio.show_contact && (
              <div className="flex flex-wrap justify-center gap-4">
                {portfolio.email && (
                  <a
                    href={`mailto:${portfolio.email}`}
                    className="flex items-center gap-2 px-6 py-3 bg-cyan-500/20 backdrop-blur-md border border-cyan-400/50 text-white rounded-lg hover:bg-cyan-500/30 transform hover:scale-105 transition-all shadow-lg shadow-cyan-500/20"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </a>
                )}
                <button
                  onClick={onContactClick}
                  className="px-6 py-3 bg-purple-500/20 backdrop-blur-md border border-purple-400/50 text-white rounded-lg hover:bg-purple-500/30 transform hover:scale-105 transition-all"
                >
                  {labels.contact}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* About */}
        {portfolio.summary && (
          <section className="py-12 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-cyan-500/20">
                <h2 className="text-3xl font-bold text-white mb-6">
                  {labels.about}
                </h2>
                <p className="text-gray-200 text-lg leading-relaxed whitespace-pre-wrap">
                  {portfolio.summary}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Skills */}
        {portfolio.skills && portfolio.skills.length > 0 && (
          <section className="py-12 px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">
                {labels.skills}
              </h2>
              <div className="flex flex-wrap gap-3 justify-center">
                {portfolio.skills.map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="px-5 py-2 bg-cyan-500/20 backdrop-blur-md border border-cyan-400/30 text-cyan-200 rounded-full font-medium shadow-lg hover:bg-cyan-500/30 transform hover:scale-110 transition-all"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Experience */}
        {portfolio.experience && portfolio.experience.length > 0 && (
          <section className="py-12 px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-8">
                {labels.experience}
              </h2>
              <div className="space-y-6">
                {portfolio.experience.map((job: any, index: number) => (
                  <div key={index} className="bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-purple-500/20">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {job.position}
                        </h3>
                        <p className="text-cyan-300 font-semibold">{job.company}</p>
                        {job.location && (
                          <p className="text-gray-400 text-sm">{job.location}</p>
                        )}
                      </div>
                      <div className="text-right text-sm text-gray-400">
                        <p>{job.start_date}</p>
                        <p>{job.end_date}</p>
                      </div>
                    </div>
                    {job.description && (
                      <p className="text-gray-200 whitespace-pre-wrap">
                        {job.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Education */}
        {portfolio.education && portfolio.education.length > 0 && (
          <section className="py-12 px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-8">
                {labels.education}
              </h2>
              <div className="space-y-6">
                {portfolio.education.map((edu: any, index: number) => (
                  <div key={index} className="bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-purple-500/20">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-white">{edu.degree}</h3>
                        <p className="text-cyan-300 font-semibold">{edu.institution}</p>
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

        {/* Projects */}
        {portfolio.projects && portfolio.projects.length > 0 && (
          <section className="py-12 px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-8">{labels.projects}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {portfolio.projects.map((project: any, index: number) => (
                  <div key={index} className="bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-cyan-500/20 transform hover:scale-105 transition-all">
                    <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
                    {project.description && <p className="text-gray-200 mb-4">{project.description}</p>}
                    {project.technologies && <p className="text-sm text-cyan-300 font-medium mb-2">{project.technologies}</p>}
                    {project.url && (
                      <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:underline flex items-center gap-1">
                        View Project <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Languages */}
        {portfolio.languages_spoken && portfolio.languages_spoken.length > 0 && (
          <section className="py-12 px-4 mb-20">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">{labels.languages}</h2>
              <div className="flex flex-wrap gap-4 justify-center">
                {portfolio.languages_spoken.map((lang: any, index: number) => (
                  <div key={index} className="bg-slate-800/50 backdrop-blur-md rounded-xl shadow-xl p-4 min-w-[150px] text-center border border-purple-500/20">
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
        .aurora-layer {
          position: absolute;
          width: 200%;
          height: 200%;
          top: -50%;
          left: -50%;
          opacity: 0.3;
        }
        .aurora-1 {
          background: radial-gradient(ellipse at center, rgba(6, 182, 212, 0.5) 0%, transparent 50%);
          animation: aurora-drift 20s ease-in-out infinite;
        }
        .aurora-2 {
          background: radial-gradient(ellipse at center, rgba(168, 85, 247, 0.4) 0%, transparent 50%);
          animation: aurora-drift 25s ease-in-out infinite reverse;
          animation-delay: -5s;
        }
        .aurora-3 {
          background: radial-gradient(ellipse at center, rgba(59, 130, 246, 0.3) 0%, transparent 50%);
          animation: aurora-drift 30s ease-in-out infinite;
          animation-delay: -10s;
        }
        @keyframes aurora-drift {
          0%, 100% {
            transform: translate(0%, 0%) rotate(0deg);
          }
          25% {
            transform: translate(10%, 5%) rotate(90deg);
          }
          50% {
            transform: translate(-5%, 10%) rotate(180deg);
          }
          75% {
            transform: translate(-10%, -5%) rotate(270deg);
          }
        }
      `}</style>
    </div>
  );
}
