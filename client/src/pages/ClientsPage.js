import React from 'react';
import CrudPage from './CrudPage';

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'preferred_style', label: 'Preferred Style' },
  { key: 'total_visits', label: 'Visits' },
];

const fields = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'date_of_birth', label: 'Date of Birth' },
  { key: 'preferred_style', label: 'Preferred Style' },
  { key: 'skin_type', label: 'Skin Type' },
  { key: 'allergies', label: 'Allergies' },
  { key: 'medical_conditions', label: 'Medical Conditions' },
  { key: 'emergency_contact', label: 'Emergency Contact' },
  { key: 'emergency_phone', label: 'Emergency Phone' },
  { key: 'total_visits', label: 'Total Visits' },
  { key: 'notes', label: 'Notes' },
  { key: 'created_at', label: 'Created' },
];

const formFields = [
  { key: 'name', label: 'Name', placeholder: 'Full name' },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'email@example.com' },
  { key: 'phone', label: 'Phone', placeholder: '555-0100' },
  { key: 'date_of_birth', label: 'Date of Birth', type: 'date' },
  { key: 'preferred_style', label: 'Preferred Style', placeholder: 'e.g., Traditional, Realism' },
  { key: 'skin_type', label: 'Skin Type', type: 'select', options: [
    { value: 'normal', label: 'Normal' },
    { value: 'sensitive', label: 'Sensitive' },
    { value: 'dry', label: 'Dry' },
    { value: 'oily', label: 'Oily' },
  ]},
  { key: 'allergies', label: 'Allergies', type: 'textarea', placeholder: 'Known allergies' },
  { key: 'medical_conditions', label: 'Medical Conditions', type: 'textarea', placeholder: 'Any medical conditions' },
  { key: 'emergency_contact', label: 'Emergency Contact', placeholder: 'Contact name' },
  { key: 'emergency_phone', label: 'Emergency Phone', placeholder: '555-0100' },
  { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional notes' },
];

function ClientsPage() {
  return <CrudPage endpoint="clients" title="Clients" icon="\uD83E\uDDD1" columns={columns} fields={fields} formFields={formFields} />;
}

export default ClientsPage;
