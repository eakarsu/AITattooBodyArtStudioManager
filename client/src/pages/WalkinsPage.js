import React from 'react';
import CrudPage from './CrudPage';

const columns = [
  { key: 'client_name', label: 'Name' },
  { key: 'service_type', label: 'Service' },
  { key: 'date', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString() : '\u2014' },
  { key: 'position', label: 'Queue #' },
  { key: 'status', label: 'Status', render: (v) => {
    const cls = v === 'completed' ? 'badge-success' : v === 'serving' ? 'badge-info' : v === 'cancelled' ? 'badge-danger' : 'badge-warning';
    return <span className={`badge ${cls}`}>{v || 'waiting'}</span>;
  }},
  { key: 'assigned_artist', label: 'Artist' },
];

const fields = [
  { key: 'id', label: 'ID' },
  { key: 'client_name', label: 'Client Name' },
  { key: 'phone', label: 'Phone' },
  { key: 'service_type', label: 'Service Type' },
  { key: 'description', label: 'Description' },
  { key: 'date', label: 'Date' },
  { key: 'check_in_time', label: 'Check-in Time' },
  { key: 'position', label: 'Queue Position' },
  { key: 'assigned_artist', label: 'Assigned Artist' },
  { key: 'estimated_wait', label: 'Est. Wait (min)' },
  { key: 'status', label: 'Status' },
  { key: 'notes', label: 'Notes' },
  { key: 'created_at', label: 'Created' },
];

const formFields = [
  { key: 'client_name', label: 'Client Name', placeholder: 'Walk-in client name' },
  { key: 'phone', label: 'Phone', placeholder: '555-0100' },
  { key: 'service_type', label: 'Service Type', type: 'select', options: [
    { value: 'tattoo', label: 'Tattoo' },
    { value: 'piercing', label: 'Piercing' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'touch-up', label: 'Touch-up' },
  ]},
  { key: 'description', label: 'Description', type: 'textarea', placeholder: 'What they want' },
  { key: 'assigned_artist', label: 'Assigned Artist', placeholder: 'Artist name' },
  { key: 'estimated_wait', label: 'Est. Wait (min)', type: 'number', placeholder: '30' },
  { key: 'status', label: 'Status', type: 'select', options: [
    { value: 'waiting', label: 'Waiting' },
    { value: 'serving', label: 'Serving' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ]},
  { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional notes' },
];

function WalkinsPage() {
  return <CrudPage endpoint="walkins" title="Walk-in Queue" icon="\uD83D\uDEB6" columns={columns} fields={fields} formFields={formFields} />;
}

export default WalkinsPage;
