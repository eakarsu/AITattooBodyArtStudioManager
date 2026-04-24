import React from 'react';
import CrudPage from './CrudPage';

const columns = [
  { key: 'name', label: 'Design Name' },
  { key: 'style', label: 'Style' },
  { key: 'size', label: 'Size' },
  { key: 'price', label: 'Price', render: (v) => v ? `$${v}` : '\u2014' },
  { key: 'artist_name', label: 'Artist' },
  { key: 'available', label: 'Available', render: (v) => (
    <span className={`badge ${v ? 'badge-success' : 'badge-default'}`}>{v ? 'Available' : 'Taken'}</span>
  )},
];

const fields = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Design Name' },
  { key: 'description', label: 'Description' },
  { key: 'style', label: 'Style' },
  { key: 'size', label: 'Size' },
  { key: 'colors', label: 'Colors' },
  { key: 'placement_suggestions', label: 'Placement Suggestions' },
  { key: 'price', label: 'Price', render: (v) => v ? `$${v}` : '\u2014' },
  { key: 'artist_name', label: 'Artist' },
  { key: 'artist_id', label: 'Artist ID' },
  { key: 'image_url', label: 'Image URL' },
  { key: 'available', label: 'Available' },
  { key: 'times_done', label: 'Times Done' },
  { key: 'created_at', label: 'Created' },
];

const formFields = [
  { key: 'name', label: 'Design Name', placeholder: 'e.g., Floral Mandala' },
  { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Design description' },
  { key: 'style', label: 'Style', type: 'select', options: [
    { value: 'traditional', label: 'Traditional' },
    { value: 'neo-traditional', label: 'Neo-Traditional' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'realism', label: 'Realism' },
    { value: 'blackwork', label: 'Blackwork' },
    { value: 'watercolor', label: 'Watercolor' },
    { value: 'geometric', label: 'Geometric' },
    { value: 'minimalist', label: 'Minimalist' },
    { value: 'dotwork', label: 'Dotwork' },
    { value: 'tribal', label: 'Tribal' },
    { value: 'other', label: 'Other' },
  ]},
  { key: 'size', label: 'Size', placeholder: 'e.g., 3x3 inches' },
  { key: 'colors', label: 'Colors', placeholder: 'e.g., Black & grey, Full color' },
  { key: 'placement_suggestions', label: 'Placement Suggestions', placeholder: 'e.g., forearm, ankle' },
  { key: 'price', label: 'Price ($)', type: 'number', placeholder: '150' },
  { key: 'artist_id', label: 'Artist ID', type: 'number', placeholder: 'Artist ID' },
  { key: 'image_url', label: 'Image URL', placeholder: 'https://...' },
  { key: 'available', label: 'Available', type: 'checkbox', checkboxLabel: 'Design is available', defaultValue: true },
];

function FlashPage() {
  return <CrudPage endpoint="flash" title="Flash Designs" icon="\u26A1" columns={columns} fields={fields} formFields={formFields} />;
}

export default FlashPage;
