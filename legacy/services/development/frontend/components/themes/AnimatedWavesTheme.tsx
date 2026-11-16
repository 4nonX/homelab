import { Mail, MapPin, ExternalLink } from 'lucide-react';

export default function AnimatedWavesTheme({ portfolio, labels, onContactClick }: any) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Wave Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg
          className="absolute bottom-0 w-full"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="rgba(59, 130, 246, 0.1)"
            d="M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,133.3C672,117,768,107,864,112C960,117,1056,139,1152,144C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          >
            <animate
              attributeName="d"
              dur="10s"
              repeatCount="indefinite"
              values="
                M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,133.3C672,117,768,107,864,112C960,117,1056,139,1152,144C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                M0,128L48,133.3C96,139,192,149,288,144C384,139,480,117,576,112C672,107,768,117,864,128C960,139,1056,149,1152,149.3C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,133.3C672,117,768,107,864,112C960,117,1056,139,1152,144C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </path>
        </svg>
        <svg
          className="absolute bottom-0 w-full"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="rgba(99, 102, 241, 0.05)"
            d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,149.3C672,139,768,149,864,170.7C960,192,1056,224,1152,224C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          >
            <animate
              attributeName="d"
              dur="15s"
              repeatCount="indefinite"
              values="
                M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,149.3C672,139,768,149,864,170.7C960,192,1056,224,1152,224C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                M0,192L48,181.3C96,171,192,149,288,154.7C384,160,480,192,576,202.7C672,213,768,203,864,181.3C960,160,1056,128,1152,128C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,149.3C672,139,768,149,864,170.7C960,192,1056,224,1152,224C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </path>
        </svg>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 animate-fade-in">
              {portfolio.name}
            </h1>
            <p className="text-2xl text-indigo-600 font-semibold mb-6 animate-fade-in-delay">
              {portfolio.title}
            </p>

            {portfolio.location && (
              <div className="flex items-center justify-center gap-2 text-gray-600 mb-6">
                <MapPin className="w-4 h-4" />
                <span>{portfolio.location}</span>
              </div>
            )}

            {portfolio.show_contact && (
              <div className="flex flex-wrap justify-center gap-4">
                {portfolio.email && (
                  <a
                    href={`mailto:${portfolio.email}`}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transform hover:scale-105 transition-all shadow-lg"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </a>
                )}
                <button
                  onClick={onContactClick}
                  className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-full hover:bg-indigo-50 transform hover:scale-105 transition-all"
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
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 transform hover:scale-[1.02] transition-all">
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
                    className="px-5 py-2 bg-white/80 backdrop-blur-sm text-indigo-700 rounded-full font-medium shadow-md hover:shadow-lg transform hover:scale-110 transition-all"
                    style={{
                      animation: `float ${3 + (index % 3)}s ease-in-out infinite`,
                      animationDelay: `${index * 0.1}s`
                    }}
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
                  <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 transform hover:scale-[1.02] transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {job.position}
                        </h3>
                        <p className="text-indigo-600 font-semibold">{job.company}</p>
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

        {/* Education, Projects, Languages - similar styling */}
        {portfolio.education && portfolio.education.length > 0 && (
          <section className="py-12 px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                {labels.education}
              </h2>
              <div className="space-y-6">
                {portfolio.education.map((edu: any, index: number) => (
                  <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{edu.degree}</h3>
                        <p className="text-indigo-600 font-semibold">{edu.institution}</p>
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

        {portfolio.projects && portfolio.projects.length > 0 && (
          <section className="py-12 px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">{labels.projects}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {portfolio.projects.map((project: any, index: number) => (
                  <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{project.name}</h3>
                    {project.description && <p className="text-gray-700 mb-4">{project.description}</p>}
                    {project.technologies && <p className="text-sm text-indigo-600 font-medium mb-2">{project.technologies}</p>}
                    {project.url && (
                      <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1">
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
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{labels.languages}</h2>
              <div className="flex flex-wrap gap-4 justify-center">
                {portfolio.languages_spoken.map((lang: any, index: number) => (
                  <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 min-w-[150px] text-center transform hover:scale-110 transition-all">
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
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.2s both;
        }
      `}</style>
    </div>
  );
}
