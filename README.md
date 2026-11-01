# Directino ⚡

> **AI-Powered Omnichannel Messaging & Conversational Agent Platform**  
> Connect WhatsApp, Telegram, and Instagram to an intelligent Claude-powered reply engine with human pacing, live dashboard, and zero-knowledge session encryption.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Go](https://img.shields.io/badge/Go-1.22+-00ADD8?style=flat-square&logo=go)](https://golang.org/)
[![Claude API](https://img.shields.io/badge/Claude-Messages%20API-d97706?style=flat-square)](https://anthropic.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

---

## ✨ Features

- **🌐 Bilingual & Native Bi-directional UI (FA / EN)**: Full Persian (RTL) and English (LTR) localization with custom Persian typography (`Peyda` and `Gofteh`).
- **🤖 Claude-Powered Response Engine**: Strict prompt-engineered reply agent with confidence thresholds, review policies (`draft`, `approve`, `auto`), and smooth human-handoff mechanisms.
- **⏱️ Human Pacing & Natural Delivery**: Simulates organic human behavior with variable reading pauses, typing duration indicators, and per-account jitter to safeguard channel reputation.
- **📱 Multi-Channel Connectors**:
  - **WhatsApp**: Multi-device QR-link integration via `whatsmeow`.
  - **Telegram**: MTProto user session automation (planned).
  - **Instagram**: Mobile-app API connector (planned).
- **🔒 AES-256-GCM Cryptographic Sealing**: Secure storage of session credentials with per-workspace HKDF key derivation.
- **⚡ Interactive Portfolio Demo**: The frontend includes a responsive mock fallback, enabling full interactive exploration on Vercel without requiring a live backend cluster.

---

## 🏛️ Architecture Overview

```text
Incoming Message
       │
       ▼
 [ Connector ]  (WhatsApp whatsmeow / Telegram / Instagram)
       │
       ▼
 [ Runtime Queue ] ──► [ Claude Agent ] ◄──► [ Knowledge Base / Catalog ]
                              │
                    [ Policy Engine ] (Confidence Score, Handoff)
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
            [ Store / SQLite ]    [ Human Pacer ] ──► [ Connector.Send ]
                    │
                    ▼
          [ JSON + SSE API ] ◄──► [ Next.js Dashboard ]
```

---

## 📁 Repository Structure

```text
directino/
├── backend/            # Go backend (API, Agent, Connectors, Crypto)
│   ├── cmd/directino/  # Service entry point
│   ├── internal/       # Agent, pacing, LLM, auth, store, channels
│   ├── migrations/     # Database schemas
│   └── deploy/         # Docker Compose & Caddy configuration
├── web/                # Next.js 16 Web Application & Dashboard
│   ├── src/app/        # App Router ([lang] localization)
│   ├── src/components/ # Motion UI, GSAP FX, Dashboard kit
│   └── src/lib/        # API client, types & interactive demo data
└── README.md
```

---

## 🚀 Quick Start

### 1. Web Frontend (Next.js 16)

```bash
cd web
npm install
npm run dev
```

Visit `http://localhost:3000` (auto-redirects to `/fa` or `/en` based on browser preferences).

### 2. Backend Service (Go)

```bash
cd backend
export DIRECTINO_MASTER_KEY=$(openssl rand -base64 32)
export ANTHROPIC_API_KEY=your_claude_key
go run ./cmd/directino
```

Listens on `:8080` (or configured port) using an embedded SQLite database.

---

## 🌐 Deploying to Vercel

The web interface is optimized for one-click deployment to Vercel:

1. Import this repository into **[Vercel](https://vercel.com/)**.
2. Set **Root Directory** to `web`.
3. Keep the default Build Command (`next build`) and Output Directory.
4. Click **Deploy**.

> **Note**: For portfolio demonstration, the web application automatically falls back to interactive mock data when `NEXT_PUBLIC_API_URL` is omitted, providing a fully functional live demo right out of the box!

---

## 👤 Author

Developed by **Pouya**  
- GitHub: [@pouya-wp](https://github.com/pouya-wp)
- Email: pouya.sadeggpoor.1388@gmail.com
