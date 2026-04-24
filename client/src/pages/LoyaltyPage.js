import React from 'react';
import CrudPage from './CrudPage';

const columns = [
  { key: 'client_name', label: 'Client' },
  { key: 'points', label: 'Points' },
  { key: 'tier', label: 'Tier', render: (v) => {
    const cls = v === 'gold' ? 'badge-warning' : v === 'platinum' ? 'badge-info' : v === 'silver' ? 'badge-default' : 'badge-default';
    return <span className={`badge ${cls}`}>{v || 'bronze'}</span>;
  }},
  { key: 'total_spent', label: 'Total Spent', render: (v) => v ? `$${v}` : '\u2014' },
  { key: 'visits', label: 'Visits' },
];

const fields = [
  { key: 'id', label: 'ID' },
  { key: 'client_name', label: 'Client' },
  { key: 'client_id', label: 'Client ID' },
  { key: 'points', label: 'Points' },
  { key: 'tier', label: 'Tier' },
  { key: 'total_spent', label: 'Total Spent', render: (v) => v ? `$${v}` : '\u2014' },
  { key: 'visits', label: 'Visits' },
  { key: 'rewards_redeemed', label: 'Rewards Redeemed' },
  { key: 'last_visit', label: 'Last Visit' },
  { key: 'notes', label: 'Notes' },
  { key: 'created_at', label: 'Created' },
];

const formFields = [
  { key: 'client_id', label: 'Client ID', type: 'number', placeholder: 'Client ID' },
  { key: 'points', label: 'Points', type: 'number', placeholder: '0' },
  { key: 'tier', label: 'Tier', type: 'select', options: [
    { value: 'bronze', label: 'Bronze' },
    { value: 'silver', label: 'Silver' },
    { value: 'gold', label: 'Gold' },
    { value: 'platinum', label: 'Platinum' },
  ]},
  { key: 'total_spent', label: 'Total Spent ($)', type: 'number', placeholder: '0' },
  { key: 'visits', label: 'Visits', type: 'number', placeholder: '0' },
  { key: 'rewards_redeemed', label: 'Rewards Redeemed', type: 'number', placeholder: '0' },
  { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional notes' },
];

function LoyaltyPage() {
  return <CrudPage endpoint="loyalty" title="Loyalty Program" icon="\u2B50" columns={columns} fields={fields} formFields={formFields} />;
}

export default LoyaltyPage;
