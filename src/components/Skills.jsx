// src/components/Skills.jsx
import React from 'react';
import { useSkills } from '../hooks/useSkills';
import '../styles/Skills.css';

const Skills = () => {
  const { skillCategories, loading } = useSkills();

  return (
    <section className="section" id="skills">
      <span className="eyebrow">Toolbox</span>
      <h2 className="section-title">Skills</h2>
      {loading && <p className="projects-loading">Loading…</p>}
      <div className="skills-grid">
        {skillCategories.map((cat) => (
          <div key={cat.id} className="skills-card">
            <h3>{cat.category}</h3>
            <div className="skills-tags">
              {(cat.skills || []).map((s) => (
                <span key={s} className="skill-tag">{s}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Skills;
