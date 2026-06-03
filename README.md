<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# MLAI Corporation | Neural AI Orchestration

A production-grade, research-focused platform for MLAI Corporation, featuring advanced neural AI orchestration, mission-critical safety frameworks, and high-performance benchmarking.

## 🚀 Tech Stack

- **Frontend**: React 19, Vite, TailwindCSS (v4), Framer Motion, Lucide React.
- **Backend**: Hono (Node.js/Bun compatible), iron-session.
- **Auth**: WorkOS AuthKit (SSO, MFA ready).
- **Design**: Premium Research Aesthetic (Dark Mode, Glassmorphism, Semantic HTML5).
- **Visualization**: Custom Canvas-based High-Performance Charts (WDBX Engine Benchmarks).

## 🏗 Architecture

- **SPA Routing**: Multi-page architecture using `react-router-dom` with lazy loading for optimized initial bundle size.
- **Global UI State**: Centralized `UIProvider` for managing global interactions like the Inquiry modal and notifications.
- **Server Actions**: React 19 `useActionState` and Server Actions for form submissions and backend communication.
- **Performance**: Optimized rendering with `memo` and custom Canvas draw routines for real-time benchmark visualization.

## 🛠 Setup & Development

### Prerequisites
- Node.js 20+ or Bun 1.1+
- WorkOS Account (for AuthKit)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/mlai-corp/www.git
   cd www
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   Copy `.env.example` to `.env` and fill in your WorkOS credentials and a session secret.
   ```bash
   cp .env.example .env
   ```
4. Run in Development Mode:
   ```bash
   npm run dev
   ```

## 🚢 Deployment

The application is optimized for **Google Cloud Run**.

1. **Build the project**:
   ```bash
   npm run build
   ```
2. **Deploy to Cloud Run**:
   Use the `gcloud` CLI or the Cloud Run MCP server to deploy the containerized application. Ensure `WORKOS_API_KEY`, `WORKOS_CLIENT_ID`, and `SESSION_SECRET` are configured as environment secrets.

## ⏭ Next Steps

- [ ] **Backend Finalization**: Implement the Hono endpoint for `submitInquiry` to store lead data in a secure database.
- [ ] **Content Expansion**: Populate `/blog` and `/docs` with actual research PDFs and Markdown documentation for the WDBX V2 release.
- [ ] **MFA Integration**: Enable Multi-Factor Authentication via WorkOS Dashboard for administrative access.
- [ ] **Visual Polish**: Add more micro-interactions to the `HeroScene` for improved interactive storytelling of the neural backtrace process.
- [ ] **Analytics**: Implement privacy-respecting telemetry to track conversion rates on the Inquiry form.

---
© 2026 MLAI CORPORATION. PROPRIETARY AND CONFIDENTIAL.
