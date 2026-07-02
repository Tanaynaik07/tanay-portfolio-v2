// src/pages/AdminDashboard.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProjectsAdmin from '../components/admin/ProjectsAdmin';
import SkillsAdmin from '../components/admin/SkillsAdmin';
import ExperienceAdmin from '../components/admin/ExperienceAdmin';
import ResumeAdmin from '../components/admin/ResumeAdmin';
import '../styles/Admin.css';

const TABS = [
  { key: 'projects', label: 'Projects' },
  { key: 'skills', label: 'Skills' },
  { key: 'experience', label: 'Experience' },
  { key: 'resume', label: 'Resume' },
];

const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('projects');

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <span className="eyebrow">Admin</span>
          <h2>Content Manager</h2>
        </div>
        <div className="admin-header-right">
          <span>{user?.email}</span>
          <button onClick={logout} className="btn-ghost">Log out</button>
        </div>
      </div>

      <div className="admin-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`admin-tab ${activeTab === tab.key ? 'admin-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'projects' && <ProjectsAdmin />}
      {activeTab === 'skills' && <SkillsAdmin />}
      {activeTab === 'experience' && <ExperienceAdmin />}
      {activeTab === 'resume' && <ResumeAdmin />}
    </div>
  );
};

export default AdminDashboard;
