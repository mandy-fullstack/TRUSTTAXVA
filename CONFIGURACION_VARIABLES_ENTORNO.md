# 🔧 Configuración de Variables de Entorno - Guía Rápida

## ⚠️ IMPORTANTE: Uso de Variables de Entorno

El código **SIEMPRE** usa las variables de entorno cuando están definidas. Si no están definidas, usa fallbacks.

---

## 📍 Ubicación de Archivos .env

### 1. Backend (API)

**Archivo:** `/Users/mandy/TRUSTTAXVA/.env`

```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
ENCRYPTION_KEY=...
PORT=4000
```

### 2. Frontend Cliente

**Archivo:** `/Users/mandy/TRUSTTAXVA/apps/web-client/.env`

```env
VITE_API_URL=http://localhost:4000
# O en producción:
# VITE_API_URL=https://trusttax-api.onrender.com
```

### 3. Frontend Admin

**Archivo:** `/Users/mandy/TRUSTTAXVA/apps/web-admin/.env`

```env
VITE_API_URL=http://localhost:4000
# O en producción:
# VITE_API_URL=https://trusttax-api.onrender.com
```

---

## ✅ Cómo Funciona

### Frontend (web-client y web-admin)

El código usa `apps/*/src/config/api.ts` que:

1. **PRIORIZA SIEMPRE** `VITE_API_URL` si está definido
2. Solo usa fallback si `VITE_API_URL` NO está definido
3. Muestra logs en consola para verificar qué URL se está usando

**Ejemplo de código:**

```typescript
// apps/web-client/src/config/api.ts
export function getApiUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;

  // Si está definido, SIEMPRE lo usamos
  if (envUrl && typeof envUrl === "string" && envUrl.trim() !== "") {
    return envUrl.trim();
  }

  // Solo fallback si NO está definido
  return "http://localhost:4000"; // o producción
}
```

---

## 🔍 Cómo Verificar

### 1. Verificar que el archivo .env existe:

```bash
cat apps/web-client/.env | grep VITE_API_URL
cat apps/web-admin/.env | grep VITE_API_URL
```

### 2. Verificar en la consola del navegador:

Abre la consola del navegador (F12) y busca:

```
🔧 Configuración de API
✅ Usando VITE_API_URL de variables de entorno: http://localhost:4000
```

### 3. Verificar en el código:

El código muestra logs automáticamente:

- ✅ Si usa la variable de entorno
- ⚠️ Si usa fallback (significa que la variable NO está definida)

---

## 🚨 Problemas Comunes

### Problema: No se usa la variable de entorno

**Causas posibles:**

1. El archivo `.env` no existe
2. La variable está mal escrita (debe ser `VITE_API_URL`, no `API_URL`)
3. El servidor de desarrollo no se reinició después de agregar la variable
4. Hay espacios o caracteres especiales en el valor

**Solución:**

```bash
# 1. Verificar que el archivo existe
ls -la apps/web-client/.env

# 2. Verificar el contenido
cat apps/web-client/.env

# 3. Asegurarse de que NO hay espacios
VITE_API_URL=http://localhost:4000  # ✅ Correcto
VITE_API_URL = http://localhost:4000  # ❌ Incorrecto (espacios)

# 4. Reiniciar el servidor de desarrollo
# Detener (Ctrl+C) y volver a ejecutar: npm run dev
```

---

## 📝 Formato Correcto del .env

### ✅ CORRECTO:

```env
VITE_API_URL=http://localhost:4000
VITE_API_URL=https://trusttax-api.onrender.com
```

### ❌ INCORRECTO:

```env
VITE_API_URL = http://localhost:4000  # Espacios alrededor del =
VITE_API_URL="http://localhost:4000"  # Comillas (no necesarias)
VITE_API_URL=http://localhost:4000/   # Barra final (puede causar problemas)
```

---

## 🔄 Reiniciar Servidor

**IMPORTANTE:** Después de cambiar variables de entorno, SIEMPRE reinicia el servidor:

```bash
# Detener el servidor (Ctrl+C)
# Luego reiniciar:
cd apps/web-client && npm run dev
# o
cd apps/web-admin && npm run dev
```

Vite solo carga las variables de entorno al iniciar, no en tiempo de ejecución.

---

## 🎯 Resumen

1. **Crea el archivo `.env`** en `apps/web-client/` y `apps/web-admin/`
2. **Agrega `VITE_API_URL=tu-url-aqui`** (sin espacios, sin comillas)
3. **Reinicia el servidor** de desarrollo
4. **Verifica en la consola** que muestra "✅ Usando VITE_API_URL"

El código **SIEMPRE** usará la variable de entorno si está definida correctamente.
