# 📋 Guía Completa de Variables de Entorno

## 📍 Ubicación de Archivos .env

El proyecto usa **3 archivos .env** diferentes:

1. **`/Users/mandy/TRUSTTAXVA/.env`** - Para el **Backend (API)**
2. **`/Users/mandy/TRUSTTAXVA/apps/web-client/.env`** - Para el **Frontend Cliente**
3. **`/Users/mandy/TRUSTTAXVA/apps/web-admin/.env`** - Para el **Frontend Admin**

---

## 🔴 BACKEND (API) - `/Users/mandy/TRUSTTAXVA/.env`

### ⚠️ VARIABLES CRÍTICAS (REQUERIDAS)

Estas variables **DEBEN** estar configuradas o la aplicación **NO iniciará**:

```env
# Base de Datos PostgreSQL
DATABASE_URL=postgresql://usuario:password@localhost:5432/trusttax?schema=public

# Seguridad - JWT (mínimo 32 caracteres)
JWT_SECRET=tu-clave-secreta-super-larga-y-segura-minimo-32-caracteres-para-jwt

# Encriptación de Datos Sensibles (mínimo 32 caracteres)
ENCRYPTION_KEY=tu-clave-encriptacion-super-larga-y-segura-minimo-32-caracteres
```

### 🔧 CONFIGURACIÓN GENERAL

```env
# Entorno: development | production
NODE_ENV=development

# Puerto del servidor API (default: 4000)
PORT=4000

# CORS - Orígenes permitidos (SOLO necesario en producción)
# En desarrollo se usan localhost por defecto
# En producción, separa múltiples URLs por comas (sin espacios)
CORS_ORIGINS=https://trusttax.com,https://admin.trusttax.com
```

### 🟡 VARIABLES RECOMENDADAS (Funcionalidades limitadas sin ellas)

#### Redis (Rate Limiting y WebSockets)

```env
# URL de Redis (opcional en desarrollo, recomendado en producción)
REDIS_URL=redis://localhost:6379
# Para Upstash: rediss://default:password@host.upstash.io:6379
```

#### Firebase (Push Notifications y Storage)

```env
# Firebase Service Account JSON (como string, sin saltos de línea)
# Obtén este JSON desde Firebase Console > Project Settings > Service Accounts
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}

# Firebase Project ID (fallback si no tienes Service Account JSON)
FIREBASE_PROJECT_ID=tu-project-id

# Firebase Storage Bucket (opcional, se auto-detecta si no se especifica)
FIREBASE_STORAGE_BUCKET=tu-project.appspot.com
```

#### Email / SMTP

```env
# Configuración SMTP para envío de emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password-de-gmail
SMTP_FROM="TrustTax Support <tu-email@gmail.com>"
```

#### URLs para Emails (opcional, usa localhost por defecto)

```env
# URLs base para links en emails
CLIENT_URL=http://localhost:5175
ADMIN_URL=http://localhost:5176
```

#### AI / Google GenAI (Opcional - para extracción de datos de W-2)

```env
# Google Generative AI API Key (para análisis de documentos)
GOOGLE_GENAI_API_KEY=tu-api-key-de-google-genai
```

#### RingCentral SMS (Opcional - para envío de SMS)

```env
# Credenciales OAuth de RingCentral (obtenidas del Developer Portal)
RINGCENTRAL_CLIENT_ID=tu-client-id-aqui
RINGCENTRAL_CLIENT_SECRET=tu-client-secret-aqui

# Account ID (usa ~ para sandbox, o el ID de tu cuenta de producción)
RINGCENTRAL_ACCOUNT_ID=~

# Extension ID (usa ~ para la extensión principal)
RINGCENTRAL_EXTENSION_ID=~

# Número telefónico para enviar SMS (formato E.164: +16505551234)
RINGCENTRAL_PHONE_NUMBER=+16505551234

# URL de la API (default: https://platform.ringcentral.com)
# Para sandbox: https://platform.devtest.ringcentral.com
RINGCENTRAL_API_URL=https://platform.ringcentral.com
```

#### Token Service (Opcional - tiene fallback)

```env
# Token secreto para tokens de reset/verificación (default: clave de 64 caracteres)
TOKEN_SECRET=tu-token-secret-64-caracteres
```

#### Seed Admin (Solo para scripts de seed)

```env
# Variables para crear admin inicial (solo para scripts de seed)
SEED_MAIN_ADMIN_EMAIL=admin@trusttax.com
SEED_MAIN_ADMIN_PASSWORD=password-segura
SEED_MAIN_ADMIN_NAME=Admin Principal
```

---

## 🟢 FRONTEND CLIENTE - `/Users/mandy/TRUSTTAXVA/apps/web-client/.env`

### ⚠️ VARIABLE REQUERIDA

