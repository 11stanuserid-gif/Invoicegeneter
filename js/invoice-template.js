import { formatINR, formatINRZero, formatDate } from './utils.js';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildMetaLines(items) {
  return items
    .filter(item => item.value !== undefined && item.value !== null && String(item.value).trim() !== '')
    .map(item => `
      <div class="inv-meta-line">
        <span class="meta-label">${escapeHtml(item.label)}</span>
        <span class="meta-value">${escapeHtml(item.value)}</span>
      </div>
    `)
    .join('');
}

function buildPartyMeta(inv) {
  return buildMetaLines([
    { label: 'Party', value: inv.partyName },
    { label: 'Place of Supply', value: inv.placeOfSupply },
    { label: 'State', value: inv.state },
    { label: 'State Code', value: inv.stateCode },
    { label: 'Party GSTIN', value: inv.partyGstin }
  ]);
}

function buildInvoiceMeta(inv) {
  return buildMetaLines([
    { label: 'Invoice No.', value: inv.invoiceNo },
    { label: 'Challan No.', value: inv.challanNo },
    { label: 'Invoice Date', value: formatDate(inv.invoiceDate) },
    { label: 'Vehicle No.', value: inv.vehicleNo }
  ]);
}

function buildContact(c) {
  const chips = [];
  if (c.mobile01) chips.push(`<span class="contact-pill">📞 +91 ${escapeHtml(c.mobile01)}</span>`);
  if (c.mobile02) chips.push(`<span class="contact-pill">📞 +91 ${escapeHtml(c.mobile02)}</span>`);
  if (c.email) chips.push(`<span class="contact-pill">✉ ${escapeHtml(c.email)}</span>`);

  if (!chips.length) return '';
  return `<div class="inv-contact inv-contact-centered">${chips.join('')}</div>`;
}

function buildItemsTable(items) {
  const safeItems = Array.isArray(items) ? items : [];
  const minRows = 12;
  const rows = safeItems.map((it, i) => `
    <tr class="fill-row">
      <td>${i + 1}</td>
      <td>${escapeHtml(it.particulars || '')}</td>
      <td>${(it.qty !== '' && it.qty !== null && it.qty !== 0 && it.qty !== undefined) ? escapeHtml(it.qty) : ''}</td>
      <td>${formatINR(it.rate)}</td>
      <td>${formatINR(it.amount)}</td>
    </tr>
  `);

  const remaining = Math.max(minRows - safeItems.length, 0);
  for (let i = 0; i < remaining; i++) {
    rows.push('<tr class="fill-row"><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>');
  }

  return `
    <table class="inv-table" aria-label="Invoice items table">
      <thead>
        <tr>
          <th style="width:50px;">SR.<br>NO.</th>
          <th>PARTICULARS</th>
          <th style="width:80px;">QTY.</th>
          <th style="width:100px;">RATE</th>
          <th style="width:110px;">AMOUNT</th>
        </tr>
      </thead>
      <tbody>${rows.join('')}</tbody>
    </table>
  `;
}

function buildBrandBlock(c, fullName) {
  const safeFullName = fullName || 'Royal Creation';
  const useBundledWordmark = safeFullName.trim().toLowerCase() === 'royal creation';
  const brandLogo = c.logoUrl
    ? `<div class="inv-brand-logo-wrap"><img class="inv-brand-logo" src="${c.logoUrl}" alt="${escapeHtml(safeFullName)} logo"></div>`
    : '';

  const brandName = useBundledWordmark
    ? `<img class="inv-brand-wordmark" src="assets/royal-creation-wordmark.png" alt="${escapeHtml(safeFullName)}">`
    : `<h1 class="inv-company-name" style="${c.nameColor ? `color:${escapeHtml(c.nameColor)};` : ''}">${escapeHtml(safeFullName)}</h1>`;

  return `
    <div class="inv-brand">
      <div class="inv-tax-badge">${escapeHtml(c.topTitle || 'TAX INVOICE')}</div>
      ${brandLogo}
      <div class="inv-brand-title">${brandName}</div>
      ${c.subTitle ? `<div class="inv-subtitle">${escapeHtml(c.subTitle)}</div>` : ''}
      ${buildContact(c)}
    </div>
  `;
}

