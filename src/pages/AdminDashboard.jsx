// src/pages/AdminDashboard.jsx
import React, { useState } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../hooks/useProjects';
import { useResume } from '../hooks/useResume';
import '../styles/Admin.css';

const MAX_PDF_BYTES = 700 * 1024; // keep base64'd doc safely under Firestore's 1MB limit

const emptyForm = {
  title: '',
  description: '',
  imgSrc: '',
  tools: '',
  link: '',
  demo: '',
  order: 0,
};

const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const { projects } = useProjects();
  const { resume } = useResume();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeMsg, setResumeMsg] = useState('');

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeMsg('');

    if (file.type !== 'application/pdf') {
      setResumeMsg('Please choose a PDF file.');
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setResumeMsg(`File too big (${Math.round(file.size / 1024)}KB). Keep it under ${Math.round(MAX_PDF_BYTES / 1024)}KB.`);
      return;
    }

    setResumeUploading(true);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      await setDoc(doc(db, 'meta', 'resume'), {
        fileName: file.name,
        base64,
        updatedAt: Date.now(),
      });
      setResumeMsg('Resume updated.');
    } catch (err) {
      setResumeMsg('Upload failed: ' + err.message);
    } finally {
      setResumeUploading(false);
      e.target.value = '';
    }
  };

  const handleResumeDelete = async () => {
    if (!window.confirm('Remove the current resume?')) return;
    await deleteDoc(doc(db, 'meta', 'resume'));
    setResumeMsg('Resume removed.');
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg('');
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        imgSrc: form.imgSrc.trim(),
        tools: form.tools.split(',').map((t) => t.trim()).filter(Boolean),
        link: form.link.trim(),
        demo: form.demo.trim(),
        order: Number(form.order) || 0,
      };

      if (editingId) {
        await updateDoc(doc(db, 'projects', editingId), payload);
        setStatusMsg('Project updated.');
      } else {
        await addDoc(collection(db, 'projects'), payload);
        setStatusMsg('Project added.');
      }
      resetForm();
    } catch (err) {
      setStatusMsg('Something went wrong: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (project) => {
    setForm({
      title: project.title || '',
      description: project.description || '',
      imgSrc: project.imgSrc || '',
      tools: (project.tools || []).join(', '),
      link: project.link || '',
      demo: project.demo || '',
      order: project.order ?? 0,
    });
    setEditingId(project.id);
    setStatusMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    await deleteDoc(doc(db, 'projects', id));
    if (editingId === id) resetForm();
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <span className="eyebrow">Admin</span>
          <h2>Project Manager</h2>
        </div>
        <div className="admin-header-right">
          <span>{user?.email}</span>
          <button onClick={logout} className="btn-ghost">Log out</button>
        </div>
      </div>

      <div className="admin-form">
        <h3>Resume</h3>
        {resume ? (
          <div className="admin-resume-current">
            <span>Current: {resume.fileName}</span>
            <button onClick={handleResumeDelete} className="admin-delete-btn">Remove</button>
          </div>
        ) : (
          <p className="admin-status">No resume uploaded yet.</p>
        )}
        <label>Upload PDF (max {Math.round(MAX_PDF_BYTES / 1024)}KB)</label>
        <input type="file" accept="application/pdf" onChange={handleResumeUpload} disabled={resumeUploading} />
        {resumeMsg && <p className="admin-status">{resumeMsg}</p>}
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        <h3>{editingId ? 'Edit Project' : 'Add New Project'}</h3>

        <label>Title</label>
        <input name="title" value={form.title} onChange={handleChange} required />

        <label>Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} required />

        <label>Image URL</label>
        <input name="imgSrc" value={form.imgSrc} onChange={handleChange} placeholder="https://..." />

        <label>Tools (comma-separated)</label>
        <input name="tools" value={form.tools} onChange={handleChange} placeholder="React, Node.js, Firebase" />

        <label>GitHub Link</label>
        <input name="link" value={form.link} onChange={handleChange} placeholder="https://github.com/..." />

        <label>Live Demo Link</label>
        <input name="demo" value={form.demo} onChange={handleChange} placeholder="https://..." />

        <label>Order (lower shows first)</label>
        <input name="order" type="number" value={form.order} onChange={handleChange} />

        <div className="admin-form-actions">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : editingId ? 'Update Project' : 'Add Project'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="btn-ghost">Cancel</button>
          )}
        </div>
        {statusMsg && <p className="admin-status">{statusMsg}</p>}
      </form>

      <div className="admin-list">
        <h3>Current Projects ({projects.length})</h3>
        {projects.map((p) => (
          <div key={p.id} className="admin-list-item">
            {p.imgSrc && <img src={p.imgSrc} alt={p.title} />}
            <div className="admin-list-info">
              <strong>{p.title}</strong>
              <span>order: {p.order}</span>
            </div>
            <div className="admin-list-actions">
              <button onClick={() => handleEdit(p)} className="btn-ghost">Edit</button>
              <button onClick={() => handleDelete(p.id)} className="admin-delete-btn">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
