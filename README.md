# ConfFlow — AI-Powered Research Conference Platform

A complete, role-based conference management system with AI-assisted peer review, real-time tracking, and intelligent decision support. Built with Vanilla JS + Firebase + Vercel.

---

## 📁 Project Structure

```
confflow/
├── index.html              # SPA entry point — all pages live here
├── package.json
├── vercel.json             # Vercel deployment config
├── build.js                # Build & env injection script
├── .env                    # Environment variables template
├── .gitignore
│
├── css/
│   ├── main.css            # Base styles, variables, buttons, utilities
│   ├── nav.css             # Navbar & sidebar navigation
│   ├── home.css            # Landing page, auth, conference cards
│   └── dashboard.css       # Dashboard components, tables, cards
│
└── js/
    ├── app.js              # Main application logic, routing, state
    └── firebase.js         # Firebase services (Auth, Firestore, Storage)
```

---

## ⚡ Quick Start (Local)

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/confflow.git
cd confflow
npm install
```

### 2. Configure Firebase
1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Email/Password + Google
3. Enable **Firestore Database** (start in test mode)
4. Enable **Storage**
5. Get your Firebase config from Project Settings → Your Apps

```bash
cp .env .env.local
# Edit .env.local and paste your Firebase credentials
```

### 3. Update Firebase Config in `js/firebase.js`
Replace the config object at the top of `js/firebase.js`:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Run Locally
```bash
npm start
# Opens at http://localhost:3000
```

---

## 🌐 Deploy to Vercel

### Option A: Vercel CLI (Fastest)
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Option B: Vercel Dashboard
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your GitHub repo
4. Add Environment Variables (from `.env`)
5. Click **Deploy** ✅

### Environment Variables (Vercel Dashboard → Settings → Environment Variables)
| Key | Example Value |
|-----|--------------|
| `VITE_FIREBASE_API_KEY` | `AIzaSyXXXXXXXXXXX` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `myproject.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `my-project-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `my-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `123456789` |
| `VITE_FIREBASE_APP_ID` | `1:123:web:abc` |

---

## 👤 Role-Based Access

| Role | Capabilities |
|------|-------------|
| **Author** | Submit papers, track status, upload camera-ready |
| **Reviewer** | View AI scores on assigned papers, write reviews, discussion |
| **Chair** | Conference setup, assignments, decisions, program builder, analytics |
| **Admin** | Platform-wide management |

### Demo Login
Use any email/password combination. Role is determined by email prefix:
- `chair@anything.com` → **Chair dashboard**
- `review@anything.com` → **Reviewer dashboard**
- `anything@anything.com` → **Author dashboard**

---

## 🤖 AI Review System

Every paper receives:
- **Originality Score** (0–100): Novelty vs existing literature
- **Scientific Quality Score** (0–100): Methodology & rigor
- **Relevance Score** (0–100): Fit with conference tracks
- **Recommendation**: Accept / Reject / Borderline

Currently uses mock AI scores. To integrate real AI review:
1. Add your OpenAI/Gemini API key to environment variables
2. In `js/firebase.js`, update `PaperService.submit()` to call your NLP API after upload
3. Store the returned scores in Firestore under the paper document

---

## 🔥 Firebase Schema

```
/users/{uid}
  displayName, email, role, institution, createdAt

/conferences/{confId}
  title, abbr, org, domain, location, tracks[]
  deadlines{sub, notif, cam, conf}
  status, papersCount, chairId, acceptRate

/papers/{paperId}
  title, abstract, keywords, authorId, conferenceId
  track, coAuthors[], pdfUrl, status
  aiScore{originality, quality, relevance, recommendation}
  reviewers[], submittedAt, updatedAt

/reviews/{reviewId}
  paperId, reviewerId
  scores{originality, quality, relevance, clarity, significance}
  comment, confidentialNote, submittedAt

/assignments/{assignId}
  paperId, reviewerId, assignedAt, deadline
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML/CSS/JS (zero framework) |
| Fonts | Syne + Plus Jakarta Sans + JetBrains Mono |
| Backend | Firebase Auth + Firestore + Storage + Analytics |
| Hosting | Vercel (static) |
| AI Layer | Pluggable — OpenAI / Gemini / custom |

---

## 🔒 Security Notes

- Never commit `.env.local` (it's in `.gitignore`)
- Firebase API keys in client-side JS are safe — they're restricted by Firebase Security Rules
- Set up Firestore Security Rules before going to production:
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /papers/{paper} {
        allow read: if request.auth != null;
        allow write: if request.auth.uid == resource.data.authorId;
      }
    }
  }
  ```

---

## 📄 License

MIT © 2025 ConfFlow
