// src/components/Experience.jsx
import React from 'react';
import { experience } from '../data/experience';
import '../styles/Experience.css';

const Experience = () => {
  return (
    <section className="section" id="experience">
      <span className="eyebrow">Timeline</span>
      <h2 className="section-title">Experience</h2>
      <div className="timeline">
        {experience.map((exp) => (
          <div className="timeline-item" key={exp.title}>
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
