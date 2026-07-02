// src/components/Skills.jsx
import React from 'react';
import { skillCategories } from '../data/skills';
import '../styles/Skills.css';

const Skills = () => {
  return (
    <section className="section" id="skills">
      <span className="eyebrow">Toolbox</span>
      <h2 className="section-title">Skills</h2>
      <div className="skills-grid">
        {skillCategories.map((cat) => (
          <div key={cat.category} className="skills-card">
            <h3>{cat.category}</h3>
            <div className="skills-tags">
              {cat.skills.map((s) => (
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
