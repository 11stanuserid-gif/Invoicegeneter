import { formatINR, formatDate } from './utils.js';

function isFilled(value) {
  return value !== undefined && value !== null && value !== '';
}

function moneyOrBlank(value) {
  if (!isFilled(value)) return '';
  return formatINR(Number(value) || 0);
}

function taxLabel(label, rate) {
  return isFilled(rate) ? `${label} @ ${rate}%` : label;
}

function buildPartyMeta(inv, useIcons = false) {
  const parts = [];

  if (inv.partyName) {
    parts.push(useIcons
      ? `<div class="inv-meta-row"><span class="ico">👤</span><span><strong>Party:</strong> ${inv.partyName}</span></div>`
      : `<div><strong>Party:</strong> ${inv.partyName}</div>`);
  }

  const placeStateParts = [];
  if (inv.placeOfSupply) placeStateParts.push(`<strong>Place of Supply:</strong> ${inv.placeOfSupply}`);
  if (inv.state) placeStateParts.push(`<strong>State:</strong> ${inv.state}`);
  if (inv.stateCode) placeStateParts.push(`<strong>State Code:</strong> ${inv.stateCode}`);
  if (placeStateParts.length) parts.push(`<div>${placeStateParts.join(' &nbsp; ')}</div>`);

  if (inv.partyGstin) {
    parts.push(useIcons
      ? `<div class="inv-meta-row inv-gstin-row"><span class="ico">#</span><span><strong>Party GSTIN:</strong> ${inv.partyGstin}</span></div>`
      : `<div class="inv-gstin-row"><strong>Party GSTIN:</strong> ${inv.partyGstin}</div>`);
  }

  return parts.join('');
}

function buildInvoiceMeta(inv, useIcons = false) {
  const parts = [];
  const items = [
    { icon: '📋', label: 'Invoice No.', value: inv.invoiceNo },
    { icon: '🚚', label: 'Challan No.', value: inv.challanNo },
    { icon: '📅', label: 'Invoice Date', value: inv.invoiceDate ? formatDate(inv.invoiceDate) : '' },
    { icon: '🚗', label: 'Vehicle No.', value: inv.vehicleNo }
  ];

  items.forEach((item) => {
    if (!item.value) return;
    if (useIcons) {
      parts.push(`<div class="inv-meta-row"><span class="ico">${item.icon}</span><span><strong>${item.label}:</strong> ${item.value}</span></div>`);
    } else {
      parts.push(`<div><strong>${item.label}:</strong> ${item.value}</div>`);
    }
  });

  return parts.join('');
}

function buildContact(company, useCircleIcons = false) {
  const phones = [];
  if (company.mobile01) phones.push(company.mobile01);
  if (company.mobile02) phones.push(company.mobile02);
  if (!phones.length && !company.email) return '';

  const phoneIcon = useCircleIcons ? `<span class="ic-circle">📞</span>` : '📞';
  const emailIcon = useCircleIcons ? `<span class="ic-circle">✉</span>` : '✉';

  const parts = [];
  phones.forEach((phone) => {
    parts.push(`<div class="row">${phoneIcon} <span class="val">${phone}</span></div>`);
  });
  if (company.email) {
    parts.push(`<div class="row">${emailIcon} <span class="val">${company.email}</span></div>`);
  }

  return `<div class="inv-contact">${parts.join('')}</div>`;
}

function buildSummary(inv, company) {
  const showSummaryValues = [inv.subtotal, inv.cgstAmt, inv.sgstAmt, inv.igstAmt, inv.invoiceTotal].some(isFilled);
  const companyGstin = company.gstin
    ? `<div class="gstin-line"><span class="gstin-label">GSTIN</span><span class="gstin-value">${company.gstin}</span></div>`
    : '';

  return `
    <div class="inv-summary">
      <div class="words">
        ${companyGstin}
        <div class="words-label">Total in Words:</div>
        <div class="words-text">${inv.totalInWords || ''}</div>
      </div>
      <div class="totals">
        <div><span>Total</span><span>${moneyOrBlank(inv.subtotal)}</span></div>
        <div><span>${taxLabel('SGST', inv.sgst)}</span><span>${moneyOrBlank(inv.sgstAmt)}</span></div>
        <div><span>${taxLabel('CGST', inv.cgst)}</span><span>${moneyOrBlank(inv.cgstAmt)}</span></div>
        <div><span>${taxLabel('IGST', inv.igst)}</span><span>${moneyOrBlank(inv.igstAmt)}</span></div>
        <div><span>Invoice Total</span><span>${showSummaryValues ? moneyOrBlank(inv.invoiceTotal) : ''}</span></div>
      </div>
    </div>
  `;
}

