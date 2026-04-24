import React from 'react';
import CrudPage from './CrudPage';

const columns = [
  { key: 'name', label: 'Item' },
  { key: 'category', label: 'Category' },
  { key: 'quantity', label: 'Qty' },
  { key: 'min_quantity', label: 'Min Qty' },
  { key: 'unit_price', label: 'Price', render: (v) => v ? `$${v}` : '\u2014' },
  { key: 'status', label: 'Status', render: (_, row) => {
    if (row.quantity <= 0) return <span className="badge badge-danger">Out of Stock</span>;
    if (row.quantity <= (row.min_quantity || 5)) return <span className="badge badge-warning">Low Stock</span>;
    return <span className="badge badge-success">In Stock</span>;
  }},
];

const fields = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Item Name' },
  { key: 'category', label: 'Category' },
  { key: 'brand', label: 'Brand' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'min_quantity', label: 'Min Quantity' },
  { key: 'unit_price', label: 'Unit Price', render: (v) => v ? `$${v}` : '\u2014' },
  { key: 'supplier', label: 'Supplier' },
  { key: 'expiry_date', label: 'Expiry Date' },
  { key: 'lot_number', label: 'Lot Number' },
  { key: 'notes', label: 'Notes' },
  { key: 'created_at', label: 'Created' },
];

const formFields = [
  { key: 'name', label: 'Item Name', placeholder: 'e.g., Black Ink 1oz' },
  { key: 'category', label: 'Category', type: 'select', options: [
    { value: 'ink', label: 'Ink' },
    { value: 'needles', label: 'Needles' },
    { value: 'gloves', label: 'Gloves' },
    { value: 'tubes', label: 'Tubes' },
    { value: 'cleaning', label: 'Cleaning Supplies' },
    { value: 'aftercare', label: 'Aftercare Products' },
    { value: 'other', label: 'Other' },
  ]},
  { key: 'brand', label: 'Brand', placeholder: 'Brand name' },
  { key: 'quantity', label: 'Quantity', type: 'number', placeholder: '0' },
  { key: 'min_quantity', label: 'Min Quantity (alert threshold)', type: 'number', placeholder: '5' },
  { key: 'unit_price', label: 'Unit Price ($)', type: 'number', placeholder: '0' },
  { key: 'supplier', label: 'Supplier', placeholder: 'Supplier name' },
  { key: 'expiry_date', label: 'Expiry Date', type: 'date' },
  { key: 'lot_number', label: 'Lot Number', placeholder: 'LOT-XXX' },
  { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional notes' },
];

function InventoryPage() {
  return <CrudPage endpoint="inventory" title="Inventory" icon="\uD83D\uDCE6" columns={columns} fields={fields} formFields={formFields} />;
}

export default InventoryPage;
