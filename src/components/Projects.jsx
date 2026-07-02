// src/components/Projects.jsx
import React from 'react';
import { useProjects } from '../hooks/useProjects';
import '../styles/Projects.css';

const Projects = () => {
  const { projects, loading } = useProjects();

  return (
    <section className="section" id="projects">
      <span className="eyebrow">Shipped &amp; in progress</span>
      <h2 className="section-title">Projects</h2>

      {loading && <p className="projects-loading">Loading projects…</p>}
      {!loading && projects.length === 0 && (
        <p className="projects-loading">No projects added yet — check back soon.</p>
      )}

      <div className="projects-grid">
        {projects.map((project) => (
          <article key={project.id} className="project-card">
            {project.imgSrc && (
              <div className="project-image-wrap">
                <img src={project.imgSrc} alt={`${project.title} screenshot`} />
              </div>
            )}
            <div className="project-body">
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              {project.tools?.length > 0 && (
                <div className="tools">
                  {project.tools.map((tool) => (
                    <span key={tool} className="tool">{tool}</span>
                  ))}
                </div>
              )}
              <div className="project-links">
                {project.link && (
                  <a href={project.link} target="_blank" rel="noopener noreferrer">Code</a>
                )}
                {project.demo && (
                  <a href={project.demo} target="_blank" rel="noopener noreferrer">Live</a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="projects-more">
        <p>More on <a href="https://github.com/Tanaynaik07" target="_blank" rel="noopener noreferrer">GitHub →</a></p>
      </div>
    </section>
  );
};

export default Projects;
