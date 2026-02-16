import { Mail, MapPin, Phone, ExternalLink } from 'lucide-react';

export default function ProfessionalTheme({ portfolio, labels, onContactClick }: any) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-slate-800 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            {portfolio.name}
          </h1>
          <p className="text-xl text-gray-300 mb-4">
            {portfolio.title}
          </p>

          <div className="flex flex-wrap gap-4 text-sm text-gray-300">
            {portfolio.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{portfolio.location}</span>
              </div>
            )}
            {portfolio.show_contact && portfolio.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${portfolio.email}`} className="hover:text-white">
                  {portfolio.email}
                </a>
              </div>
            )}
            {portfolio.show_contact && portfolio.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{portfolio.phone}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* About */}
        {portfolio.summary && (
          <section className="mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b-2 border-slate-800">
                {labels.about}
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {portfolio.summary}
              </p>
            </div>
          </section>
        )}

        {/* Skills */}
        {portfolio.skills && portfolio.skills.length > 0 && (
          <section className="mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b-2 border-slate-800">
                {labels.skills}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {portfolio.skills.map((skill: string, index: number) => (
                  <div
                    key={index}
                    className="px-3 py-2 bg-slate-100 text-slate-800 rounded text-sm font-medium"
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Experience */}
        {portfolio.experience && portfolio.experience.length > 0 && (
          <section className="mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b-2 border-slate-800">
                {labels.experience}
              </h2>
              <div className="space-y-6">
                {portfolio.experience.map((job: any, index: number) => (
                  <div key={index} className="border-l-4 border-slate-800 pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {job.position}
                        </h3>
                        <p className="text-slate-700 font-medium">{job.company}</p>
                        {job.location && (
                          <p className="text-gray-600 text-sm">{job.location}</p>
                        )}
                      </div>
                      <div className="text-right text-sm text-gray-600 whitespace-nowrap">
                        <p>{job.start_date}</p>
                        <p>{job.end_date}</p>
                      </div>
                    </div>
                    {job.description && (
                      <p className="text-gray-700 mt-2 whitespace-pre-wrap">
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
          <section className="mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b-2 border-slate-800">
                {labels.education}
              </h2>
              <div className="space-y-6">
                {portfolio.education.map((edu: any, index: number) => (
                  <div key={index} className="border-l-4 border-slate-800 pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{edu.degree}</h3>
                        <p className="text-slate-700 font-medium">{edu.institution}</p>
                        {edu.location && (
                          <p className="text-gray-600 text-sm">{edu.location}</p>
                        )}
                      </div>
                      <div className="text-right text-sm text-gray-600 whitespace-nowrap">
                        <p>{edu.start_date}</p>
                        <p>{edu.end_date}</p>
                      </div>
                    </div>
                    {edu.description && (
                      <p className="text-gray-700 mt-2">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Projects */}
        {portfolio.projects && portfolio.projects.length > 0 && (
          <section className="mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b-2 border-slate-800">
                {labels.projects}
              </h2>
              <div className="space-y-6">
                {portfolio.projects.map((project: any, index: number) => (
                  <div key={index} className="border-l-4 border-slate-800 pl-4">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{project.name}</h3>
                    {project.description && (
                      <p className="text-gray-700 mb-2">{project.description}</p>
                    )}
                    {project.technologies && (
                      <p className="text-sm text-gray-600 font-medium mb-2">
                        <span className="font-bold">Technologies:</span> {project.technologies}
                      </p>
                    )}
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-800 hover:underline flex items-center gap-1 text-sm font-medium"
                      >
                        View Project <ExternalLink className="w-3 h-3" />
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
          <section className="mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b-2 border-slate-800">
                {labels.languages}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {portfolio.languages_spoken.map((lang: any, index: number) => (
                  <div key={index} className="border-l-4 border-slate-800 pl-3 py-1">
                    <p className="font-bold text-slate-900">{lang.language}</p>
                    <p className="text-sm text-gray-600">{lang.proficiency}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Contact Button */}
        {portfolio.show_contact && (
          <section>
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <button
                onClick={onContactClick}
                className="px-8 py-3 bg-slate-800 text-white rounded hover:bg-slate-700 font-medium"
              >
                {labels.contact}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
