import React from 'react';

function DetailView({ data, fields, onEdit, onDelete, onBack, title }) {
  if (!data) return null;

  return (
    <div className="detail-view">
      <div className="detail-view-header">
        <h2>{title || 'Details'}</h2>
        <div className="detail-view-actions">
          {onBack && (
            <button className="btn btn-secondary btn-sm" onClick={onBack}>
              {'\u2190'} Back
            </button>
          )}
          {onEdit && (
            <button className="btn btn-primary btn-sm" onClick={() => onEdit(data)}>
              Edit
            </button>
          )}
          {onDelete && (
            <button className="btn btn-danger btn-sm" onClick={() => onDelete(data)}>
              Delete
            </button>
          )}
        </div>
      </div>
      <div className="detail-view-body">
        {fields.map((field) => {
          const value = data[field.key];
          return (
            <div className="detail-field" key={field.key}>
              <div className="detail-field-label">{field.label}</div>
              <div className="detail-field-value">
                {field.render
                  ? field.render(value, data)
                  : formatDetailValue(value)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatDetailValue(val) {
  if (val === null || val === undefined || val === '') return '\u2014';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
    return new Date(val).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }
  if (Array.isArray(val)) return val.join(', ');
  if (typeof val === 'object') {
    return (
      <pre style={{ fontSize: '0.82rem', whiteSpace: 'pre-wrap', color: '#b0b0b0' }}>
        {JSON.stringify(val, null, 2)}
      </pre>
    );
  }
  return String(val);
}

export default DetailView;
