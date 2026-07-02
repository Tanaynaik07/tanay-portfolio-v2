// src/components/admin/ProjectsAdmin.jsx
import React, { useRef, useState } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase';
import { useProjects } from '../../hooks/useProjects';

const emptyForm = {
  title: '',
  description: '',
  imgSrc: '',
  tools: '',
  link: '',
  demo: '',
};

const ProjectsAdmin = () => {
  const { projects } = useProjects(); // already sorted desc: highest order first (top)
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [localOrder, setLocalOrder] = useState(null); // used only mid-drag
  const dragIndex = useRef(null);

  const displayList = localOrder || projects;

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
      };

      if (editingId) {
        await updateDoc(doc(db, 'projects', editingId), payload);
        setStatusMsg('Project updated.');
      } else {
        const maxOrder = projects.reduce((max, p) => Math.max(max, p.order ?? 0), 0);
        await addDoc(collection(db, 'projects'), { ...payload, order: maxOrder + 1 });
        setStatusMsg('Project added to the top.');
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

  const commitReorder = async (list) => {
    const batch = writeBatch(db);
    const n = list.length;
    list.forEach((item, idx) => {
      // top of list (idx 0) gets the highest order number, bottom gets the lowest
      const newOrder = n - idx;
      if (item.order !== newOrder) {
        batch.update(doc(db, 'projects', item.id), { order: newOrder });
      }
    });
    await batch.commit();
    setLocalOrder(null);
  };

  const moveItem = (index, direction) => {
    const list = [...displayList];
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    setLocalOrder(list);
    commitReorder(list);
  };

  const handleDragStart = (index) => {
    dragIndex.current = index;
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === index) return;
    const list = [...displayList];
    const [moved] = list.splice(dragIndex.current, 1);
    list.splice(index, 0, moved);
    dragIndex.current = index;
    setLocalOrder(list);
  };

  const handleDragEnd = () => {
    if (localOrder) commitReorder(localOrder);
    dragIndex.current = null;
  };

  return (
    <div>
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
        <h3>Current Projects ({displayList.length})</h3>
        <p className="admin-hint">Drag to reorder — top shows first on the site, bottom shows last.</p>
        {displayList.map((p, idx) => (
          <div
            key={p.id}
            className="admin-list-item admin-draggable"
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragEnd={handleDragEnd}
          >
            <span className="admin-drag-handle">⠿</span>
            {p.imgSrc && <img src={p.imgSrc} alt={p.title} />}
            <div className="admin-list-info">
              <strong>{p.title}</strong>
              <span>order: {p.order}</span>
            </div>
            <div className="admin-list-actions">
              <button onClick={() => moveItem(idx, -1)} className="btn-ghost" title="Move up">↑</button>
              <button onClick={() => moveItem(idx, 1)} className="btn-ghost" title="Move down">↓</button>
              <button onClick={() => handleEdit(p)} className="btn-ghost">Edit</button>
              <button onClick={() => handleDelete(p.id)} className="admin-delete-btn">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsAdmin;
