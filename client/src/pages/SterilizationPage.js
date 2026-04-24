import React from 'react';
import CrudPage from './CrudPage';

const columns = [
  { key: 'equipment_name', label: 'Equipment' },
  { key: 'sterilization_type', label: 'Type' },
  { key: 'date', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString() : '\u2014' },
  { key: 'performed_by', label: 'Performed By' },
  { key: 'result', label: 'Result', render: (v) => {
    const cls = v === 'pass' ? 'badge-success' : v === 'fail' ? 'badge-danger' : 'badge-warning';
    return <span className={`badge ${cls}`}>{v || 'pending'}</span>;
  }},
];

const fields = [
  { key: 'id', label: 'ID' },
  { key: 'equipment_name', label: 'Equipment' },
  { key: 'sterilization_type', label: 'Type' },
  { key: 'date', label: 'Date' },
  { key: 'time', label: 'Time' },
  { key: 'performed_by', label: 'Performed By' },
  { key: 'temperature', label: 'Temperature' },
  { key: 'duration_minutes', label: 'Duration (min)' },
  { key: 'result', label: 'Result' },
  { key: 'spore_test', label: 'Spore Test' },
  { key: 'notes', label: 'Notes' },
  { key: 'created_at', label: 'Created' },
];

const formFields = [
  { key: 'equipment_name', label: 'Equipment Name', placeholder: 'e.g., Autoclave #1' },
  { key: 'sterilization_type', label: 'Type', type: 'select', options: [
    { value: 'autoclave', label: 'Autoclave' },
    { value: 'chemical', label: 'Chemical' },
    { value: 'uv', label: 'UV Sterilization' },
    { value: 'dry_heat', label: 'Dry Heat' },
  ]},
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'time', label: 'Time', type: 'time' },
  { key: 'performed_by', label: 'Performed By', placeholder: 'Staff name' },
  { key: 'temperature', label: 'Temperature', placeholder: '270F' },
  { key: 'duration_minutes', label: 'Duration (minutes)', type: 'number', placeholder: '30' },
  { key: 'result', label: 'Result', type: 'select', options: [
    { value: 'pass', label: 'Pass' },
    { value: 'fail', label: 'Fail' },
    { value: 'pending', label: 'Pending' },
  ]},
  { key: 'spore_test', label: 'Spore Test', type: 'checkbox', checkboxLabel: 'Spore test performed' },
  { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional notes' },
];

function SterilizationPage() {
  return <CrudPage endpoint="sterilization" title="Sterilization Logs" icon="\uD83D\uDD2C" columns={columns} fields={fields} formFields={formFields} />;
}

export default SterilizationPage;
