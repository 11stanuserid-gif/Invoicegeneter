# 🧾 Royal Creation Billing — v5 (Full A4 Stretch + Pixel-Perfect)

## ✅ Issues Fixed in This Version

### 1. Full Page Stretch (A4)
- Every style now fills the entire **A4 (210 × 297mm = 794 × 1123 px @ 96 DPI)**.
- `.invoice-paper` is `display: flex; flex-direction: column; height: 1123px;`
- The **items table is `flex: 1`** so it stretches to fill available space naturally.
- Footer (Bank + Signatures) sticks to the bottom — **zero white space**.

### 2. Design-Safe Stretch
- Spacing, fonts, padding all scale proportionally — design never distorts.
- Empty rows added to items table (`fill-row`) so the table looks balanced even with 1 entry.
- All borders/lines preserved — nothing missing or cut.

### 3. Pixel-Perfect A4 PDF
- Rendered at **300 DPI (`scale: 3.125`)** → true 2480 × 3508 px output.
- jsPDF uses exact `format: 'a4'` and `addImage(img, 0, 0, 210, 297)` to fill the page.
- `overflow: hidden` on the paper guarantees nothing escapes A4 boundary.

### 4. GSTIN Visibility (All Styles)
- Dedicated **GSTIN bar** below the "Total in Words" box and above Bank Details.
- Bold, larger font (13px, weight 700, letter-spacing).
- Vertically centered, full-width.

### 5. Empty Defaults
- Form fields all have `placeholder` instead of pre-filled values.
- Number inputs use `placeholder="0"` rather than `value="0"`.
- PDF only shows fields that the user has actually entered.

### 6. Data Binding
- `buildPartyMeta()` / `buildInvoiceMeta()` skip null/empty values.
- Address, contact rows, items, GSTIN, signatures — all hidden if empty.

### 7. Login System
- Email login: regex validation, helpful error messages, "Remember me" persistence.
- Google login: popup → redirect fallback for mobile, handles `unauthorized-domain`.

## 🎨 Style Layouts

| Style | Description |
|------|-------------|
| **01** | Classic Blue. Bottom-left: Total-in-Words / GSTIN / Bank stack. Bottom-right: Totals + Receiver/Authorised side-by-side. |
| **02** | Modern Black with corner triangles. Rounded address/meta boxes. Footer = 3 separate cards. |
| **03** | Royal Gold/Navy with corner clips and gold L-frames. Gold accents throughout. |
| **04** | Elegant double-border (gold outline + blue inner). Decorative table headers. |
| **05** | Premium Royal — gold diagonal corners, rounded pill-shaped address & meta. |

All styles share:
- Centered Top-Title → Name 01 + Name 02 → Subtitle header block.
- Logo on left, Contact (phone/email) on right.
- Items table that **stretches** to fill page height.
- "Total in Words" + GSTIN bar + Totals breakdown.
- Bank Details + Receiver Sign + Authorised Sign with **For [Full Name]**.

## 🚀 Run

```bash
unzip royal-creation-billing.zip
cd royal-creation-billing
python3 -m http.server 8000
```

## 🔥 Firebase Setup

1. **Authentication** → Enable Email/Password + Google
2. **Firestore Database** → Create database
3. **Authorized Domains** (for Google login) → Add your hosting domain

### Firestore Security Rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}     { allow read, write: if request.auth != null && request.auth.uid == uid; }
    match /invoices/{id}   { allow read, write: if request.auth != null && (resource == null || resource.data.userId == request.auth.uid); }
    match /company/{uid}   { allow read, write: if request.auth != null && request.auth.uid == uid; }
    match /settings/{uid}  { allow read, write: if request.auth != null && request.auth.uid == uid; }
  }
}
```

---
v5 — Full page coverage, zero white space, pixel-perfect A4.
