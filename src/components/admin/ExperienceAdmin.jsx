// src/components/admin/ExperienceAdmin.jsx
import React, { useState } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase';
import { useExperience } from '../../hooks/useExperience';

const emptyForm = { title: '', role: '', year: '' };

const ExperienceAdmin = () => {
  const { experience } = useExperience(); // sorted asc
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

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
        role: form.role.trim(),
        year: form.year.trim(),
      };
      if (editingId) {
        await updateDoc(doc(db, 'experience', editingId), payload);
        setStatusMsg('Entry updated.');
      } else {
        const maxOrder = experience.reduce((max, e) => Math.max(max, e.order ?? 0), 0);
        await addDoc(collection(db, 'experience'), { ...payload, order: maxOrder + 1 });
        setStatusMsg('Entry added.');
      }
      resetForm();
    } catch (err) {
      setStatusMsg('Something went wrong: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (exp) => {
    setForm({ title: exp.title || '', role: exp.role || '', year: exp.year || '' });
    setEditingId(exp.id);
    setStatusMsg('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this experience entry?')) return;
    await deleteDoc(doc(db, 'experience', id));
    if (editingId === id) resetForm();
  };

  const moveItem = async (index, direction) => {
    const list = [...experience];
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    const batch = writeBatch(db);
    list.forEach((item, idx) => {
      const newOrder = idx + 1;
      if (item.order !== newOrder) batch.update(doc(db, 'experience', item.id), { order: newOrder });
    });
    await batch.commit();
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="admin-form">
        <h3>{editingId ? 'Edit Entry' : 'Add Experience'}</h3>
        <label>Title</label>
        <input name="title" value={form.title} onChange={handleChange} placeholder="Vortex 360 Hackathon" required />
        <label>Role</label>
        <input name="role" value={form.role} onChange={handleChange} placeholder="Frontend Developer" required />
        <label>Year</label>
        <input name="year" value={form.year} onChange={handleChange} placeholder="2024" required />
        <div className="admin-form-actions">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : editingId ? 'Update' : 'Add Entry'}
          </button>
          {editingId && <button type="button" onClick={resetForm} className="btn-ghost">Cancel</button>}
        </div>
        {statusMsg && <p className="admin-status">{statusMsg}</p>}
      </form>

      <div className="admin-list">
        <h3>Current Entries ({experience.length})</h3>
        {experience.map((exp, idx) => (
          <div key={exp.id} className="admin-list-item">
            <div className="admin-list-info">
              <strong>{exp.title}</strong>
              <span>{exp.role} — {exp.year}</span>
            </div>
            <div className="admin-list-actions">
              <button onClick={() => moveItem(idx, -1)} className="btn-ghost" title="Move up">↑</button>
              <button onClick={() => moveItem(idx, 1)} className="btn-ghost" title="Move down">↓</button>
              <button onClick={() => handleEdit(exp)} className="btn-ghost">Edit</button>
              <button onClick={() => handleDelete(exp.id)} className="admin-delete-btn">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExperienceAdmin;
