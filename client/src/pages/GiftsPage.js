import React from 'react';
import CrudPage from './CrudPage';

const columns = [
  { key: 'code', label: 'Code' },
  { key: 'recipient_name', label: 'Recipient' },
  { key: 'amount', label: 'Amount', render: (v) => v ? `$${v}` : '\u2014' },
  { key: 'remaining_balance', label: 'Balance', render: (v) => v ? `$${v}` : '\u2014' },
  { key: 'status', label: 'Status', render: (v) => {
    const cls = v === 'active' ? 'badge-success' : v === 'redeemed' ? 'badge-info' : v === 'expired' ? 'badge-danger' : 'badge-default';
    return <span className={`badge ${cls}`}>{v || 'active'}</span>;
  }},
  { key: 'expiry_date', label: 'Expires', render: (v) => v ? new Date(v).toLocaleDateString() : '\u2014' },
];

const fields = [
  { key: 'id', label: 'ID' },
  { key: 'code', label: 'Certificate Code' },
  { key: 'purchaser_name', label: 'Purchaser' },
  { key: 'purchaser_email', label: 'Purchaser Email' },
  { key: 'recipient_name', label: 'Recipient' },
  { key: 'recipient_email', label: 'Recipient Email' },
  { key: 'amount', label: 'Amount', render: (v) => v ? `$${v}` : '\u2014' },
  { key: 'remaining_balance', label: 'Remaining Balance', render: (v) => v ? `$${v}` : '\u2014' },
  { key: 'message', label: 'Personal Message' },
  { key: 'status', label: 'Status' },
  { key: 'expiry_date', label: 'Expiry Date' },
  { key: 'created_at', label: 'Created' },
];

const formFields = [
  { key: 'purchaser_name', label: 'Purchaser Name', placeholder: 'Name' },
  { key: 'purchaser_email', label: 'Purchaser Email', type: 'email', placeholder: 'email@example.com' },
  { key: 'recipient_name', label: 'Recipient Name', placeholder: 'Name' },
  { key: 'recipient_email', label: 'Recipient Email', type: 'email', placeholder: 'email@example.com' },
  { key: 'amount', label: 'Amount ($)', type: 'number', placeholder: '100' },
  { key: 'message', label: 'Personal Message', type: 'textarea', placeholder: 'Gift message' },
  { key: 'expiry_date', label: 'Expiry Date', type: 'date' },
  { key: 'status', label: 'Status', type: 'select', options: [
    { value: 'active', label: 'Active' },
    { value: 'redeemed', label: 'Redeemed' },
    { value: 'expired', label: 'Expired' },
  ]},
];

function GiftsPage() {
  return <CrudPage endpoint="gifts" title="Gift Certificates" icon="\uD83C\uDF81" columns={columns} fields={fields} formFields={formFields} />;
}

export default GiftsPage;
