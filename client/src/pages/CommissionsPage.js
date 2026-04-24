import React from 'react';
import CrudPage from './CrudPage';

const columns = [
  { key: 'artist_name', label: 'Artist' },
  { key: 'appointment_id', label: 'Appt ID' },
  { key: 'service_amount', label: 'Service', render: (v) => v ? `$${v}` : '\u2014' },
  { key: 'commission_rate', label: 'Rate', render: (v) => v ? `${v}%` : '\u2014' },
  { key: 'commission_amount', label: 'Commission', render: (v) => v ? `$${v}` : '\u2014' },
  { key: 'paid', label: 'Paid', render: (v) => (
    <span className={`badge ${v ? 'badge-success' : 'badge-warning'}`}>{v ? 'Paid' : 'Pending'}</span>
  )},
];

const fields = [
  { key: 'id', label: 'ID' },
  { key: 'artist_name', label: 'Artist' },
  { key: 'artist_id', label: 'Artist ID' },
  { key: 'appointment_id', label: 'Appointment ID' },
  { key: 'service_amount', label: 'Service Amount', render: (v) => v ? `$${v}` : '\u2014' },
  { key: 'commission_rate', label: 'Commission Rate', render: (v) => v ? `${v}%` : '\u2014' },
  { key: 'commission_amount', label: 'Commission Amount', render: (v) => v ? `$${v}` : '\u2014' },
  { key: 'tip_amount', label: 'Tip Amount', render: (v) => v ? `$${v}` : '\u2014' },
  { key: 'paid', label: 'Paid' },
  { key: 'paid_date', label: 'Paid Date' },
  { key: 'notes', label: 'Notes' },
  { key: 'created_at', label: 'Created' },
];

const formFields = [
  { key: 'artist_id', label: 'Artist ID', type: 'number', placeholder: 'Artist ID' },
  { key: 'appointment_id', label: 'Appointment ID', type: 'number', placeholder: 'Appointment ID' },
  { key: 'service_amount', label: 'Service Amount ($)', type: 'number', placeholder: '200' },
  { key: 'commission_rate', label: 'Commission Rate (%)', type: 'number', placeholder: '60' },
  { key: 'commission_amount', label: 'Commission Amount ($)', type: 'number', placeholder: '120' },
  { key: 'tip_amount', label: 'Tip Amount ($)', type: 'number', placeholder: '0' },
  { key: 'paid', label: 'Paid', type: 'checkbox', checkboxLabel: 'Commission has been paid' },
  { key: 'paid_date', label: 'Paid Date', type: 'date' },
  { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional notes' },
];

function CommissionsPage() {
  return <CrudPage endpoint="commissions" title="Commissions" icon="\uD83D\uDCB0" columns={columns} fields={fields} formFields={formFields} />;
}

export default CommissionsPage;
