# 🏺 अर्थसंयम (Arthasanyam) — 100% Offline Maharashtrian *Jamakharch* & Warli Personal Finance Vault

![Version](https://img.shields.io/badge/version-1.2.0-9E3B24?style=for-the-badge)
![Privacy](https://img.shields.io/badge/Privacy-100%25_Offline_Zero_Internet-2D6A4F?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Windows_PC_%7C_Android_%7C_Offline_HTML-D9822B?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-241916?style=for-the-badge)

**अर्थसंयम (Arthasanyam)** is a 100% offline-first personal financial tracking and habit-building application rooted in traditional Maharashtrian ledger (*Jamakharch* / जमाखर्च) accounting, authentic Warli art geometry, and Indian classical/folk musical instruments.

---

## 🔒 The Privacy Mandate (Zero Internet Permissions)
- **Strictly Offline:** Operates with **zero internet permissions** (`android.permission.INTERNET` is explicitly stripped via `tools:node="remove"` in [`AndroidManifest.xml`](./android/app/src/main/AndroidManifest.xml)).
- **Zero Cloud or Telemetry:** No remote servers, no analytics, no third-party API calls.
- **On-Device Cryptographic Storage:** Credentials (`User ID`, `Passcode`, `3x3 Pattern Lock`, `Fingerprint`, and `Face ID`) and relational tables (`accounts`, `categories`, `transactions`, `budgets`) reside exclusively on your local device.

---

## 🚀 How Anyone Can Run This on Their PC

### Option 1: Zero-Install Portable Offline File (Instant — No Node.js Required!)
1. Download [`arthasanyam-portable-offline.html`](./arthasanyam-portable-offline.html) from this repository.
2. Double-click `arthasanyam-portable-offline.html` to open it in any browser (Chrome, Edge, Brave, Firefox) — works **100% offline in Airplane Mode**!

### Option 2: 1-Click Windows Launcher
1. Clone or download this repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/arthasanyam.git
   cd arthasanyam
   ```
2. Double-click [`Launch-Arthasanyam.bat`](./Launch-Arthasanyam.bat) (or run via terminal):
   ```bash
   npm install
   npm run dev
   ```
3. Open **http://localhost:5173/** in your browser.

---

## ✨ Key Features & SRD Modules

| Module | Feature Highlights |
| :--- | :--- |
| **Module 1: Multi-Mode Lock Screen** | Switch instantly between **मराठी**, **हिंदी**, **English**, or custom added languages (**कोंकणी**, **संस्कृतम्**, **ગુજરાતી**, **ಕನ್ನಡ**, **తెలుగు**, **தமிழ்**). Unlock via **Passcode**, **3×3 Warli Pattern Lock**, **Fingerprint**, or **Face ID**. |
| **Module 2: Dashboard ("The Vault" / गृह)** | Top App Bar with **Warli #16 (*Gavali* Infinite Loop)** vector emblem & streak counter (`🔥 ७ दिवस`). Live Net Wealth Hero Card, Devanagari (`१२३`) / Standard (`123`) numeral toggle, Horizontal Accounts Carousel, 1-Click Recurring Templates, and searchable *Jamakharch* Activity Feed. |
| **Module 3: Tijori Vaults & Transfers (तिजोरी)** | Manage `Bank Account`, `Savings Goal / FD` (with customizable **Savings Goal Progress Bars**), and `Cash Wallet`. Includes **Vault-to-Vault Self-Transfer** accompanied by a **Marathi Harmonium (संवादिनी)** chord swell. |
| **Module 4: Unified Multi-Language Categories** | Pre-seeded & custom categories with a **Multi-Language Mapping Modal** that binds all language translations to a single **Unified Backend ID** (`cat_...`) for accurate cross-language aggregation. |
| **Module 5: Transactions & Marathi Musical Cues** | Features a **Category Dropdown** + **Top 4 Recently Used Categories** quick chips, backdate picker, and edit mode. Synthesizes pure Web Audio Indian instruments:<br>• **Revenue (`+ जमा`):** 🎻 **Saraswati Veena (सरस्वती वीणा)**<br>• **Expense (`- खर्च`):** 🥁 **Traditional Tabla (तबला: धा-धिन-धिन-ना)**<br>• **Account Transfer:** 🎹 **Marathi Harmonium (संवादिनी / हार्मोनियम)** |
| **Module 6: Smart Local Habit Triggers** | On-device worker toggles for **Morning Intention Nudge (9:00 AM)**, **Evening Jamakharch Reflection (9:00 PM)**, **On-Device Pattern Learning**, and a **Live Multi-Language Notification Simulator**. |
| **Module 7: Jamakharch Analytics & Budgets** | Warli SVG Donut chart, category spending breakdown, inline per-category monthly ₹ budget limits with Over-Budget alerts, **UTF-8 CSV Export**, and **Printable PDF Ledger**. |
| **Module 8: Settings & Local DB Inspector** | Change local passcode, record custom 3×3 Pattern Lock, add new regional languages, inspect local relational tables, and **Export / Import JSON Vault Backups**. |

---

## 🎨 Design System: Geru & Tandul
- **Tandul Background (Unbleached Rice):** `#FBF8F5`
- **Primary Geru (Terracotta Earth):** `#9E3B24`
- **Surface Clay Container:** `#F4EBE6`
- **Deep Earth Text:** `#241916`
- **Typography:** `Yatra One` / `Rozha One` (Headings), `Mukta` (Body & Devanagari UI), `Space Grotesk` / `Poppins` (Monospace Numerals & Currency)

---

## 🛠️ Building for Production
```bash
# Compiles TypeScript, builds Vite production bundle in dist/,
# and generates the single-file arthasanyam-portable-offline.html
npm run build
```

## 📄 License
Released under the [MIT License](./LICENSE).
