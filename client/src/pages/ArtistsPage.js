import React from 'react';
import CrudPage from './CrudPage';

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'specialties', label: 'Specialties' },
  { key: 'experience_years', label: 'Experience' },
  { key: 'hourly_rate', label: 'Rate', render: (v) => v ? `$${v}/hr` : '\u2014' },
  { key: 'rating', label: 'Rating', render: (v) => v ? `${v}/5` : '\u2014' },
  { key: 'available', label: 'Status', render: (v) => (
    <span className={`badge ${v ? 'badge-success' : 'badge-default'}`}>{v ? 'Available' : 'Unavailable'}</span>
  )},
];

const fields = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'specialties', label: 'Specialties' },
  { key: 'bio', label: 'Bio' },
  { key: 'experience_years', label: 'Experience (Years)' },
  { key: 'hourly_rate', label: 'Hourly Rate', render: (v) => v ? `$${v}` : '\u2014' },
  { key: 'commission_rate', label: 'Commission Rate', render: (v) => v ? `${v}%` : '\u2014' },
  { key: 'portfolio_url', label: 'Portfolio URL' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'available', label: 'Available' },
  { key: 'rating', label: 'Rating', render: (v) => v ? `${v}/5` : '\u2014' },
  { key: 'created_at', label: 'Created' },
];

const formFields = [
  { key: 'name', label: 'Name', placeholder: 'Artist name' },
  { key: 'specialties', label: 'Specialties', placeholder: 'e.g., Traditional, Japanese, Realism' },
  { key: 'bio', label: 'Bio', type: 'textarea', placeholder: 'Artist biography' },
  { key: 'experience_years', label: 'Experience (Years)', type: 'number', placeholder: '0' },
  { key: 'hourly_rate', label: 'Hourly Rate ($)', type: 'number', placeholder: '0' },
  { key: 'commission_rate', label: 'Commission Rate (%)', type: 'number', placeholder: '0' },
  { key: 'portfolio_url', label: 'Portfolio URL', placeholder: 'https://...' },
  { key: 'instagram', label: 'Instagram', placeholder: '@handle' },
  { key: 'available', label: 'Available', type: 'checkbox', checkboxLabel: 'Currently available for bookings', defaultValue: true },
  { key: 'rating', label: 'Rating (0-5)', type: 'number', placeholder: '0' },
];

function ArtistsPage() {
  return <CrudPage endpoint="artists" title="Artists" icon="\uD83D\uDC64" columns={columns} fields={fields} formFields={formFields} />;
}

export default ArtistsPage;
