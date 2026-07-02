// src/components/Experience.jsx
import React from 'react';
import { useExperience } from '../hooks/useExperience';
import '../styles/Experience.css';

const Experience = () => {
  const { experience, loading } = useExperience();

  return (
    <section className="section" id="experience">
      <span className="eyebrow">Timeline</span>
      <h2 className="section-title">Experience</h2>
      {loading && <p className="projects-loading">Loading…</p>}
      <div className="timeline">
        {experience.map((exp) => (
          <div className="timeline-item" key={exp.id}>
            <span className="timeline-year">{exp.year}</span>
            <div>
              <h3>{exp.title}</h3>
              <p>{exp.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Experience;
