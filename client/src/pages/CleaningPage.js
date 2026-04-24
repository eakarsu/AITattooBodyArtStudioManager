import React from 'react';
import CrudPage from './CrudPage';

const columns = [
  { key: 'station', label: 'Station' },
  { key: 'date', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString() : '\u2014' },
  { key: 'cleaned_by', label: 'Cleaned By' },
  { key: 'checklist_type', label: 'Type' },
  { key: 'completed', label: 'Status', render: (v) => (
    <span className={`badge ${v ? 'badge-success' : 'badge-warning'}`}>{v ? 'Complete' : 'Pending'}</span>
  )},
];

const fields = [
  { key: 'id', label: 'ID' },
  { key: 'station', label: 'Station/Area' },
  { key: 'checklist_type', label: 'Checklist Type' },
  { key: 'date', label: 'Date' },
  { key: 'time', label: 'Time' },
  { key: 'cleaned_by', label: 'Cleaned By' },
  { key: 'tasks_completed', label: 'Tasks Completed' },
  { key: 'products_used', label: 'Products Used' },
  { key: 'completed', label: 'Completed' },
  { key: 'verified_by', label: 'Verified By' },
  { key: 'notes', label: 'Notes' },
  { key: 'created_at', label: 'Created' },
];

const formFields = [
  { key: 'station', label: 'Station/Area', placeholder: 'e.g., Station 1, Lobby, Bathroom' },
  { key: 'checklist_type', label: 'Checklist Type', type: 'select', options: [
    { value: 'opening', label: 'Opening' },
    { value: 'between-clients', label: 'Between Clients' },
    { value: 'closing', label: 'Closing' },
    { value: 'deep-clean', label: 'Deep Clean' },
  ]},
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'time', label: 'Time', type: 'time' },
  { key: 'cleaned_by', label: 'Cleaned By', placeholder: 'Staff name' },
  { key: 'tasks_completed', label: 'Tasks Completed', type: 'textarea', placeholder: 'List tasks completed' },
  { key: 'products_used', label: 'Products Used', type: 'textarea', placeholder: 'Cleaning products used' },
  { key: 'completed', label: 'Completed', type: 'checkbox', checkboxLabel: 'All tasks completed' },
  { key: 'verified_by', label: 'Verified By', placeholder: 'Manager/supervisor name' },
  { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional notes' },
];

function CleaningPage() {
  return <CrudPage endpoint="cleaning" title="Cleaning Checklists" icon="\uD83E\uDDF9" columns={columns} fields={fields} formFields={formFields} />;
}

export default CleaningPage;
