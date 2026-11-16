import { Mail, MapPin, ExternalLink } from 'lucide-react';

export default function DarkForestTheme({ portfolio, labels, onContactClick }: any) {
  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
      {/* Animated Forest Mist */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg
          className="absolute bottom-0 w-full opacity-20"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="rgba(16, 185, 129, 0.25)"
            d="M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,133.3C672,117,768,107,864,112C960,117,1056,139,1152,144C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          >
            <animate
              attributeName="d"
              dur="16s"
              repeatCount="indefinite"
              values="
                M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,133.3C672,117,768,107,864,112C960,117,1056,139,1152,144C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                M0,128L48,133.3C96,139,192,149,288,144C384,139,480,117,576,112C672,107,768,117,864,128C960,139,1056,149,1152,149.3C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,133.3C672,117,768,107,864,112C960,117,1056,139,1152,144C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </path>
        </svg>
        <svg
          className="absolute bottom-0 w-full opacity-15"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="rgba(5, 150, 105, 0.2)"
            d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,149.3C672,139,768,149,864,170.7C960,192,1056,224,1152,224C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          >
            <animate
              attributeName="d"
              dur="22s"
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
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              {portfolio.name}
            </h1>
            <p className="text-2xl text-emerald-300 font-semibold mb-6">
              {portfolio.title}
            </p>

            {portfolio.location && (
              <div className="flex items-center justify-center gap-2 text-emerald-200 mb-6">
                <MapPin className="w-4 h-4" />
                <span>{portfolio.location}</span>
              </div>
            )}

            {portfolio.show_contact && (
              <div className="flex flex-wrap justify-center gap-4">
                {portfolio.email && (
                  <a
                    href={`mailto:${portfolio.email}`}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600/30 backdrop-blur-md border border-emerald-500/50 text-white rounded-lg hover:bg-emerald-600/40 transform hover:scale-105 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </a>
                )}
                <button
                  onClick={onContactClick}
                  className="px-6 py-3 bg-green-600/30 backdrop-blur-md border border-green-500/50 text-white rounded-lg hover:bg-green-600/40 transform hover:scale-105 transition-all"
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
              <div className="bg-zinc-900/70 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-emerald-500/20">
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
                  <span key={index} className="px-5 py-2 bg-emerald-600/20 backdrop-blur-md border border-emerald-500/30 text-emerald-200 rounded-full font-medium shadow-lg hover:bg-emerald-600/30 transform hover:scale-110 transition-all">
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
                  <div key={index} className="bg-zinc-900/70 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-emerald-500/20">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">{job.position}</h3>
                        <p className="text-emerald-300 font-semibold">{job.company}</p>
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
                  <div key={index} className="bg-zinc-900/70 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-green-500/20">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-white">{edu.degree}</h3>
                        <p className="text-emerald-300 font-semibold">{edu.institution}</p>
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
                  <div key={index} className="bg-zinc-900/70 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-emerald-500/20 transform hover:scale-105 transition-all">
                    <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
                    {project.description && <p className="text-gray-200 mb-4">{project.description}</p>}
                    {project.technologies && <p className="text-sm text-emerald-300 font-medium mb-2">{project.technologies}</p>}
                    {project.url && (
                      <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-emerald-300 hover:underline flex items-center gap-1">
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
                  <div key={index} className="bg-zinc-900/70 backdrop-blur-md rounded-xl shadow-xl p-4 min-w-[150px] text-center border border-green-500/20">
                    <p className="font-semibold text-white">{lang.language}</p>
                    <p className="text-sm text-gray-400">{lang.proficiency}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
