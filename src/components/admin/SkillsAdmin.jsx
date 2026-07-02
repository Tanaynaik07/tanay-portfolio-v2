// src/components/admin/SkillsAdmin.jsx
import React, { useState } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase';
import { useSkills } from '../../hooks/useSkills';

const emptyForm = { category: '', skills: '' };

const SkillsAdmin = () => {
  const { skillCategories } = useSkills(); // sorted asc
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
        category: form.category.trim(),
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      };
      if (editingId) {
        await updateDoc(doc(db, 'skills', editingId), payload);
        setStatusMsg('Category updated.');
      } else {
        const maxOrder = skillCategories.reduce((max, s) => Math.max(max, s.order ?? 0), 0);
        await addDoc(collection(db, 'skills'), { ...payload, order: maxOrder + 1 });
        setStatusMsg('Category added.');
      }
      resetForm();
    } catch (err) {
      setStatusMsg('Something went wrong: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cat) => {
    setForm({ category: cat.category || '', skills: (cat.skills || []).join(', ') });
    setEditingId(cat.id);
    setStatusMsg('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this skill category?')) return;
    await deleteDoc(doc(db, 'skills', id));
    if (editingId === id) resetForm();
  };

  const moveItem = async (index, direction) => {
    const list = [...skillCategories];
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    const batch = writeBatch(db);
    list.forEach((item, idx) => {
      const newOrder = idx + 1;
      if (item.order !== newOrder) batch.update(doc(db, 'skills', item.id), { order: newOrder });
    });
    await batch.commit();
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="admin-form">
        <h3>{editingId ? 'Edit Category' : 'Add Skill Category'}</h3>
        <label>Category name</label>
        <input name="category" value={form.category} onChange={handleChange} placeholder="Web & Realtime" required />
        <label>Skills (comma-separated)</label>
        <input name="skills" value={form.skills} onChange={handleChange} placeholder="React, Node.js, Socket.io" required />
        <div className="admin-form-actions">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : editingId ? 'Update' : 'Add Category'}
          </button>
          {editingId && <button type="button" onClick={resetForm} className="btn-ghost">Cancel</button>}
        </div>
        {statusMsg && <p className="admin-status">{statusMsg}</p>}
      </form>

      <div className="admin-list">
        <h3>Current Categories ({skillCategories.length})</h3>
        {skillCategories.map((cat, idx) => (
          <div key={cat.id} className="admin-list-item">
            <div className="admin-list-info">
              <strong>{cat.category}</strong>
              <span>{(cat.skills || []).join(', ')}</span>
            </div>
            <div className="admin-list-actions">
              <button onClick={() => moveItem(idx, -1)} className="btn-ghost" title="Move up">↑</button>
              <button onClick={() => moveItem(idx, 1)} className="btn-ghost" title="Move down">↓</button>
              <button onClick={() => handleEdit(cat)} className="btn-ghost">Edit</button>
              <button onClick={() => handleDelete(cat.id)} className="admin-delete-btn">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsAdmin;
