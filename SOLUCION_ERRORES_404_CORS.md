# ✅ Solución: Errores 404 y CORS

## 🔍 Problemas Identificados

### 1. Error 404: `/assets/notification.mp3`
**Ubicación**: `apps/web-client/src/context/NotificationContext.tsx`
**Problema**: Ruta incorrecta `/assets/notification.mp3` en lugar de `/notification.mp3`
**Solución**: ✅ Corregido a `/notification.mp3`

### 2. Error 404: `/logo.png`
**Ubicación**: `apps/web-client/src/context/SocketContext.tsx`
**Problema**: Archivo `logo.png` no estaba en `public/`
**Solución**: ✅ Copiado desde `src/assets/logo.png` a `public/logo.png`

### 3. Error CORS: Firebase Storage Images
**Problema**: Las URLs firmadas de Firebase Storage no tienen headers CORS configurados
**Solución**: Necesita configuración en Firebase Storage o proxy en backend

## ✅ Correcciones Aplicadas

### 1. Ruta de notification.mp3
```typescript
// Antes (incorrecto)
const audio = new Audio("/assets/notification.mp3");

// Después (correcto)
const audio = new Audio("/notification.mp3");
```

### 2. Logo.png en public/
```bash
# Copiado logo.png a public/
cp apps/web-client/src/assets/logo.png apps/web-client/public/logo.png
```

## 🔧 Solución para CORS en Firebase Storage

### Opción 1: Configurar CORS en Firebase Storage (Recomendado)

Ejecutar este comando en Google Cloud Console o usar `gsutil`:

```bash
gsutil cors set cors.json gs://trusttax-df737.firebasestorage.app
```

Donde `cors.json` contiene:
```json
[
  {
    "origin": ["https://trusttaxllc.com", "https://www.trusttaxllc.com"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"],
    "maxAgeSeconds": 3600
  }
]
```

### Opción 2: Proxy en Backend (Alternativa)

Crear un endpoint en el backend que sirva las imágenes con CORS:

```typescript
@Get('documents/preview/:documentId')
async getDocumentPreview(@Param('documentId') documentId: string) {
  // Obtener URL del documento desde la base de datos
  // Descargar desde Firebase Storage
  // Servir con headers CORS
}
```

## 📝 Archivos Modificados

1. ✅ `apps/web-client/src/context/NotificationContext.tsx` - Corregida ruta de audio
2. ✅ `apps/web-client/public/logo.png` - Copiado desde assets

## 🚀 Próximos Pasos

1. **Configurar CORS en Firebase Storage**:
   - Ir a Google Cloud Console
   - Seleccionar el bucket `trusttax-df737.firebasestorage.app`
   - Configurar CORS para permitir `https://trusttaxllc.com`

2. **Verificar en producción**:
   - Los archivos `notification.mp3` y `logo.png` deberían cargar correctamente
   - Las imágenes de Firebase Storage deberían cargar después de configurar CORS

## ⚠️ Nota Importante

Las reglas de `storage.rules` controlan **permisos de acceso**, pero **NO controlan CORS**. CORS debe configurarse a nivel de bucket en Google Cloud Storage.
