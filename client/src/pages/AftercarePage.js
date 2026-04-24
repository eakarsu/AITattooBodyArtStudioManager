import React from 'react';
import CrudPage from './CrudPage';

const columns = [
  { key: 'client_name', label: 'Client' },
  { key: 'service_type', label: 'Service' },
  { key: 'service_date', label: 'Service Date', render: (v) => v ? new Date(v).toLocaleDateString() : '\u2014' },
  { key: 'healing_status', label: 'Healing', render: (v) => {
    const cls = v === 'healed' ? 'badge-success' : v === 'issue' ? 'badge-danger' : 'badge-warning';
    return <span className={`badge ${cls}`}>{v || 'in-progress'}</span>;
  }},
  { key: 'next_followup', label: 'Next Follow-up', render: (v) => v ? new Date(v).toLocaleDateString() : '\u2014' },
];

const fields = [
  { key: 'id', label: 'ID' },
  { key: 'client_name', label: 'Client' },
  { key: 'client_id', label: 'Client ID' },
  { key: 'appointment_id', label: 'Appointment ID' },
  { key: 'service_type', label: 'Service Type' },
  { key: 'service_date', label: 'Service Date' },
  { key: 'instructions_given', label: 'Instructions Given' },
  { key: 'healing_status', label: 'Healing Status' },
  { key: 'check_in_notes', label: 'Check-in Notes' },
  { key: 'photos_submitted', label: 'Photos Submitted' },
  { key: 'next_followup', label: 'Next Follow-up' },
  { key: 'issues', label: 'Issues' },
  { key: 'created_at', label: 'Created' },
];

const formFields = [
  { key: 'client_id', label: 'Client ID', type: 'number', placeholder: 'Client ID' },
  { key: 'appointment_id', label: 'Appointment ID', type: 'number', placeholder: 'Appointment ID' },
  { key: 'service_type', label: 'Service Type', type: 'select', options: [
    { value: 'tattoo', label: 'Tattoo' },
    { value: 'piercing', label: 'Piercing' },
    { value: 'touch-up', label: 'Touch-up' },
  ]},
  { key: 'service_date', label: 'Service Date', type: 'date' },
  { key: 'instructions_given', label: 'Instructions Given', type: 'textarea', placeholder: 'Aftercare instructions provided' },
  { key: 'healing_status', label: 'Healing Status', type: 'select', options: [
    { value: 'in-progress', label: 'In Progress' },
    { value: 'healed', label: 'Healed' },
    { value: 'issue', label: 'Issue Reported' },
  ]},
  { key: 'check_in_notes', label: 'Check-in Notes', type: 'textarea', placeholder: 'Notes from check-in' },
  { key: 'next_followup', label: 'Next Follow-up', type: 'date' },
  { key: 'issues', label: 'Issues', type: 'textarea', placeholder: 'Any issues reported' },
];

function AftercarePage() {
  return <CrudPage endpoint="aftercare" title="Aftercare Tracking" icon="\uD83E\uDE79" columns={columns} fields={fields} formFields={formFields} />;
}

export default AftercarePage;
