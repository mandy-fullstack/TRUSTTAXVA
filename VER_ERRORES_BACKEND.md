# 🔍 Cómo Ver los Errores del Backend

## 🚨 Problema: No puedes ver los logs del servidor

Si no puedes ver los logs del servidor, aquí hay varias formas de capturar el error:

## 📋 Método 1: Endpoint de Debug (Recomendado)

He creado un endpoint especial que devuelve el error directamente en la respuesta:

### Usar el endpoint de debug:
```bash
curl -X POST http://localhost:4000/debug/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tu-email@ejemplo.com","password":"tu-password"}'
```

Este endpoint devuelve el error completo en la respuesta JSON, incluyendo:
- Mensaje de error
- Stack trace
- Nombre del error
- Paso donde falló

## 📋 Método 2: Ver Logs del Servidor

### Si el servidor está corriendo en una terminal:
Los logs aparecerán directamente en esa terminal.

### Si el servidor está en background:
```bash
# Ver procesos de Node
ps aux | grep nest

# Ver logs si está corriendo con PM2
pm2 logs

# Ver logs si está corriendo con systemd
journalctl -u tu-servicio -f
```

## 📋 Método 3: Iniciar el Servidor Manualmente

```bash
cd apps/api
npm run start:dev
```

Esto iniciará el servidor en modo watch y verás todos los logs en la terminal.

## 📋 Método 4: Verificar que el Servidor Está Corriendo

```bash
# Verificar puerto 4000
lsof -i :4000

# Probar conexión
curl http://localhost:4000
```

## 🔧 Endpoint de Debug Creado

**URL**: `POST /debug/login`

**Body**:
```json
{
  "email": "tu-email@ejemplo.com",
  "password": "tu-password"
}
```

**Respuesta de éxito**:
```json
{
  "success": true,
  "result": {
    "access_token": "...",
    "user": { ... }
  }
}
```

**Respuesta de error**:
```json
{
  "success": false,
  "error": "Mensaje de error",
  "stack": "Stack trace completo",
  "errorName": "Nombre del error",
  "step": "validateUser" // o "login"
}
```

## ⚠️ Importante

El endpoint `/debug/login` está disponible **solo en desarrollo** y muestra información detallada del error. Úsalo para diagnosticar el problema.

## 🚀 Próximos Pasos

1. **Iniciar el servidor** (si no está corriendo):
   ```bash
   cd apps/api
   npm run start:dev
   ```

2. **Probar el endpoint de debug**:
   ```bash
   curl -X POST http://localhost:4000/debug/login \
     -H "Content-Type: application/json" \
     -d '{"email":"tu-email","password":"tu-password"}'
   ```

3. **O intentar login normal** y revisar la respuesta del error (ahora incluye más detalles en desarrollo)
