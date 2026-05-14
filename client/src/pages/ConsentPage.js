import React from 'react';
import CrudPage from './CrudPage';
import api from '../utils/api';

const columns = [
  { key: 'client_name', label: 'Client' },
  { key: 'service_type', label: 'Service' },
  { key: 'signed', label: 'Signed', render: (v) => (
    <span className={`badge ${v ? 'badge-success' : 'badge-warning'}`}>{v ? 'Signed' : 'Pending'}</span>
  )},
  { key: 'signed_at', label: 'Signed Date', render: (v) => v ? new Date(v).toLocaleDateString() : '\u2014' },
  { key: 'created_at', label: 'Created', render: (v) => v ? new Date(v).toLocaleDateString() : '\u2014' },
];

const fields = [
  { key: 'id', label: 'ID' },
  { key: 'client_name', label: 'Client' },
  { key: 'service_type', label: 'Service Type' },
  { key: 'content', label: 'Consent Content' },
  { key: 'signed', label: 'Signed' },
  { key: 'signed_at', label: 'Signed At' },
  { key: 'created_at', label: 'Created' },
];

const formFields = [
  { key: 'client_id', label: 'Client ID', type: 'number', placeholder: 'Client ID' },
  { key: 'service_type', label: 'Service Type', type: 'select', options: [
    { value: 'tattoo', label: 'Tattoo' },
    { value: 'piercing', label: 'Piercing' },
    { value: 'touch-up', label: 'Touch-up' },
    { value: 'removal', label: 'Removal' },
  ]},
  { key: 'content', label: 'Consent Content', type: 'textarea', placeholder: 'Consent form text' },
  { key: 'medical_disclosure', label: 'Medical Disclosure', type: 'textarea', placeholder: 'Medical conditions disclosed' },
  { key: 'signed', label: 'Signed', type: 'checkbox', checkboxLabel: 'Form has been signed' },
];

// Extra actions rendered in detail view
function ConsentActions({ item }) {
  const handleDownloadPDF = () => {
    const token = localStorage.getItem('token');
    window.open(`/api/consent/${item.id}/pdf`, '_blank');
  };

  return (
    <button
      className="btn btn-secondary"
      onClick={handleDownloadPDF}
      style={{ marginLeft: '8px' }}
    >
      Download PDF
    </button>
  );
}

function ConsentPage() {
  return <CrudPage
    endpoint="consent"
    title="Consent Forms"
    icon="\uD83D\uDCDD"
    columns={columns}
    fields={fields}
    formFields={formFields}
    extraDetailActions={(item) => <ConsentActions item={item} />}
  />;
}

export default ConsentPage;
