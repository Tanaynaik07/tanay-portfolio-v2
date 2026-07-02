// src/components/admin/ResumeAdmin.jsx
import React, { useState } from 'react';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useResume } from '../../hooks/useResume';

const MAX_PDF_BYTES = 700 * 1024;

const ResumeAdmin = () => {
  const { resume } = useResume();
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsg('');

    if (file.type !== 'application/pdf') {
      setMsg('Please choose a PDF file.');
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setMsg(`File too big (${Math.round(file.size / 1024)}KB). Keep it under ${Math.round(MAX_PDF_BYTES / 1024)}KB.`);
      return;
    }

    setUploading(true);
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
      setMsg('Resume updated.');
    } catch (err) {
      setMsg('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Remove the current resume?')) return;
    await deleteDoc(doc(db, 'meta', 'resume'));
    setMsg('Resume removed.');
  };

  return (
    <div className="admin-form">
      <h3>Resume</h3>
      {resume ? (
        <div className="admin-resume-current">
          <span>Current: {resume.fileName}</span>
          <button onClick={handleDelete} className="admin-delete-btn">Remove</button>
        </div>
      ) : (
        <p className="admin-status">No resume uploaded yet.</p>
      )}
      <label>Upload PDF (max {Math.round(MAX_PDF_BYTES / 1024)}KB)</label>
      <input type="file" accept="application/pdf" onChange={handleUpload} disabled={uploading} />
      {msg && <p className="admin-status">{msg}</p>}
    </div>
  );
};

export default ResumeAdmin;
