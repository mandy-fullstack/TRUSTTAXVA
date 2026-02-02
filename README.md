# TrustTax VA

Professional tax preparation and immigration services platform built with modern web technologies.

## 🚀 Features

- **Dual Pricing System**: Support for original prices and sale prices with automatic discount calculation
- **Service Management**: Comprehensive admin panel for managing services, pricing, and process workflows
- **Multi-step Forms**: Guided service intake with customizable form configurations
- **Bilingual Support**: Full English and Spanish translations
- **Responsive Design**: Mobile-first approach with professional square aesthetic
- **Real-time Sync**: Instant data synchronization between admin and client interfaces

## 🏗️ Tech Stack

### Frontend

- **React** with TypeScript
- **React Native Web** for cross-platform compatibility
- **React Router** for navigation
- **i18next** for internationalization

### Backend

- **NestJS** framework
- **Prisma** ORM
- **PostgreSQL** database
- **JWT** authentication

### Monorepo

- **Turborepo** for build orchestration
- **pnpm** for package management

## 📦 Project Structure

```
TRUSTTAXVA/
├── apps/
│   ├── api/              # NestJS backend API
│   ├── web-admin/        # Admin dashboard (Vite + React)
│   ├── web-client/       # Public client interface
│   └── mobile/           # React Native mobile app
├── packages/
│   ├── database/         # Prisma schema and migrations
│   └── ui/              # Shared UI components
└── turbo.json           # Turborepo configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL 14+

### Installation

```bash
# Clone the repository (reemplaza TU-USUARIO por tu usuario de GitHub)
git clone https://github.com/TU-USUARIO/TRUSTTAXVA.git
cd TRUSTTAXVA

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edita .env con tu DATABASE_URL, JWT_SECRET, etc.

# Run database migrations
cd packages/database
pnpm prisma migrate dev

# Start development servers
cd ../..
pnpm dev
```

### Access Points

- **Client App**: http://localhost:5175
- **Admin Panel**: http://localhost:5176
- **API**: http://localhost:4000

## 🔧 Development

```bash
# Start all services
pnpm dev

# Build all packages
pnpm build

# Run linting
pnpm lint

# Run type checking
pnpm type-check
```

## 📱 Applications

### Web Client

Public-facing application for clients to browse services, create orders, and track progress.

### Admin Panel

Internal dashboard for managing:

- Services and pricing
- Client orders
- Process workflows
- Company settings

### Mobile App

React Native application for iOS and Android (coming soon).

## 🎨 Design System

- **Typography**: Professional sans-serif fonts
- **Colors**: Corporate blue and green palette
- **Layout**: Square design language (borderRadius: 0)
- **Spacing**: Consistent 8px grid system

## 🌐 Internationalization

Full support for:

- 🇺🇸 English
- 🇪🇸 Spanish

## 🌐 Desplegar en Render

El proyecto incluye un **Blueprint** (`render.yaml`) para desplegar API, web-client y web-admin en [Render](https://render.com).

**Resumen:** Conecta el repo como Blueprint en Render, configura `DATABASE_URL` y `JWT_SECRET` para la API, y `VITE_API_URL` (URL de la API) para los dos estáticos. Ver **[DEPLOY.md](./DEPLOY.md)** para los pasos detallados.

## 📤 Subir a GitHub

1. **Crea un repositorio** en [GitHub](https://github.com/new) (vacío, sin README ni .gitignore).

2. **Añade el remote y sube** (reemplaza `TU-USUARIO` y `TRUSTTAXVA` si cambiaste el nombre):

   ```bash
   git remote add origin https://github.com/TU-USUARIO/TRUSTTAXVA.git
   git branch -M main
   git add .
   git commit -m "chore: prepare for GitHub"
   git push -u origin main
   ```

3. **Comprueba** que `.env` y `*.db` no se suban (están en `.gitignore`). Solo debe existir `.env.example`.

## 📄 License

Proprietary - All rights reserved

## 👥 Team

TrustTax VA Development Team

---

Built with ❤️ for the TrustTax community