```env
# URL de la API Backend
VITE_API_URL=http://localhost:4000
# En producción: VITE_API_URL=https://trusttax-api.onrender.com
```

### 🔧 Firebase (Opcional pero recomendado)

```env
# Configuración de Firebase para el frontend
VITE_FIREBASE_API_KEY=tu-api-key
VITE_FIREBASE_AUTH_DOMAIN=tu-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-project-id
VITE_FIREBASE_STORAGE_BUCKET=tu-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 🔵 FRONTEND ADMIN - `/Users/mandy/TRUSTTAXVA/apps/web-admin/.env`

### ⚠️ VARIABLE REQUERIDA

```env
# URL de la API Backend
VITE_API_URL=http://localhost:4000
# En producción: VITE_API_URL=https://trusttax-api.onrender.com
```

### 🔧 Firebase (Opcional pero recomendado)

```env
# Configuración de Firebase para el frontend admin
VITE_FIREBASE_API_KEY=tu-api-key
VITE_FIREBASE_AUTH_DOMAIN=tu-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-project-id
VITE_FIREBASE_STORAGE_BUCKET=tu-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 📊 Resumen por Ubicación

### `/Users/mandy/TRUSTTAXVA/.env` (Backend)

| Variable                        | Requerida      | Descripción                            |
| ------------------------------- | -------------- | -------------------------------------- |
| `DATABASE_URL`                  | ✅ SÍ          | URL de PostgreSQL                      |
| `JWT_SECRET`                    | ✅ SÍ          | Clave para JWT (≥32 chars)             |
| `ENCRYPTION_KEY`                | ✅ SÍ          | Clave de encriptación (≥32 chars)      |
| `NODE_ENV`                      | ⚠️ Recomendada | development/production                 |
| `PORT`                          | ❌ No          | Puerto API (default: 4000)             |
| `CORS_ORIGINS`                  | ⚠️ Producción  | Orígenes permitidos (solo prod)        |
| `REDIS_URL`                     | ⚠️ Recomendada | URL de Redis                           |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | ⚠️ Recomendada | JSON de Firebase Admin                 |
| `FIREBASE_PROJECT_ID`           | ⚠️ Recomendada | ID del proyecto Firebase               |
| `FIREBASE_STORAGE_BUCKET`       | ❌ No          | Bucket de Storage (auto-detecta)       |
| `SMTP_HOST`                     | ⚠️ Recomendada | Host SMTP                              |
| `SMTP_PORT`                     | ⚠️ Recomendada | Puerto SMTP                            |
| `SMTP_USER`                     | ⚠️ Recomendada | Usuario SMTP                           |
| `SMTP_PASSWORD`                 | ⚠️ Recomendada | Password SMTP                          |
| `SMTP_FROM`                     | ⚠️ Recomendada | Email remitente                        |
| `CLIENT_URL`                    | ❌ No          | URL del cliente (para emails)          |
| `ADMIN_URL`                     | ❌ No          | URL del admin (para emails)            |
| `GOOGLE_GENAI_API_KEY`          | ❌ No          | API Key de Google GenAI                |
| `TOKEN_SECRET`                  | ❌ No          | Secreto para tokens (tiene fallback)   |
| `RINGCENTRAL_CLIENT_ID`         | ❌ No          | Client ID de RingCentral               |
| `RINGCENTRAL_CLIENT_SECRET`     | ❌ No          | Client Secret de RingCentral           |
| `RINGCENTRAL_ACCOUNT_ID`        | ❌ No          | Account ID de RingCentral              |
| `RINGCENTRAL_EXTENSION_ID`      | ❌ No          | Extension ID de RingCentral            |
| `RINGCENTRAL_PHONE_NUMBER`      | ❌ No          | Número telefónico para SMS             |
| `RINGCENTRAL_API_URL`           | ❌ No          | URL de API RingCentral (tiene default) |

### `/Users/mandy/TRUSTTAXVA/apps/web-client/.env` (Frontend Cliente)

| Variable                            | Requerida      | Descripción                  |
| ----------------------------------- | -------------- | ---------------------------- |
| `VITE_API_URL`                      | ✅ SÍ          | URL del backend API          |
| `VITE_FIREBASE_API_KEY`             | ⚠️ Recomendada | Firebase API Key             |
| `VITE_FIREBASE_AUTH_DOMAIN`         | ⚠️ Recomendada | Firebase Auth Domain         |
| `VITE_FIREBASE_PROJECT_ID`          | ⚠️ Recomendada | Firebase Project ID          |
| `VITE_FIREBASE_STORAGE_BUCKET`      | ⚠️ Recomendada | Firebase Storage Bucket      |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ⚠️ Recomendada | Firebase Messaging Sender ID |
| `VITE_FIREBASE_APP_ID`              | ⚠️ Recomendada | Firebase App ID              |
| `VITE_FIREBASE_MEASUREMENT_ID`      | ⚠️ Recomendada | Firebase Measurement ID      |

