import { jsPDF } from 'jspdf';

interface InvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceData {
  orderNumber: string;
  dateTime: string;
  customerName: string;
  deliveryMethod: string;
  address?: string;
  phone?: string;
  items: InvoiceItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  discountCode: string;
  total: number;
  paymentMethod: string;
  paymentNote: string;
}

const COMPANY = {
  name: 'Cedokamall',
  address: '35 Ailegun Road, Ejigbo, Lagos',
  phone: '+234 912 881 7136',
  email: 'support@cedokamall.com',
  website: 'cedokamall.com',
};

export const generateInvoicePDF = (data: InvoiceData): jsPDF => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  const rightAlign = (text: string, y: number, offsetX = 0) => {
    const textWidth = doc.getTextWidth(text);
    doc.text(text, pageWidth - margin - offsetX - textWidth, y);
  };

  doc.setFont('helvetica', 'normal');

  // --- HEADER ---
  // Top bar
  doc.setFillColor(26, 26, 46);
  doc.rect(0, 0, pageWidth, 45, 'F');
  doc.setTextColor(201, 168, 76);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text(COMPANY.name, margin, 30);
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Premium Online Marketplace', margin, 38);

  // Invoice title on right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(201, 168, 76);
  rightAlign('INVOICE', 22);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(180, 180, 180);
  rightAlign('Payment Receipt / Tax Document', 30);

  // --- COMPANY INFO ---
  let y = 58;
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'normal');
  doc.text(COMPANY.address, margin, y);
  y += 5;
  doc.text(`Phone: ${COMPANY.phone}`, margin, y);
  y += 5;
  doc.text(`Email: ${COMPANY.email}`, margin, y);
  y += 5;
  doc.text(`Web: ${COMPANY.website}`, margin, y);

  // --- INVOICE DETAILS (right side) ---
  const invoiceDetailsY = 58;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  rightAlign('INVOICE NO:', invoiceDetailsY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  rightAlign(data.orderNumber, invoiceDetailsY, 50);
  y = invoiceDetailsY + 5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  rightAlign('DATE:', y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  rightAlign(data.dateTime, y, 50);
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  rightAlign('CUSTOMER:', y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  rightAlign(data.customerName, y, 50);

  // --- DIVIDER ---
  y = 85;
  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);

  // --- BILL TO ---
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(26, 26, 46);
  doc.text('BILL TO', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`Name: ${data.customerName}`, margin, y);
  y += 5;
  doc.text(`Delivery: ${data.deliveryMethod}`, margin, y);
  y += 5;
  if (data.address) {
    doc.text(`Address: ${data.address}`, margin, y);
    y += 5;
  }
  if (data.phone) {
    doc.text(`Phone: ${data.phone}`, margin, y);
    y += 5;
  }
  doc.text(`Payment: ${data.paymentMethod}`, margin, y);

  // --- ITEMS TABLE ---
  y += 10;
  // Table header
  const tableTop = y;
  doc.setFillColor(26, 26, 46);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('ITEM', margin + 5, y + 5.5);
  doc.text('QTY', margin + contentWidth - 70, y + 5.5);
  doc.text('UNIT PRICE', margin + contentWidth - 50, y + 5.5);
  doc.text('TOTAL', margin + contentWidth - 20, y + 5.5);
  y += 8;

  // Table rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const rowHeight = 7;
  data.items.forEach((item, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(248, 248, 250);
      doc.rect(margin, y, contentWidth, rowHeight, 'F');
    }
    doc.setTextColor(60, 60, 60);
    doc.text(item.name, margin + 5, y + 5);
    doc.text(String(item.quantity), margin + contentWidth - 70, y + 5);
    doc.text(`₦${item.unitPrice.toLocaleString()}`, margin + contentWidth - 50, y + 5);
    doc.text(`₦${item.total.toLocaleString()}`, margin + contentWidth - 20, y + 5);
    y += rowHeight;
  });

  // Table bottom line
  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);

  // --- TOTALS ---
  y += 8;
  const totalsX = pageWidth - margin - 70;
  const totalsWidth = 70;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);

  const rowLabel = (label: string, value: string, yPos: number, bold = false) => {
    if (bold) doc.setFont('helvetica', 'bold');
    else doc.setFont('helvetica', 'normal');
    doc.text(label, totalsX, yPos);
    doc.text(value, pageWidth - margin, yPos, { align: 'right' });
  };

  rowLabel('Subtotal:', `₦${data.subtotal.toLocaleString()}`, y);
  y += 5;
  rowLabel('Delivery:', data.deliveryFee > 0 ? `₦${data.deliveryFee.toLocaleString()}` : 'FREE', y);
  y += 5;
  if (data.discount > 0) {
    rowLabel(`Discount (${data.discountCode}):`, `-${Math.round(data.discount * 100)}%`, y);
    y += 5;
  }

  // Total line
  doc.setDrawColor(26, 26, 46);
  doc.setLineWidth(0.5);
  doc.line(totalsX, y + 1, pageWidth - margin, y + 1);
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(26, 26, 46);
  rowLabel('TOTAL:', `₦${data.total.toLocaleString()}`, y, true);

  // --- PAYMENT INFO ---
  y += 12;
  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(26, 26, 46);
  doc.text('PAYMENT INFORMATION', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  const paymentLines = data.paymentNote.split('\n');

  let isCustomerSection = false;
  paymentLines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed === '--- PAYMENT DETAILS FROM CUSTOMER ---') {
      isCustomerSection = true;
      y += 2;
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
      y += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(26, 26, 46);
      doc.text('CUSTOMER PAYMENT DETAILS', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      y += 5;
      return;
    }
    if (trimmed.startsWith('---') && trimmed.endsWith('---')) return;
    if (isCustomerSection && trimmed) {
      doc.setFont('helvetica', 'bold');
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx > 0) {
        const label = trimmed.substring(0, colonIdx + 1);
        const value = trimmed.substring(colonIdx + 1).trim();
        doc.setTextColor(60, 60, 60);
        doc.text(label, margin, y);
        const labelWidth = doc.getTextWidth(label);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text(value, margin + labelWidth + 1, y);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text(trimmed, margin, y);
      }
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(trimmed, margin, y);
    }
    y += 5;
  });

  // --- TERMS ---
  y += 6;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text('Terms & Conditions:', margin, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text('1. All items are subject to availability.', margin, y);
  y += 4;
  doc.text('2. Delivery times are estimates and may vary.', margin, y);
  y += 4;
  doc.text('3. Please confirm your order by replying to the WhatsApp message.', margin, y);

  // --- FOOTER ---
  doc.setFillColor(26, 26, 46);
  doc.rect(0, 280, pageWidth, 17, 'F');
  doc.setTextColor(201, 168, 76);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Thank you for shopping with Cedokamall!', pageWidth / 2, 289, { align: 'center' });
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text(`${COMPANY.name} | ${COMPANY.address} | ${COMPANY.phone}`, pageWidth / 2, 294, { align: 'center' });

  return doc;
};
