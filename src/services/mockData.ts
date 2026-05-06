
import type { Document, DashboardStats } from '../types';

export const MOCK_DOCUMENTS: Document[] = [
  {
    id: '1', fileName: 'invoice_001.pdf', originalName: 'Invoice_March_2024.jpg',
    category: 'Sales', blobUrl: 'https://udyogsarathi.blob.core.windows.net/docs/invoice_001.pdf',
    fileSize: 245760, uploadedAt: new Date(Date.now() - 3600000).toISOString(),
    status: 'uploaded', tags: ['invoice','Q1-2024'], uploadedBy: 'Rahul Sharma', pageCount: 2,
  },
  {
    id: '2', fileName: 'purchase_order_089.pdf', originalName: 'PO_89_Supplier.jpg',
    category: 'Purchase', blobUrl: 'https://udyogsarathi.blob.core.windows.net/docs/po_089.pdf',
    fileSize: 184320, uploadedAt: new Date(Date.now() - 7200000).toISOString(),
    status: 'uploaded', tags: ['purchase-order','vendor-A'], uploadedBy: 'Priya Patel', pageCount: 1,
  },
  {
    id: '3', fileName: 'hr_letter_045.pdf', originalName: 'Employee_Letter_045.png',
    category: 'HR', blobUrl: 'https://udyogsarathi.blob.core.windows.net/docs/hr_045.pdf',
    fileSize: 102400, uploadedAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'uploaded', tags: ['appointment','employee'], uploadedBy: 'Amit Kumar', pageCount: 3,
  },
  {
    id: '4', fileName: 'contract_vendor_q1.pdf', originalName: 'Vendor_Contract_Q1.jpg',
    category: 'Legal', blobUrl: 'https://udyogsarathi.blob.core.windows.net/docs/contract_q1.pdf',
    fileSize: 512000, uploadedAt: new Date(Date.now() - 172800000).toISOString(),
    status: 'uploaded', tags: ['contract','vendor'], uploadedBy: 'Sunita Mehta', pageCount: 8,
  },
  {
    id: '5', fileName: 'gst_return_jan2024.pdf', originalName: 'GST_Return_Jan.jpg',
    category: 'Finance', blobUrl: 'https://udyogsarathi.blob.core.windows.net/docs/gst_jan.pdf',
    fileSize: 327680, uploadedAt: new Date(Date.now() - 259200000).toISOString(),
    status: 'processing', tags: ['GST','tax','January'], uploadedBy: 'Vikram Singh', pageCount: 4,
  },
  {
    id: '6', fileName: 'stock_report_feb.pdf', originalName: 'Stock_Report_Feb.png',
    category: 'Inventory', blobUrl: 'https://udyogsarathi.blob.core.windows.net/docs/stock_feb.pdf',
    fileSize: 419840, uploadedAt: new Date(Date.now() - 345600000).toISOString(),
    status: 'uploaded', tags: ['inventory','February'], uploadedBy: 'Neha Gupta', pageCount: 6,
  },
];

export const MOCK_STATS: DashboardStats = {
  totalDocuments: 248, totalStorage: 1073741824, documentsThisMonth: 47,
  categoryCounts: { Sales:89, Purchase:62, Inventory:34, HR:28, Finance:21, Legal:14 },
  storageByCategory: [
    { category:'Sales',     size:312456192, count:89 },
    { category:'Purchase',  size:251658240, count:62 },
    { category:'Inventory', size:188743680, count:34 },
    { category:'HR',        size:136314880, count:28 },
    { category:'Finance',   size:115343360, count:21 },
    { category:'Legal',     size:69206016,  count:14 },
  ],
  recentActivity: [
    { id:'a1', action:'upload',   documentName:'Invoice_March_2024.pdf', category:'Sales',    timestamp: new Date(Date.now()-3600000).toISOString(),   user:'Rahul Sharma' },
    { id:'a2', action:'view',     documentName:'PO_89_Supplier.pdf',     category:'Purchase', timestamp: new Date(Date.now()-7200000).toISOString(),   user:'Priya Patel'  },
    { id:'a3', action:'download', documentName:'Employee_Letter_045.pdf',category:'HR',       timestamp: new Date(Date.now()-86400000).toISOString(),  user:'Amit Kumar'   },
    { id:'a4', action:'upload',   documentName:'GST_Return_Jan.pdf',     category:'Finance',  timestamp: new Date(Date.now()-172800000).toISOString(), user:'Vikram Singh' },
    { id:'a5', action:'delete',   documentName:'Old_Contract.pdf',       category:'Legal',    timestamp: new Date(Date.now()-259200000).toISOString(), user:'Sunita Mehta' },
  ],
};