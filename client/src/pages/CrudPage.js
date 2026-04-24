import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import DataTable from '../components/DataTable';
import DetailView from '../components/DetailView';
import Modal from '../components/Modal';

function CrudPage({ endpoint, title, columns, fields, formFields, icon }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [modalMode, setModalMode] = useState(null); // 'detail' | 'create' | 'edit' | 'delete'
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/${endpoint}`);
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRowClick = (row) => {
    setSelected(row);
    setModalMode('detail');
  };

  const handleAdd = () => {
    const initial = {};
    (formFields || []).forEach((f) => {
      initial[f.key] = f.defaultValue || '';
    });
    setFormData(initial);
    setError('');
    setModalMode('create');
  };

  const handleEdit = (row) => {
    const initial = {};
    (formFields || []).forEach((f) => {
      initial[f.key] = row[f.key] !== undefined && row[f.key] !== null ? row[f.key] : '';
    });
    setFormData(initial);
    setSelected(row);
    setError('');
    setModalMode('edit');
  };

  const handleDelete = (row) => {
    setSelected(row);
    setModalMode('delete');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      if (modalMode === 'create') {
        await api.post(`/${endpoint}`, formData);
      } else if (modalMode === 'edit') {
        await api.put(`/${endpoint}/${selected.id}`, formData);
      }
      setModalMode(null);
      setSelected(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/${endpoint}/${selected.id}`);
      setModalMode(null);
      setSelected(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete.');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setSelected(null);
    setError('');
  };

  const updateFormField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <DataTable
        title={`${icon || ''} ${title}`}
        columns={columns}
        data={data}
        onRowClick={handleRowClick}
        onAdd={handleAdd}
      />

      {/* Detail Modal */}
      <Modal isOpen={modalMode === 'detail'} onClose={handleCloseModal} title={title} size="lg">
        {selected && (
          <DetailView
            data={selected}
            fields={fields}
            title={`${icon || ''} ${title} Details`}
            onEdit={() => handleEdit(selected)}
            onDelete={() => handleDelete(selected)}
          />
        )}
      </Modal>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalMode === 'create' || modalMode === 'edit'}
        onClose={handleCloseModal}
        title={modalMode === 'create' ? `Add New ${title}` : `Edit ${title}`}
      >
        {error && <div className="login-error">{error}</div>}
        {(formFields || []).map((f) => (
          <div className="form-group" key={f.key}>
            <label className="form-label">{f.label}</label>
            {f.type === 'textarea' ? (
              <textarea
                className="form-textarea"
                value={formData[f.key] || ''}
                onChange={(e) => updateFormField(f.key, e.target.value)}
                placeholder={f.placeholder || ''}
              />
            ) : f.type === 'select' ? (
              <select
                className="form-select"
                value={formData[f.key] || ''}
                onChange={(e) => updateFormField(f.key, e.target.value)}
              >
                <option value="">Select...</option>
                {(f.options || []).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : f.type === 'checkbox' ? (
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={!!formData[f.key]}
                  onChange={(e) => updateFormField(f.key, e.target.checked)}
                />
                <span style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>{f.checkboxLabel || 'Yes'}</span>
              </label>
            ) : (
              <input
                type={f.type || 'text'}
                className="form-input"
                value={formData[f.key] || ''}
                onChange={(e) => updateFormField(f.key, e.target.value)}
                placeholder={f.placeholder || ''}
              />
            )}
          </div>
        ))}
        <div className="modal-footer" style={{ padding: '16px 0 0', borderTop: '1px solid #333' }}>
          <button className="btn btn-secondary" onClick={handleCloseModal}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : modalMode === 'create' ? 'Create' : 'Save Changes'}
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={modalMode === 'delete'} onClose={handleCloseModal} title="Confirm Delete">
        <div className="delete-confirm">
          <div className="delete-confirm-icon">{'\u26A0\uFE0F'}</div>
          <h3>Delete this record?</h3>
          <p>This action cannot be undone.</p>
          {error && <div className="login-error">{error}</div>}
          <div className="delete-confirm-actions">
            <button className="btn btn-secondary" onClick={handleCloseModal}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleConfirmDelete} disabled={saving}>
              {saving ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default CrudPage;
