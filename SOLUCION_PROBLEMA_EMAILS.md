# ✅ Solución: Problema con Envío de Emails

## 🔍 Problema Identificado

Los emails **NO se estaban enviando** porque los **templates HTML no se encontraban** en la ruta correcta después de la compilación.

### Error Original
```
"error": "Failed to send password reset email: Failed to load email template: password-reset"
```

## 🎯 Causa Raíz

1. **Templates copiados a**: `dist/email/templates/` (sin `src/`)
2. **Código compilado en**: `dist/src/email/email.service.js`
3. **Búsqueda en**: `dist/src/email/templates/` (que no existe)

### Estructura de Directorios

**Antes (incorrecto)**:
```
dist/
  ├── src/
  │   └── email/
  │       └── email.service.js  (busca en ../templates/)
  └── email/
      └── templates/  (templates aquí, pero código busca en otro lugar)
```

**Después (correcto)**:
```
dist/
  ├── src/
  │   └── email/
  │       └── email.service.js  (busca en ../../email/templates/)
  └── email/
      └── templates/  ✅ (templates encontrados correctamente)
```

## ✅ Solución Implementada

### 1. Corrección de Ruta en `email.service.ts`

```typescript
constructor() {
  // Set templates directory path
  // In compiled code, __dirname points to dist/src/email/
  // But templates are copied to dist/email/templates/
  // So we need to go up one level to dist/email/templates/
  const isCompiled = __dirname.includes('dist');
  if (isCompiled) {
    // Compiled: dist/src/email/ -> dist/email/templates/
    this.templatesPath = path.join(__dirname, '..', '..', 'email', 'templates');
  } else {
    // Development: src/email/ -> src/email/templates/
    this.templatesPath = path.join(__dirname, 'templates');
  }
  // ... resto del código
}
```

### 2. Configuración de `nest-cli.json`

```json
{
  "compilerOptions": {
    "assets": [
      {
        "include": "email/templates/**/*",
        "outDir": "dist",
        "watchAssets": true
      }
    ]
  }
}
```

## 🧪 Verificación

### Endpoint de Prueba
```bash
POST http://localhost:4000/debug/test-email
Content-Type: application/json

{
  "email": "tu-email@ejemplo.com",
  "type": "password-reset"
}
```

### Respuesta de Éxito
```json
{
  "success": true,
  "emailType": "password-reset",
  "to": "test@example.com",
  "messageId": "<message-id>",
  "response": "250 2.0.0 OK ..."
}
```

## 📧 Tipos de Email Verificados

- ✅ `password-reset` - Email de reset de contraseña
- ✅ `verification` - Email de verificación
- ✅ `account-not-found` - Email de marketing
- ✅ `password-changed` - Confirmación de cambio
- ✅ `admin-invitation` - Invitación de admin
- ✅ `document-uploaded` - Notificación de documento

## 🔧 Cómo Probar Todos los Emails

```bash
# Verificar configuración SMTP
curl http://localhost:4000/debug/email-config

# Probar cada tipo de email
curl -X POST http://localhost:4000/debug/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"tu-email@ejemplo.com","type":"password-reset"}'

curl -X POST http://localhost:4000/debug/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"tu-email@ejemplo.com","type":"verification"}'

# ... etc para cada tipo
```

## 📝 Notas Importantes

1. **NO era un problema de CORS**: El problema era puramente de rutas de archivos
2. **Templates deben copiarse en build**: Asegurarse de que `nest-cli.json` está configurado correctamente
3. **Ruta relativa vs absoluta**: En desarrollo y producción, las rutas son diferentes
4. **Verificación SMTP**: El endpoint `/debug/email-config` confirma que SMTP está configurado

## 🚀 Próximos Pasos

1. ✅ Templates ahora se encuentran correctamente
2. ✅ Todos los tipos de email funcionan
3. ✅ SMTP está configurado y funcionando
4. ✅ Emails se envían realmente (no solo se loguean)

## ⚠️ Si Aún No Funciona

1. **Verificar que el servidor se reinició** después del build
2. **Verificar logs del servidor** para ver errores específicos
3. **Probar con `/debug/test-email`** para diagnóstico
4. **Verificar configuración SMTP** con `/debug/email-config`
