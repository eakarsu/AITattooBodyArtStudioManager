import React from 'react';
import CrudPage from './CrudPage';

const columns = [
  { key: 'client_name', label: 'Client' },
  { key: 'artist_name', label: 'Artist' },
  { key: 'date', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString() : '\u2014' },
  { key: 'time', label: 'Time' },
  { key: 'service_type', label: 'Service' },
  { key: 'status', label: 'Status', render: (v) => {
    const cls = v === 'completed' ? 'badge-success' : v === 'cancelled' ? 'badge-danger' : v === 'confirmed' ? 'badge-info' : 'badge-warning';
    return <span className={`badge ${cls}`}>{v || 'pending'}</span>;
  }},
  { key: 'estimated_price', label: 'Price', render: (v) => v ? `$${v}` : '\u2014' },
];

const fields = [
  { key: 'id', label: 'ID' },
  { key: 'client_name', label: 'Client' },
  { key: 'client_email', label: 'Client Email' },
  { key: 'client_phone', label: 'Client Phone' },
  { key: 'artist_name', label: 'Artist' },
  { key: 'date', label: 'Date' },
  { key: 'time', label: 'Time' },
  { key: 'service_type', label: 'Service Type' },
  { key: 'description', label: 'Description' },
  { key: 'placement', label: 'Placement' },
  { key: 'size', label: 'Size' },
  { key: 'estimated_duration', label: 'Est. Duration' },
  { key: 'estimated_price', label: 'Est. Price', render: (v) => v ? `$${v}` : '\u2014' },
  { key: 'deposit_paid', label: 'Deposit Paid' },
  { key: 'status', label: 'Status' },
  { key: 'notes', label: 'Notes' },
  { key: 'created_at', label: 'Created' },
];

const formFields = [
  { key: 'client_id', label: 'Client ID', type: 'number', placeholder: 'Client ID' },
  { key: 'artist_id', label: 'Artist ID', type: 'number', placeholder: 'Artist ID' },
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'time', label: 'Time', type: 'time' },
  { key: 'service_type', label: 'Service Type', type: 'select', options: [
    { value: 'tattoo', label: 'Tattoo' },
    { value: 'piercing', label: 'Piercing' },
    { value: 'touch-up', label: 'Touch-up' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'removal', label: 'Removal' },
  ]},
  { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Design description' },
  { key: 'placement', label: 'Placement', placeholder: 'e.g., forearm, back' },
  { key: 'size', label: 'Size', placeholder: 'e.g., 4x6 inches' },
  { key: 'estimated_duration', label: 'Est. Duration (hours)', type: 'number', placeholder: '2' },
  { key: 'estimated_price', label: 'Est. Price ($)', type: 'number', placeholder: '200' },
  { key: 'deposit_paid', label: 'Deposit Paid', type: 'checkbox', checkboxLabel: 'Deposit received' },
  { key: 'status', label: 'Status', type: 'select', options: [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ]},
  { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional notes' },
];

function AppointmentsPage() {
  return <CrudPage endpoint="appointments" title="Appointments" icon="\uD83D\uDCC5" columns={columns} fields={fields} formFields={formFields} />;
}

export default AppointmentsPage;
