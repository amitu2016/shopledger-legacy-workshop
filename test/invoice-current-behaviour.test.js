const assert = require('node:assert/strict');
const test = require('node:test');

const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');
const reports = require('../lib/reports');

test('invoice uses the same HSN GST and CGST/SGST amounts as the order pricing', function () {
  const items = [
    { id: 1, sku: 'RICE-1', name: 'Rice', hsn: '1006', price: 100, qty: 2 }
  ];

  const billed = pricing.computeTotals(items, '');
  const printed = invoice.computeInvoiceFigures({ items: items, coupon: '' });

  assert.equal(billed.subtotal, 200);
  assert.equal(billed.tax, 10);
  assert.equal(billed.cgst, 5);
  assert.equal(billed.sgst, 5);
  assert.equal(billed.total, 210);
  assert.equal(billed.lines[0].gstPercent, 5);

  assert.equal(printed.tax, billed.tax);
  assert.equal(printed.cgst, billed.cgst);
  assert.equal(printed.sgst, billed.sgst);
  assert.equal(printed.total, billed.total);
  assert.equal(printed.rows[0].gstPercent, billed.lines[0].gstPercent);
  assert.equal(printed.rows[0].lineTax, billed.lines[0].tax);
});

test('invoice interprets a fractional gstRate consistently with order pricing', function () {
  const items = [
    { id: 2, name: 'Item with stored fractional rate', hsn: '1006', price: 100, qty: 1, gstRate: 0.05 }
  ];
  const printed = invoice.computeInvoiceFigures({
    items: items,
    coupon: ''
  });
  const billed = pricing.computeTotals(items, '');

  assert.equal(printed.rows[0].gstPercent, 5);
  assert.equal(printed.rows[0].lineTax, billed.lines[0].tax);
  assert.equal(printed.tax, billed.tax);
  assert.equal(printed.total, billed.total);
});

test('invoice applies coupon discount and GST exactly as order pricing does', function () {
  const items = [
    { id: 3, name: 'Coffee', hsn: '0901', price: 2000, qty: 2 }
  ];

  const billed = pricing.computeTotals(items, 'WHOLESALE15');
  const printed = invoice.computeInvoiceFigures({ items: items, coupon: 'WHOLESALE15' });

  assert.equal(billed.subtotal, 4000);
  assert.equal(billed.discount, 400);
  assert.equal(billed.tax, 648);
  assert.equal(billed.total, 4248);

  assert.equal(printed.subtotal, billed.subtotal);
  assert.equal(printed.tax, billed.tax);
  assert.equal(printed.discount, billed.discount);
  assert.equal(printed.total, billed.total);
});

test('GST reconciliation reports no mismatch for an order using its billed totals', function () {
  const order = {
    id: 42,
    date: '21/11/2026',
    customer: 'Example customer',
    status: 'completed',
    coupon: '',
    items: [
      { id: 1, name: 'Rice', hsn: '1006', price: 100, qty: 2 }
    ],
    subtotal: 200,
    discount: 0,
    tax: 10,
    total: 210
  };

  const result = reports.getGstReconciliation({ orders: [order] });

  assert.equal(result.totalChecked, 1);
  assert.equal(result.mismatchCount, 0);
  assert.equal(result.totalDelta, 0);
  assert.equal(result.rows[0].ledgerTax, 10);
  assert.equal(result.rows[0].invoiceTax, 10);
  assert.equal(result.rows[0].ledgerTotal, 210);
  assert.equal(result.rows[0].invoiceTotal, 210);
  assert.equal(result.rows[0].delta, 0);
  assert.equal(result.rows[0].matched, true);
});
