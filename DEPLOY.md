# Desplegar TrustTax VA en Render

Este proyecto usa un **Blueprint** (`render.yaml`) para definir API, web-client y web-admin en Render.

## Requisitos

- Cuenta en [Render](https://render.com)
- Repo en GitHub (ya conectado)
- **DATABASE_URL**: tu PostgreSQL (p. ej. Prisma, Render Postgres, etc.)
- **JWT_SECRET**: clave para firmar JWTs (mín. 32 caracteres)

## Pasos

### 1. Conectar el repo como Blueprint

1. Entra en [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
2. Conecta el repo **TRUSTTAXVA** (GitHub).
3. Elige la rama (p. ej. `main`) y **Apply**.

### 2. Variables de entorno al crear el Blueprint

Render te pedirá valores para las variables con `sync: false`:

| Variable | Servicio | Descripción |
|----------|----------|-------------|
| **DATABASE_URL** | `trusttax-api` | URL de PostgreSQL (el que usas con Prisma). |
| **JWT_SECRET** | `trusttax-api` | Clave secreta para JWT (genera una segura, ≥32 chars). |
| **VITE_API_URL** | `trusttax-web-client` | URL pública de la API, ej. `https://trusttax-api.onrender.com`. |
| **VITE_API_URL** | `trusttax-web-admin` | La misma URL de la API. |

**Orden recomendado:**

1. Crea el Blueprint y configura **solo** `DATABASE_URL` y `JWT_SECRET` para la API.
2. Despliega la API y espera a que esté en vivo.
3. Copia la URL de la API (ej. `https://trusttax-api.onrender.com`).
4. En **trusttax-web-client** y **trusttax-web-admin**, añade la env var **VITE_API_URL** = esa URL.
5. Redeploy de los dos estáticos (o déjalos que fallen el primer build y luego redeploy tras configurar `VITE_API_URL`).

### 3. Migraciones de base de datos

Las migraciones **no** se ejecutan en Render. Hazlas en local antes (o desde un job externo):

```bash
cd packages/database
pnpm exec prisma migrate deploy
```

Asegúrate de que `DATABASE_URL` en tu `.env` local apunte a la misma BD que usa Render.

### 4. URLs tras el deploy

- **API:** `https://trusttax-api.onrender.com`
- **Web cliente:** `https://trusttax-web-client.onrender.com`
- **Admin:** `https://trusttax-web-admin.onrender.com`

(Pueden variar si cambias los nombres de los servicios en el Blueprint.)

### 5. CORS

La API tiene `enableCors()` sin restricción. En producción puedes limitar orígenes a las URLs de tus estáticos en Render (y a tu dominio si usas uno propio).

### 6. Plan free y límites

- Servicios free se “duermen” tras inactividad; el primer request puede tardar más.
- Revisa [límites de Render](https://render.com/pricing) para free tier.

### 7. Cambios posteriores

- **Blueprint:** Al hacer push a `render.yaml`, Render puede volver a aplicar la config. Variables con `sync: false` **no** se sobrescriben.
- **Solo código:** Push a `main` (o la rama enlazada) y Render redeploya los servicios afectados según los **build filters** del `render.yaml`.

---

**Resumen:** Conectas el repo como Blueprint, configuras `DATABASE_URL` y `JWT_SECRET` en la API, despliegas, copias la URL de la API y la pones en `VITE_API_URL` en los dos estáticos. Luego redeploy de los estáticos y ya deberías tener todo en Render.