function buildItemsTable(items) {
  const safeItems = Array.isArray(items) ? items.filter((item) => (
    item && (isFilled(item.particulars) || isFilled(item.qty) || isFilled(item.rate) || isFilled(item.amount))
  )) : [];

  const minRows = 12;
  const display = [...safeItems];
  while (display.length < minRows) {
    display.push({ particulars: '', qty: '', rate: '', amount: '', __blank: true });
  }

  const rows = display.map((item, index) => {
    const hasContent = !item.__blank && (isFilled(item.particulars) || isFilled(item.qty) || isFilled(item.rate) || isFilled(item.amount));
    return `
      <tr class="${item.__blank ? 'inv-row-empty' : ''}">
        <td>${hasContent ? (index + 1) : ''}</td>
        <td>${item.particulars || ''}</td>
        <td>${isFilled(item.qty) ? item.qty : ''}</td>
        <td>${isFilled(item.rate) ? formatINR(item.rate) : ''}</td>
        <td>${isFilled(item.amount) ? formatINR(item.amount) : ''}</td>
      </tr>
    `;
  }).join('');

  return `
    <div class="inv-table-shell">
      <table class="inv-table">
        <thead>
          <tr>
            <th style="width:52px;">Sr. No.</th>
            <th>PARTICULARS</th>
            <th style="width:78px;">Qty.</th>
            <th style="width:98px;">Rate</th>
            <th style="width:110px;">Amount</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function buildHeader(company, contact) {
  const topTitle = company.topTitle || '';
  const fullName = [company.name01 || '', company.name02 || ''].filter(Boolean).join(' ').trim();
  const subTitle = company.subTitle || '';
  const nameColor = company.nameColor || '';

  const logoCell = company.logoUrl
    ? `<div class="inv-logo-cell"><img src="${company.logoUrl}" alt="logo"></div>`
    : `<div class="inv-logo-cell inv-logo-empty"></div>`;

  const titleHtml = topTitle ? `<div class="inv-tax-badge">${topTitle}</div>` : '';
  const nameHtml = fullName ? `<h1 class="inv-company-name" style="${nameColor ? `color:${nameColor};` : ''}">${fullName.toUpperCase()}</h1>` : '';
  const subtitleHtml = subTitle ? `<div class="inv-subtitle">${subTitle}</div>` : '';

  return {
    logoCell,
    fullName,
    headerCenter: `
      <div class="inv-header-center">
        ${titleHtml}
        ${nameHtml}
        ${subtitleHtml}
      </div>
    `,
    contact
  };
}

function buildFooter(inv, company, fullName, bankHTML, variant = 'classic') {
  const receiverSignature = inv.signatureUrl ? `<div class="sig-img-wrap"><img src="${inv.signatureUrl}" alt="Receiver signature"></div>` : `<div class="sig-img-wrap"></div>`;
  const authorisedSignature = company.signUrl ? `<div class="sig-img-wrap"><img src="${company.signUrl}" alt="Authorised signature"></div>` : `<div class="sig-img-wrap"></div>`;
  const companyLine = fullName ? `<div class="for-line">For ${fullName}</div>` : '';

  if (variant === 'tag') {
    return `
      <div class="inv-footer">
        <div><span class="ftr-tag">BANK DETAILS</span><div class="bank-html">${bankHTML}</div></div>
        <div><span class="ftr-tag">Receiver's Signature</span>${receiverSignature}</div>
        <div><span class="ftr-tag">Authorised Signature</span>${authorisedSignature}${companyLine}</div>
      </div>
    `;
  }

  return `
    <div class="inv-footer">
      <div>
        <div class="bank-title">BANK DETAILS</div>
        <div class="bank-html">${bankHTML}</div>
      </div>
      <div>
        <div class="sig-label">Receiver's Signature</div>
        ${receiverSignature}
      </div>
      <div>
        <div class="sig-label">Authorised Signature</div>
        ${authorisedSignature}
        ${companyLine}
      </div>
    </div>
  `;
}

export function renderInvoiceTemplate(style, invoice, company) {
  const inv = invoice || {};
  const c = company || {};
  const items = inv.items || [];
  const bankHTML = c.bankDetail || '';
  const address = c.address || '';

  if (style == 1) {
    const header = buildHeader(c, buildContact(c, false));
    return `
      <div class="invoice-paper style-1" id="invoicePaper">
        <div class="inv-stretch-content">
          <div class="inv-top">
            ${header.logoCell}
            ${header.headerCenter}
            ${header.contact}
          </div>
          ${address ? `<div class="inv-address">📍 <strong>ADDRESS:</strong> ${address}</div>` : ''}
          <div class="inv-meta">
            <div>${buildPartyMeta(inv, false)}</div>
            <div>${buildInvoiceMeta(inv, false)}</div>
          </div>
          <div class="inv-table-section">
            ${buildItemsTable(items)}
          </div>
          ${buildSummary(inv, c)}
          ${buildFooter(inv, c, header.fullName, bankHTML, 'classic')}
        </div>
      </div>
    `;
  }

  if (style == 2) {
    const header = buildHeader(c, buildContact(c, true));
    return `
      <div class="invoice-paper style-2" id="invoicePaper">
        <div class="corner-tl"></div>
        <div class="corner-tr"></div>
        <div class="inv-pad">
          <div class="inv-top">
            ${header.logoCell}
            ${header.headerCenter}
            ${header.contact}
          </div>
          ${address ? `<div class="inv-address"><span class="inv-address-tag">📍 ADDRESS</span><div style="margin-top:4px;">${address}</div></div>` : ''}
          <div class="inv-meta">
            <div>${buildPartyMeta(inv, true)}</div>
            <div>${buildInvoiceMeta(inv, true)}</div>
          </div>
          <div class="inv-table-section">
            ${buildItemsTable(items)}
          </div>
          ${buildSummary(inv, c)}
          ${buildFooter(inv, c, header.fullName, bankHTML, 'tag')}
        </div>
      </div>
    `;
  }

  if (style == 3) {
    const header = buildHeader(c, buildContact(c, true));
    return `
      <div class="invoice-paper style-3" id="invoicePaper">
        <div class="corner-tr"></div>
        <div class="corner-bl"></div>
        <div class="deco-tl"></div>
        <div class="deco-br"></div>
        <div class="inv-pad">
          <div class="inv-top">
            ${header.logoCell}
            ${header.headerCenter}
            ${header.contact}
          </div>
          ${address ? `<div class="inv-address"><span class="inv-address-tag">📍 ADDRESS</span><div style="margin-top:4px;">${address}</div></div>` : ''}
          <div class="inv-meta">
            <div>${buildPartyMeta(inv, true)}</div>
            <div>${buildInvoiceMeta(inv, true)}</div>
          </div>
          <div class="inv-table-section">
            ${buildItemsTable(items)}
          </div>
          ${buildSummary(inv, c)}
          ${buildFooter(inv, c, header.fullName, bankHTML, 'tag')}
        </div>
      </div>
    `;
  }

  if (style == 4) {
    const header = buildHeader(c, buildContact(c, true));
    return `
      <div class="invoice-paper style-4" id="invoicePaper">
        <div class="inv-pad">
          <div class="inv-top">
            ${header.logoCell}
            ${header.headerCenter}
            ${header.contact}
          </div>
          ${address ? `<div class="inv-address"><span class="inv-address-tag">📍 Address</span><div style="margin-top:4px;">${address}</div></div>` : ''}
          <div class="inv-meta">
            <div>${buildPartyMeta(inv, false)}</div>
            <div>${buildInvoiceMeta(inv, false)}</div>
          </div>
          <div class="inv-table-section">
            ${buildItemsTable(items)}
          </div>
          ${buildSummary(inv, c)}
          ${buildFooter(inv, c, header.fullName, bankHTML, 'tag')}
        </div>
      </div>
    `;
  }

  if (style == 5) {
    const header = buildHeader(c, buildContact(c, true));
    return `
      <div class="invoice-paper style-5" id="invoicePaper">
        <div class="deco-tr"></div>
        <div class="deco-bl"></div>
        <div class="inv-pad">
          <div class="inv-top">
            ${header.logoCell}
            ${header.headerCenter}
            ${header.contact}
          </div>
          ${address ? `<div class="inv-address"><span class="inv-address-tag">📍 ADDRESS</span> ${address}</div>` : ''}
          <div class="inv-meta">
            <div>${buildPartyMeta(inv, true)}</div>
            <div>${buildInvoiceMeta(inv, true)}</div>
          </div>
          <div class="inv-table-section">
            ${buildItemsTable(items)}
          </div>
          ${buildSummary(inv, c)}
          ${buildFooter(inv, c, header.fullName, bankHTML, 'tag')}
        </div>
      </div>
    `;
  }

  return '';
}

export function getDemoInvoice() {
  return {
    invoiceNo: 'INV-2604-1092',
    challanNo: '20398',
    invoiceDate: '2026-04-29',
    vehicleNo: 'MH48BM3988',
    partyName: 'Heena Enterprises',
    partyGstin: '27ABCDE1234F1Z5',
    placeOfSupply: 'Mumbai',
    state: 'Maharashtra',
    stateCode: '27',
    items: [
      { particulars: 'Tiles', qty: 69, rate: 600, amount: 41400 },
      { particulars: 'Wall Border', qty: 12, rate: 140, amount: 1680 }
    ],
    subtotal: 43080,
    cgst: 6,
    sgst: 6,
    igst: '',
    cgstAmt: 2584.8,
    sgstAmt: 2584.8,
    igstAmt: '',
    invoiceTotal: 48249.6,
    totalInWords: 'Forty Eight Thousand Two Hundred Forty Nine Rupees and Sixty Paise Only'
  };
}