### `/Users/mandy/TRUSTTAXVA/apps/web-admin/.env` (Frontend Admin)

| Variable                            | Requerida      | Descripción                  |
| ----------------------------------- | -------------- | ---------------------------- |
| `VITE_API_URL`                      | ✅ SÍ          | URL del backend API          |
| `VITE_FIREBASE_API_KEY`             | ⚠️ Recomendada | Firebase API Key             |
| `VITE_FIREBASE_AUTH_DOMAIN`         | ⚠️ Recomendada | Firebase Auth Domain         |
| `VITE_FIREBASE_PROJECT_ID`          | ⚠️ Recomendada | Firebase Project ID          |
| `VITE_FIREBASE_STORAGE_BUCKET`      | ⚠️ Recomendada | Firebase Storage Bucket      |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ⚠️ Recomendada | Firebase Messaging Sender ID |
| `VITE_FIREBASE_APP_ID`              | ⚠️ Recomendada | Firebase App ID              |
| `VITE_FIREBASE_MEASUREMENT_ID`      | ⚠️ Recomendada | Firebase Measurement ID      |

---

## 🚀 Ejemplo Completo de .env para Desarrollo

### Backend: `/Users/mandy/TRUSTTAXVA/.env`

```env
# ============================================
# VARIABLES CRÍTICAS (REQUERIDAS)
# ============================================
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/trusttax?schema=public
JWT_SECRET=mi-clave-secreta-super-larga-de-al-menos-32-caracteres-para-jwt
ENCRYPTION_KEY=mi-clave-encriptacion-super-larga-de-al-menos-32-caracteres

# ============================================
# CONFIGURACIÓN
# ============================================
NODE_ENV=development
PORT=4000

# ============================================
# REDIS (Opcional)
# ============================================
REDIS_URL=redis://localhost:6379

# ============================================
# FIREBASE (Opcional)
# ============================================
FIREBASE_PROJECT_ID=tu-project-id
# FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}

# ============================================
# EMAIL (Opcional)
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
SMTP_FROM="TrustTax Support <tu-email@gmail.com>"

# ============================================
# RINGCENTRAL SMS (Opcional)
# ============================================
RINGCENTRAL_CLIENT_ID=tu-client-id-aqui
RINGCENTRAL_CLIENT_SECRET=tu-client-secret-aqui
RINGCENTRAL_ACCOUNT_ID=~
RINGCENTRAL_EXTENSION_ID=~
RINGCENTRAL_PHONE_NUMBER=+16505551234
RINGCENTRAL_API_URL=https://platform.ringcentral.com
```

### Frontend Cliente: `/Users/mandy/TRUSTTAXVA/apps/web-client/.env`

```env
VITE_API_URL=http://localhost:4000

# Firebase (opcional)
VITE_FIREBASE_API_KEY=tu-api-key
VITE_FIREBASE_AUTH_DOMAIN=tu-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-project-id
VITE_FIREBASE_STORAGE_BUCKET=tu-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Frontend Admin: `/Users/mandy/TRUSTTAXVA/apps/web-admin/.env`

```env
VITE_API_URL=http://localhost:4000

# Firebase (opcional)
VITE_FIREBASE_API_KEY=tu-api-key
VITE_FIREBASE_AUTH_DOMAIN=tu-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-project-id
VITE_FIREBASE_STORAGE_BUCKET=tu-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## ⚠️ Notas Importantes

1. **Variables con prefijo `VITE_`**: Solo funcionan en frontends (web-client y web-admin). Vite las expone en `import.meta.env`.

2. **Variables sin prefijo**: Solo funcionan en el backend (API). Se acceden con `process.env`.

3. **JWT_SECRET y ENCRYPTION_KEY**: Deben tener **mínimo 32 caracteres** cada una. La aplicación valida esto al iniciar.

4. **CORS_ORIGINS**: Solo se usa en producción (`NODE_ENV=production`). En desarrollo se usan localhost por defecto.

5. **FIREBASE_SERVICE_ACCOUNT_JSON**: Debe ser un JSON como string, sin saltos de línea. Si tienes problemas, usa `FIREBASE_PROJECT_ID` como fallback.

6. **Archivos .env**: Están en `.gitignore`, así que no se suben a Git. Crea tus propios archivos `.env` basándote en esta guía.

---

## 🔍 Cómo Verificar Variables

### Backend

```bash
cd /Users/mandy/TRUSTTAXVA
node -e "require('dotenv').config(); console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅' : '❌'); console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅' : '❌');"
```

### Frontend

Las variables `VITE_*` se exponen en el código. Puedes verificar en la consola del navegador:

```javascript
console.log(import.meta.env.VITE_API_URL);
```
