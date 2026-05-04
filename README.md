# 🧾 Royal Creation Billing — v4 (Production-Ready)

## ✅ All Issues Fixed in This Version

### 1. PDF Layout & Size — A4 Pixel-Perfect
- Exact A4 dimensions: **2480 × 3508 px @ 300 DPI** (210 × 297 mm)
- Content rendered at scale 3.125× of 96-DPI base (794 × 1123 px) → upscales to true 300 DPI
- `overflow: hidden` on the paper so nothing escapes the A4 boundary
- jsPDF `addImage(img, 'PNG', 0, 0, 210, 297)` — fills the page exactly, no cropping

### 2. GSTIN in PDF — All 5 Styles
- Company GSTIN now appears **inside the "Total in Words" box**:
  - Top line: `GSTIN : 27ABCDE1234F1Z5`
  - Horizontal divider line below it
  - Then **Total in Words** label + words text
- Applies uniformly to Style 01, 02, 03, 04, 05

### 3. Dynamic Field Rendering
- Only fields filled by the user are shown in PDF
- Empty fields = hidden completely (no blank labels, no placeholders)
- Logic in `js/invoice-template.js` — `buildPartyMeta()` / `buildInvoiceMeta()` skip null/empty values

### 4. Header Alignment Fixed
- Top Title (TAX INVOICE) → centered above company name in a bordered badge
- Name 01 + Name 02 → centered, single line, large Playfair Display font
- Subtitle → directly below name, also centered
- All three perfectly center-aligned via `.inv-header-center` flexbox

### 5. Text Overflow Fixed
- `word-wrap: break-word`, `overflow-wrap: break-word` on all paper children
- Company name uses `white-space: nowrap` + `text-overflow: ellipsis` for safe single-line
- Contact values capped at `max-width: 170px` with ellipsis
- Address uses `word-wrap: break-word` so long addresses wrap inside the box

### 6. Contact Alignment
- Phone numbers + email shifted slightly left (`padding-left: 4px`)
- Each contact row is single-line (`white-space: nowrap` + ellipsis)
- Compact icons, tight spacing for clean fit

### 7. Footer Fix
- "For" line shows `For ${name01} ${name02}` — full company name (both parts)
- Applied identically across all 5 styles

### 8. Consistency Across All Styles
- Single `renderInvoiceTemplate(style, invoice, company)` function generates all 5 styles
- Shared `buildSummary()`, `buildItemsTable()`, `buildContact()`, `buildPartyMeta()`, `buildInvoiceMeta()` → guaranteed identical behavior

### 9. Login System Fixed
- **Email login:**
  - Client-side validation (regex email check, password ≥ 6 chars)
  - Detailed error messages for each Firebase error code
  - `setPersistence` honors "Remember me" toggle
- **Google login:**
  - Tries popup first, falls back to redirect on mobile/blocked popups
  - Handles `getRedirectResult` on page load
  - Clear error if domain isn't in Firebase Authorized Domains

## 🔥 Firebase Console Setup

1. **Authentication** → Enable Email/Password AND Google providers
2. **Firestore Database** → Create database (test mode for dev)
3. **Authorized Domains** (for Google Sign-in):
   - Authentication → Settings → Authorized domains
   - Add your hosting domain (e.g. `xxx.github.io`, your domain)

### Firestore Rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /invoices/{id} {
      allow read, write: if request.auth != null &&
        (resource == null || resource.data.userId == request.auth.uid);
    }
    match /company/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /settings/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

## 🚀 Run

```bash
unzip royal-creation-billing.zip
cd royal-creation-billing
python3 -m http.server 8000
# Open http://localhost:8000
```

## 📁 Pages

```
index.html              → Auto-redirect by auth state
login.html              → Email + Google login (validated)
signup.html             → Create account
forgot-password.html    → Password reset
confirm-password.html   → Re-auth before sensitive ops
dashboard.html          → Stats + actions
invoice-list.html       → All invoices (search, paginate, export)
invoice-create.html     → Create / Edit invoice
invoice-view.html       → View invoice + Print + PDF (300 DPI A4)
invoice-setting.html    → Choose 1 of 5 styles + thumbnails
preview.html            → Full-screen style preview
statement.html          → Date/Party filter + Excel export
company-details.html    → Logo, sign, names, GSTIN, bank details
backup.html             → Export/Import JSON, Delete by FY
profile.html            → User profile
help.html               → FAQ
```

## 📌 Where Does GSTIN Show in PDF?

Inside the **"Total in Words"** box (left side), at the top:
```
┌───────────────────────────────┬─────────────┐
│ GSTIN : 27ABCDE1234F1Z5       │ Total       │
│ ───────────────────────────── │ SGST @ 6%   │
│ Total in Words:               │ CGST @ 6%   │
│ Forty Six Thousand Three      │ IGST @ 0%   │
│ Hundred and Sixty Eight       │ ─────────── │
│ Rupees Only                   │ Invoice Tot │
└───────────────────────────────┴─────────────┘
```

---
v4 — Production-ready, pixel-perfect A4, all alignment issues fixed.
