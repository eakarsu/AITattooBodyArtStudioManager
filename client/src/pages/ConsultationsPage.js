import React from 'react';
import CrudPage from './CrudPage';

const columns = [
  { key: 'client_name', label: 'Client' },
  { key: 'artist_name', label: 'Artist' },
  { key: 'date', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString() : '\u2014' },
  { key: 'style', label: 'Style' },
  { key: 'status', label: 'Status', render: (v) => {
    const cls = v === 'completed' ? 'badge-success' : v === 'cancelled' ? 'badge-danger' : 'badge-warning';
    return <span className={`badge ${cls}`}>{v || 'pending'}</span>;
  }},
];

const fields = [
  { key: 'id', label: 'ID' },
  { key: 'client_name', label: 'Client' },
  { key: 'artist_name', label: 'Artist' },
  { key: 'date', label: 'Date' },
  { key: 'style', label: 'Desired Style' },
  { key: 'description', label: 'Design Description' },
  { key: 'placement', label: 'Placement' },
  { key: 'size', label: 'Size' },
  { key: 'reference_images', label: 'Reference Images' },
  { key: 'budget', label: 'Budget' },
  { key: 'notes', label: 'Notes' },
  { key: 'status', label: 'Status' },
  { key: 'created_at', label: 'Created' },
];

const formFields = [
  { key: 'client_id', label: 'Client ID', type: 'number', placeholder: 'Client ID' },
  { key: 'artist_id', label: 'Artist ID', type: 'number', placeholder: 'Artist ID' },
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'style', label: 'Desired Style', placeholder: 'e.g., Japanese, Realism' },
  { key: 'description', label: 'Design Description', type: 'textarea', placeholder: 'Describe the desired design' },
  { key: 'placement', label: 'Placement', placeholder: 'e.g., forearm, back' },
  { key: 'size', label: 'Size', placeholder: 'e.g., 4x6 inches' },
  { key: 'reference_images', label: 'Reference Images', type: 'textarea', placeholder: 'URLs or descriptions' },
  { key: 'budget', label: 'Budget ($)', type: 'number', placeholder: '500' },
  { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional notes' },
  { key: 'status', label: 'Status', type: 'select', options: [
    { value: 'pending', label: 'Pending' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ]},
];

function ConsultationsPage() {
  return <CrudPage endpoint="consultations" title="Consultations" icon="\uD83D\uDCA1" columns={columns} fields={fields} formFields={formFields} />;
}

export default ConsultationsPage;
