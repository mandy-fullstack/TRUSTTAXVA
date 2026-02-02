# 🌐 Configuración de CORS

## 📍 ¿Dónde va la variable `CORS_ORIGINS`?

La variable `CORS_ORIGINS` va en el archivo **`.env`** en la **raíz del proyecto** o en `apps/api/.env`.

## 🔧 Cómo Funciona

### Desarrollo (NODE_ENV=development o no definido)

**NO necesitas** agregar `CORS_ORIGINS` porque automáticamente permite:

- `http://localhost:5175` (web-client)
- `http://localhost:5176` (web-admin)
- `http://localhost:3000` (mobile/otros)

### Producción (NODE_ENV=production)

**SÍ necesitas** agregar `CORS_ORIGINS` con tus dominios reales.

## 📝 Ejemplos

### Ejemplo 1: Un solo dominio

```env
NODE_ENV=production
CORS_ORIGINS=https://trusttax.com
```

### Ejemplo 2: Múltiples dominios (separados por comas)

```env
NODE_ENV=production
CORS_ORIGINS=https://trusttax.com,https://admin.trusttax.com,https://app.trusttax.com
```

### Ejemplo 3: Con subdominios

```env
NODE_ENV=production
CORS_ORIGINS=https://www.trusttax.com,https://admin.trusttax.com,https://api.trusttax.com
```

### Ejemplo 4: Desarrollo local (no necesitas CORS_ORIGINS)

```env
NODE_ENV=development
# CORS_ORIGINS no es necesario, usa localhost por defecto
```

## 🚀 Para Render.com (Producción)

En el dashboard de Render, agrega la variable de entorno:

1. Ve a tu servicio `trusttax-api`
2. Settings → Environment Variables
3. Agrega:
   ```
   Key: CORS_ORIGINS
   Value: https://trusttax-web-client.onrender.com,https://trusttax-web-admin.onrender.com
   ```
4. Guarda y redeploy

## ⚠️ Importante

- **NO incluyas** espacios después de las comas
- **SÍ incluye** el protocolo (`https://` o `http://`)
- **NO incluyas** la barra final (`/`)
- Los orígenes son **case-sensitive**

## ✅ Ejemplos Correctos vs Incorrectos

### ✅ Correcto

```env
CORS_ORIGINS=https://trusttax.com,https://admin.trusttax.com
```

### ❌ Incorrecto

```env
# Con espacios (incorrecto)
CORS_ORIGINS=https://trusttax.com, https://admin.trusttax.com

# Sin protocolo (incorrecto)
CORS_ORIGINS=trusttax.com,admin.trusttax.com

# Con barra final (puede causar problemas)
CORS_ORIGINS=https://trusttax.com/,https://admin.trusttax.com/
```

## 🔍 Verificar que Funciona

1. Abre las DevTools del navegador (F12)
2. Ve a la pestaña Network
3. Haz una petición a la API
4. Revisa los headers de respuesta:
   - Debe incluir `Access-Control-Allow-Origin: https://tu-dominio.com`
   - Si ves `Access-Control-Allow-Origin: *` o un error CORS, la configuración no está funcionando

## 📚 Código de Referencia

La configuración está en `apps/api/src/main.ts` líneas 15-25:

```typescript
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? process.env.CORS_ORIGINS?.split(",") || []
    : [
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:3000",
      ];

app.enableCors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
```
