import { Mail, MapPin, ExternalLink } from 'lucide-react';

export default function AnimatedGradientTheme({ portfolio, labels, onContactClick }: any) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 opacity-30" 
           style={{
             animation: 'gradient 15s ease infinite',
             backgroundSize: '400% 400%'
           }}>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-12 shadow-2xl">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
                {portfolio.name}
              </h1>
              <p className="text-2xl text-purple-700 font-semibold mb-6">
                {portfolio.title}
              </p>

              {portfolio.location && (
                <div className="flex items-center justify-center gap-2 text-gray-700 mb-6">
                  <MapPin className="w-4 h-4" />
                  <span>{portfolio.location}</span>
                </div>
              )}

              {portfolio.show_contact && (
                <div className="flex flex-wrap justify-center gap-4">
                  {portfolio.email && (
                    <a
                      href={`mailto:${portfolio.email}`}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all shadow-lg"
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </a>
                  )}
                  <button
                    onClick={onContactClick}
                    className="px-6 py-3 bg-white/50 backdrop-blur-sm border-2 border-purple-600 text-purple-700 rounded-full hover:bg-white/70 transform hover:scale-105 transition-all"
                  >
                    {labels.contact}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* About */}
        {portfolio.summary && (
          <section className="py-12 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  {labels.about}
                </h2>
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
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
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                {labels.skills}
              </h2>
              <div className="flex flex-wrap gap-3 justify-center">
                {portfolio.skills.map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="px-5 py-2 bg-white/70 backdrop-blur-md text-purple-700 rounded-full font-medium shadow-lg hover:shadow-xl transform hover:scale-110 transition-all border border-purple-200"
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
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                {labels.experience}
              </h2>
              <div className="space-y-6">
                {portfolio.experience.map((job: any, index: number) => (
                  <div key={index} className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {job.position}
                        </h3>
                        <p className="text-purple-700 font-semibold">{job.company}</p>
                        {job.location && (
                          <p className="text-gray-600 text-sm">{job.location}</p>
                        )}
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <p>{job.start_date}</p>
                        <p>{job.end_date}</p>
                      </div>
                    </div>
                    {job.description && (
                      <p className="text-gray-700 whitespace-pre-wrap">
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
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                {labels.education}
              </h2>
              <div className="space-y-6">
                {portfolio.education.map((edu: any, index: number) => (
                  <div key={index} className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{edu.degree}</h3>
                        <p className="text-purple-700 font-semibold">{edu.institution}</p>
                        {edu.location && <p className="text-gray-600 text-sm">{edu.location}</p>}
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <p>{edu.start_date}</p>
                        <p>{edu.end_date}</p>
                      </div>
                    </div>
                    {edu.description && <p className="mt-4 text-gray-700">{edu.description}</p>}
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
              <h2 className="text-3xl font-bold text-gray-900 mb-8">{labels.projects}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {portfolio.projects.map((project: any, index: number) => (
                  <div key={index} className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl p-6 transform hover:scale-105 transition-all">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{project.name}</h3>
                    {project.description && <p className="text-gray-700 mb-4">{project.description}</p>}
                    {project.technologies && <p className="text-sm text-purple-700 font-medium mb-2">{project.technologies}</p>}
                    {project.url && (
                      <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:underline flex items-center gap-1">
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
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{labels.languages}</h2>
              <div className="flex flex-wrap gap-4 justify-center">
                {portfolio.languages_spoken.map((lang: any, index: number) => (
                  <div key={index} className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-4 min-w-[150px] text-center">
                    <p className="font-semibold text-gray-900">{lang.language}</p>
                    <p className="text-sm text-gray-600">{lang.proficiency}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
