# 🔧 Solución: Error CORS en Producción

## 🐛 Problema

Error en producción:
```
Access to fetch at 'https://trusttax-api.onrender.com/services' 
from origin 'https://trusttaxllc.com' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## ✅ Solución

El backend necesita la variable de entorno `CORS_ORIGINS` configurada en Render.com.

### Paso 1: Configurar CORS_ORIGINS en Render.com

1. Ve a tu dashboard de Render.com
2. Selecciona el servicio `trusttax-api`
3. Ve a **Settings** → **Environment Variables**
4. Agrega o actualiza la variable:

```
Key: CORS_ORIGINS
Value: https://trusttaxllc.com,https://www.trusttaxllc.com
```

**Importante**: 
- Separa múltiples dominios con comas (sin espacios)
- Incluye el protocolo `https://`
- NO incluyas la barra final `/`

### Paso 2: Ejemplo Completo

Si tienes múltiples dominios:

```
CORS_ORIGINS=https://trusttaxllc.com,https://www.trusttaxllc.com,https://admin.trusttaxllc.com
```

### Paso 3: Redeploy

Después de agregar la variable:
1. Guarda los cambios
2. Render automáticamente hará redeploy
3. Espera a que el deploy termine

## 🔍 Verificar que Funciona

### 1. Verificar en los logs de Render

Después del redeploy, en los logs deberías ver:
```
✅ [CORS] Orígenes permitidos en producción: [ 'https://trusttaxllc.com', 'https://www.trusttaxllc.com' ]
```

### 2. Verificar en el navegador

1. Abre `https://trusttaxllc.com` en el navegador
2. Abre DevTools (F12)
3. Ve a la pestaña **Network**
4. Haz una petición a la API
5. Revisa los headers de respuesta:
   - Debe incluir: `Access-Control-Allow-Origin: https://trusttaxllc.com`
   - Si ves un error CORS, la configuración no está funcionando

### 3. Probar con curl

```bash
curl -H "Origin: https://trusttaxllc.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://trusttax-api.onrender.com/services \
     -v
```

Deberías ver en los headers:
```
< access-control-allow-origin: https://trusttaxllc.com
< access-control-allow-credentials: true
```

## ⚠️ Errores Comunes

### Error 1: CORS_ORIGINS no configurado

**Síntoma**: 
```
⚠️ [CORS] CORS_ORIGINS no está configurado en producción!
```

**Solución**: Agregar `CORS_ORIGINS` en Render.com

### Error 2: Origen no permitido

**Síntoma**:
```
⚠️ [CORS] Origen no permitido: https://trusttaxllc.com
```

**Solución**: Verificar que el dominio esté exactamente en `CORS_ORIGINS` (case-sensitive)

### Error 3: Espacios en CORS_ORIGINS

**Incorrecto**:
```
CORS_ORIGINS=https://trusttaxllc.com, https://www.trusttaxllc.com
```

**Correcto**:
```
CORS_ORIGINS=https://trusttaxllc.com,https://www.trusttaxllc.com
```

## 📝 Checklist

- [ ] Variable `CORS_ORIGINS` agregada en Render.com
- [ ] Dominios separados por comas (sin espacios)
- [ ] Protocolo `https://` incluido
- [ ] Sin barra final `/`
- [ ] Redeploy completado
- [ ] Logs muestran orígenes permitidos
- [ ] Navegador no muestra errores CORS

## 🔄 Mejoras Implementadas

1. **Logging mejorado**: Ahora muestra claramente qué orígenes están permitidos
2. **Manejo de errores**: Muestra warnings claros si `CORS_ORIGINS` no está configurado
3. **Validación**: Verifica que los orígenes estén correctamente formateados

## 📚 Referencia

- Configuración en: `apps/api/src/main.ts`
- Documentación: `CORS_CONFIGURACION.md`
