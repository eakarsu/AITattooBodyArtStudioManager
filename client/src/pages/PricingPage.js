import React from 'react';
import CrudPage from './CrudPage';

const columns = [
  { key: 'service_type', label: 'Service' },
  { key: 'style', label: 'Style' },
  { key: 'size', label: 'Size' },
  { key: 'base_price', label: 'Base Price', render: (v) => v ? `$${v}` : '\u2014' },
  { key: 'estimated_hours', label: 'Est. Hours' },
  { key: 'total_estimate', label: 'Total', render: (v) => v ? `$${v}` : '\u2014' },
];

const fields = [
  { key: 'id', label: 'ID' },
  { key: 'service_type', label: 'Service Type' },
  { key: 'style', label: 'Style' },
  { key: 'size', label: 'Size' },
  { key: 'complexity', label: 'Complexity' },
  { key: 'color_work', label: 'Color Work' },
  { key: 'placement', label: 'Placement' },
  { key: 'base_price', label: 'Base Price', render: (v) => v ? `$${v}` : '\u2014' },
  { key: 'hourly_rate', label: 'Hourly Rate', render: (v) => v ? `$${v}/hr` : '\u2014' },
  { key: 'estimated_hours', label: 'Estimated Hours' },
  { key: 'total_estimate', label: 'Total Estimate', render: (v) => v ? `$${v}` : '\u2014' },
  { key: 'notes', label: 'Notes' },
  { key: 'created_at', label: 'Created' },
];

const formFields = [
  { key: 'service_type', label: 'Service Type', type: 'select', options: [
    { value: 'tattoo', label: 'Tattoo' },
    { value: 'piercing', label: 'Piercing' },
    { value: 'touch-up', label: 'Touch-up' },
    { value: 'removal', label: 'Removal' },
    { value: 'cover-up', label: 'Cover-up' },
  ]},
  { key: 'style', label: 'Style', placeholder: 'e.g., Traditional, Realism' },
  { key: 'size', label: 'Size', placeholder: 'e.g., Small, Medium, Large' },
  { key: 'complexity', label: 'Complexity', type: 'select', options: [
    { value: 'simple', label: 'Simple' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'complex', label: 'Complex' },
    { value: 'very-complex', label: 'Very Complex' },
  ]},
  { key: 'color_work', label: 'Color Work', type: 'select', options: [
    { value: 'black-grey', label: 'Black & Grey' },
    { value: 'full-color', label: 'Full Color' },
    { value: 'limited-color', label: 'Limited Color' },
  ]},
  { key: 'placement', label: 'Placement', placeholder: 'Body placement' },
  { key: 'base_price', label: 'Base Price ($)', type: 'number', placeholder: '100' },
  { key: 'hourly_rate', label: 'Hourly Rate ($)', type: 'number', placeholder: '150' },
  { key: 'estimated_hours', label: 'Estimated Hours', type: 'number', placeholder: '2' },
  { key: 'total_estimate', label: 'Total Estimate ($)', type: 'number', placeholder: '300' },
  { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Pricing notes' },
];

function PricingPage() {
  return <CrudPage endpoint="pricing" title="Pricing Calculator" icon="\uD83D\uDCB2" columns={columns} fields={fields} formFields={formFields} />;
}

export default PricingPage;