export function renderInvoiceTemplate(style, invoice, company) {
  const inv = invoice || {};
  const c = company || {};
  const name01 = (c.name01 || 'Royal').trim();
  const name02 = (c.name02 || 'Creation').trim();
  const fullName = [name01, name02].filter(Boolean).join(' ').trim() || 'Royal Creation';
  const bankHTML = c.bankDetail || '';
  const address = c.address || '';

  return `
    <div class="invoice-paper style-1 standard-invoice" id="invoicePaper" data-layout="standard-royal">
      <div class="inv-top centered-header">
        ${buildBrandBlock(c, fullName)}
      </div>

      ${address ? `<div class="inv-address"><strong>ADDRESS:</strong> ${escapeHtml(address)}</div>` : ''}

      <div class="inv-meta">
        <div>
          <div class="inv-meta-block-title">Party Details</div>
          ${buildPartyMeta(inv)}
        </div>
        <div>
          <div class="inv-meta-block-title">Invoice Details</div>
          ${buildInvoiceMeta(inv)}
        </div>
      </div>

      <div class="items-section">
        ${buildItemsTable(inv.items || [])}
      </div>

      <div class="bottom-block">
        <div class="left-bottom">
          <div class="words-box">
            <div class="words-label">Total in Words</div>
            <div class="words-text">${escapeHtml(inv.totalInWords || '')}</div>
          </div>
          ${c.gstin ? `<div class="gstin-bar">GSTIN : ${escapeHtml(c.gstin)}</div>` : ''}
          <div class="bank-box">
            <div class="bank-title-s1">Bank Details</div>
            <div class="bank-html">${bankHTML}</div>
          </div>
        </div>

        <div class="right-bottom">
          <div class="totals-side">
            <div><span>Total</span><span>${formatINRZero(inv.subtotal)}</span></div>
            <div><span>SGST @ ${escapeHtml(inv.sgst || 0)}%</span><span>${formatINRZero(inv.sgstAmt)}</span></div>
            <div><span>CGST @ ${escapeHtml(inv.cgst || 0)}%</span><span>${formatINRZero(inv.cgstAmt)}</span></div>
            <div><span>IGST @ ${escapeHtml(inv.igst || 0)}%</span><span>${formatINRZero(inv.igstAmt)}</span></div>
            <div><span>Invoice Total</span><span>${formatINRZero(inv.invoiceTotal)}</span></div>
          </div>

          <div class="for-section two-signatures">
            <div class="signature-panel">
              <div class="signature-title">Receiver's Signature</div>
              ${inv.signatureUrl ? `<div class="sig-img"><img src="${inv.signatureUrl}" alt="Receiver signature"></div>` : `<div class="sig-img"></div>`}
            </div>
            <div class="signature-panel">
              <div class="for-name">For ${escapeHtml(fullName)}</div>
              ${c.signUrl ? `<div class="sig-img"><img src="${c.signUrl}" alt="Authorised signature"></div>` : `<div class="sig-img"></div>`}
              <div class="auth-sig">Authorised Signature</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function getDemoInvoice() {
  return {
    invoiceNo: 'INV-2601-1092',
    challanNo: '20398',
    invoiceDate: '2026-05-12',
    vehicleNo: 'MH 48 BY 3988',
    partyName: 'Royal Creation',
    partyGstin: 'Heera Enterprises',
    placeOfSupply: 'Mumbai',
    state: 'Maharashtra',
    stateCode: '27',
    items: [{ particulars: 'Tiles', qty: 394, rate: 5000, amount: 1970000 }],
    subtotal: 1970000,
    cgst: 5,
    sgst: 5,
    igst: 0,
    cgstAmt: 98500,
    sgstAmt: 98500,
    igstAmt: 0,
    invoiceTotal: 2167000,
    totalInWords: 'Twenty One Lakh Sixty Seven Thousand Rupees Only'
  };
}
