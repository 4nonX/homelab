import { Mail, MapPin, ExternalLink } from 'lucide-react';

export default function MinimalTheme({ portfolio, labels, onContactClick }: any) {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-16 px-4 border-b">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            {portfolio.name}
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            {portfolio.title}
          </p>

          {portfolio.location && (
            <p className="text-gray-500 mb-6">{portfolio.location}</p>
          )}

          {portfolio.show_contact && (
            <div className="flex flex-wrap gap-3">
              {portfolio.email && (
                <a
                  href={`mailto:${portfolio.email}`}
                  className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 text-sm"
                >
                  {portfolio.email}
                </a>
              )}
              <button
                onClick={onContactClick}
                className="px-4 py-2 border border-gray-900 text-gray-900 rounded hover:bg-gray-50 text-sm"
              >
                {labels.contact}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* About */}
      {portfolio.summary && (
        <section className="py-12 px-4 border-b">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
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
        <section className="py-12 px-4 border-b">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {labels.skills}
            </h2>
            <div className="flex flex-wrap gap-2">
              {portfolio.skills.map((skill: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm"
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
        <section className="py-12 px-4 border-b">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {labels.experience}
            </h2>
            <div className="space-y-8">
              {portfolio.experience.map((job: any, index: number) => (
                <div key={index}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {job.position}
                      </h3>
                      <p className="text-gray-700">{job.company}</p>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <p>{job.start_date} - {job.end_date}</p>
                    </div>
                  </div>
                  {job.location && (
                    <p className="text-gray-500 text-sm mb-2">{job.location}</p>
                  )}
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
        <section className="py-12 px-4 border-b">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {labels.education}
            </h2>
            <div className="space-y-6">
              {portfolio.education.map((edu: any, index: number) => (
                <div key={index}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{edu.degree}</h3>
                      <p className="text-gray-700">{edu.institution}</p>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <p>{edu.start_date} - {edu.end_date}</p>
                    </div>
                  </div>
                  {edu.location && <p className="text-gray-500 text-sm mb-2">{edu.location}</p>}
                  {edu.description && <p className="text-gray-700">{edu.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Projects */}
      {portfolio.projects && portfolio.projects.length > 0 && (
        <section className="py-12 px-4 border-b">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{labels.projects}</h2>
            <div className="space-y-6">
              {portfolio.projects.map((project: any, index: number) => (
                <div key={index}>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{project.name}</h3>
                  {project.description && <p className="text-gray-700 mb-2">{project.description}</p>}
                  {project.technologies && <p className="text-sm text-gray-600 mb-2">{project.technologies}</p>}
                  {project.url && (
                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-gray-900 underline hover:no-underline flex items-center gap-1 text-sm">
                      {project.url} <ExternalLink className="w-3 h-3" />
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
        <section className="py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{labels.languages}</h2>
            <div className="space-y-2">
              {portfolio.languages_spoken.map((lang: any, index: number) => (
                <div key={index} className="flex justify-between">
                  <span className="font-medium text-gray-900">{lang.language}</span>
                  <span className="text-gray-600">{lang.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
