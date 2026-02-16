import { Mail, MapPin, ExternalLink } from 'lucide-react';

export default function ModernTheme({ portfolio, labels, onContactClick }: any) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            {portfolio.name}
          </h1>
          <p className="text-2xl text-blue-600 font-semibold mb-6">
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
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </a>
              )}
              <button
                onClick={onContactClick}
                className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
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
            <div className="bg-white rounded-xl shadow-lg p-8">
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
                  className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium hover:bg-blue-200 transition"
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
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {job.position}
                      </h3>
                      <p className="text-blue-600 font-semibold">{job.company}</p>
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
                <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {edu.degree}
                      </h3>
                      <p className="text-blue-600 font-semibold">
                        {edu.institution}
                      </p>
                      {edu.location && (
                        <p className="text-gray-600 text-sm">{edu.location}</p>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <p>{edu.start_date}</p>
                      <p>{edu.end_date}</p>
                    </div>
                  </div>
                  {edu.description && (
                    <p className="mt-4 text-gray-700">{edu.description}</p>
                  )}
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
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              {labels.projects}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {portfolio.projects.map((project: any, index: number) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-gray-700 mb-4">{project.description}</p>
                  )}
                  {project.technologies && (
                    <p className="text-sm text-blue-600 font-medium mb-2">
                      {project.technologies}
                    </p>
                  )}
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
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
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              {labels.languages}
            </h2>
            <div className="flex flex-wrap gap-4 justify-center">
              {portfolio.languages_spoken.map((lang: any, index: number) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow p-4 min-w-[150px] text-center"
                >
                  <p className="font-semibold text-gray-900">{lang.language}</p>
                  <p className="text-sm text-gray-600">{lang.proficiency}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
